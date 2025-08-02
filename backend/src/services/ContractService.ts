import { Contract, IContract } from '../models/Contract';
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
} 