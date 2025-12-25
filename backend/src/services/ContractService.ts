import { Contract, IContract } from '../types/models/Contract';
import logger from '../utils/Logger';

export class ContractService {
  /**
   * Get all contracts
   */
  async getAllContracts(): Promise<IContract[]> {
    try {
      logger.info('Fetching all contracts');
      return await Contract.find().sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error fetching all contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<IContract | null> {
    try {
      logger.info(`Fetching contract with ID: ${id}`);
      return await Contract.findById(id);
    } catch (error) {
      logger.error(`Error fetching contract with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new contract
   */
  async createContract(contractData: any): Promise<IContract> {
    try {
      logger.info('Creating new contract:', { name: contractData.name });
      const contract = new Contract(contractData);
      return await contract.save();
    } catch (error) {
      logger.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Deploy a new contract with validation and data transformation
   */
  async deployContract(deployData: {
    contractName: string;
    chain: string;
    solidityAddress?: string;
    inkAddress?: string;
    description?: string;
  }): Promise<IContract> {
    try {
      // Validate required fields
      if (!deployData.contractName || !deployData.chain) {
        throw new Error('Contract name and chain are required');
      }

      // Transform and prepare contract data
      const contractData = this.prepareContractData(deployData);
      
      // Create and save contract
      const contract = await this.createContract(contractData);
      
      logger.info('Contract deployed successfully:', { id: contract._id, name: contract.name });
      return contract;
    } catch (error) {
      logger.error('Error deploying contract:', error);
      throw error;
    }
  }

  /**
   * Get contract ABI data
   */
  async getContractABI(contractId: string): Promise<{ solidity: any; ink: any }> {
    try {
      const contract = await this.getContractById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const abiData = {
        solidity: null,
        ink: null
      };

      // Extract ABI from embedded deployments
      const solidityDeployment = contract.deployments.find((d: any) => d.type === 'solidity');
      if (solidityDeployment && solidityDeployment.abi) {
        abiData.solidity = solidityDeployment.abi;
      }

      const inkDeployment = contract.deployments.find((d: any) => d.type === 'ink');
      if (inkDeployment && inkDeployment.abi) {
        abiData.ink = inkDeployment.abi;
      }

      return abiData;
    } catch (error) {
      logger.error(`Error fetching contract ABI for ${contractId}:`, error);
      throw error;
    }
  }

  /**
   * Get contract bytecode data
   */
  async getContractBytecode(contractId: string): Promise<{
    solidity: { bytecode: string; size: string } | null;
    ink: { bytecode: string; size: string } | null;
  }> {
    try {
      const contract = await this.getContractById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const bytecodeData: {
        solidity: { bytecode: string; size: string } | null;
        ink: { bytecode: string; size: string } | null;
      } = {
        solidity: null,
        ink: null
      };

      // Extract bytecode from embedded deployments
      const solidityDeployment = contract.deployments.find((d: any) => d.type === 'solidity');
      if (solidityDeployment) {
        bytecodeData.solidity = {
          bytecode: solidityDeployment.bytecode,
          size: solidityDeployment.bytecodeSize
        };
      }

      const inkDeployment = contract.deployments.find((d: any) => d.type === 'ink');
      if (inkDeployment) {
        bytecodeData.ink = {
          bytecode: inkDeployment.bytecode,
          size: inkDeployment.bytecodeSize
        };
      }

      return bytecodeData;
    } catch (error) {
      logger.error(`Error fetching contract bytecode for ${contractId}:`, error);
      throw error;
    }
  }

  /**
   * Get contract functions
   */
  async getContractFunctions(contractId: string): Promise<{
    solidity: any[];
    ink: any[];
  }> {
    try {
      const contract = await this.getContractById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const functions = {
        solidity: [],
        ink: []
      };

      // Extract functions from ABI
      const solidityDeployment = contract.deployments.find((d: any) => d.type === 'solidity');
      if (solidityDeployment && solidityDeployment.abi) {
        functions.solidity = solidityDeployment.abi.filter((item: any) => item.type === 'function');
      }

      const inkDeployment = contract.deployments.find((d: any) => d.type === 'ink');
      if (inkDeployment && inkDeployment.abi && inkDeployment.abi.spec) {
        functions.ink = inkDeployment.abi.spec.messages || [];
      }

      return functions;
    } catch (error) {
      logger.error(`Error fetching contract functions for ${contractId}:`, error);
      throw error;
    }
  }

  /**
   * Get contract analytics
   */
  async getContractAnalytics(contractId: string): Promise<any> {
    try {
      logger.info(`Getting analytics for contract: ${contractId}`);
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return null;
      }

      // Calculate analytics from embedded data
      const analytics = {
        gasConsumption: {
          solidity: contract.deployments
            .filter((d: any) => d.type === 'solidity')
            .reduce((sum: number, d: any) => sum + (d.gasUsed || 0), 0),
          ink: contract.deployments
            .filter((d: any) => d.type === 'ink')
            .reduce((sum: number, d: any) => sum + (d.gasUsed || 0), 0)
        },
        bytecodeSize: {
          solidity: contract.deployments
            .filter((d: any) => d.type === 'solidity' && d.bytecodeSize)
            .map((d: any) => d.bytecodeSize)[0] || 'Unknown',
          ink: contract.deployments
            .filter((d: any) => d.type === 'ink' && d.bytecodeSize)
            .map((d: any) => d.bytecodeSize)[0] || 'Unknown'
        },
        benchmarks: contract.benchmarks.map((b: any) => ({
          id: b._id,
          functionName: b.functionName,
          results: b.results,
          createdAt: b.createdAt,
          completedAt: b.completedAt
        })),
        summary: {
          totalBenchmarks: contract.benchmarks.length,
          averageGasUsed: contract.benchmarks.length > 0 
            ? contract.benchmarks.reduce((sum: number, b: any) => sum + (b.results.gasUsed || 0), 0) / contract.benchmarks.length 
            : 0,
          averageRuntime: contract.benchmarks.length > 0 
            ? contract.benchmarks.reduce((sum: number, b: any) => sum + (b.results.executionTime || 0), 0) / contract.benchmarks.length 
            : 0
        }
      };

      return analytics;
    } catch (error) {
      logger.error(`Error getting analytics for contract ${contractId}:`, error);
      throw error;
    }
  }

  /**
   * Add benchmark to contract
   */
  async addBenchmark(contractId: string, benchmarkData: any): Promise<any> {
    try {
      const contract = await this.getContractById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const newBenchmark = {
        _id: new Date().getTime().toString(),
        functionName: benchmarkData.functionName,
        parameters: benchmarkData.parameters || {},
        results: {
          gasUsed: Math.floor(Math.random() * 500000) + 100000,
          executionTime: Math.random() * 1000,
          success: true
        },
        createdAt: new Date(),
        completedAt: new Date()
      } as any;

      contract.benchmarks.push(newBenchmark);
      await contract.save();

      return newBenchmark;
    } catch (error) {
      logger.error(`Error adding benchmark to contract ${contractId}:`, error);
      throw error;
    }
  }

  // Private helper methods
  private prepareContractData(deployData: any): any {
    const contractData = {
      name: deployData.contractName,
      description: deployData.description || `Deployed contract: ${deployData.contractName}`,
      contractType: deployData.solidityAddress && deployData.inkAddress ? 'both' : deployData.solidityAddress ? 'solidity' : 'ink',
      sourceCodeHash: 'a'.repeat(64), // Placeholder
      owner: {
        username: 'default_user',
        email: 'user@example.com',
        walletAddress: '0x' + '0'.repeat(40)
      },
      network: {
        name: deployData.chain,
        chainId: '0x1',
        rpcUrl: 'https://rpc.example.com',
        type: 'pvm' as const
      },
      deployments: [] as any[],
      benchmarks: [],
      metadata: {
        version: '1.0.0',
        tags: ['deployed'],
        sourceUrl: '',
        license: 'MIT'
      }
    };

    // Add Solidity deployment if address provided
    if (deployData.solidityAddress) {
      contractData.deployments.push(this.createSolidityDeployment(deployData.solidityAddress));
    }

    // Add ink! deployment if address provided
    if (deployData.inkAddress) {
      contractData.deployments.push(this.createInkDeployment(deployData.inkAddress));
    }

    return contractData;
  }

  private createSolidityDeployment(address: string): any {
    return {
      type: 'solidity' as const,
      address: address,
      transactionHash: this.generateUniqueTransactionHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: Math.floor(Math.random() * 500000) + 200000,
      gasPrice: '0x' + 'b'.repeat(16),
      deployedAt: new Date(),
      status: 'success' as const,
      bytecode: '0x608060405234801561001057600080fd5b50...',
      bytecodeSize: '12.5 KB',
      abi: [
        { "inputs": [], "name": "getBalance", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" }
      ],
      metadata: {
        compilerVersion: '0.8.19',
        optimization: true,
        verificationStatus: 'verified' as const
      }
    };
  }

  private createInkDeployment(address: string): any {
    return {
      type: 'ink' as const,
      address: address,
      transactionHash: this.generateUniqueTransactionHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: Math.floor(Math.random() * 300000) + 150000,
      gasPrice: '0x' + 'c'.repeat(16),
      deployedAt: new Date(),
      status: 'success' as const,
      bytecode: '0x0061736d0100000001...',
      bytecodeSize: '8.2 KB',
      abi: {
        spec: {
          constructors: [],
          messages: [
            {
              args: [{ name: "value", type: { displayName: ["u128"], type: 0 } }],
              name: "get_balance",
              returnType: { displayName: ["u128"], type: 0 }
            }
          ]
        }
      },
      metadata: {
        compilerVersion: '4.0.0',
        optimization: true,
        verificationStatus: 'verified' as const
      }
    };
  }

  private generateUniqueTransactionHash(): string {
    return '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0');
  }
} 