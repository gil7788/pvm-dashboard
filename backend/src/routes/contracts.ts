import express from 'express';
import { CreateContractRequest, UpdateContractRequest } from '../interfaces/Contract';
import logger from '../utils/Logger';

const router = express.Router();

// Helper function to generate unique transaction hash
function generateUniqueTransactionHash(): string {
  return '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0');
}

// Type for requests with mongoService
interface RequestWithService extends express.Request {
  mongoService: any;
}

// GET /api/contracts - Get all contracts
router.get('/', async (req: RequestWithService, res) => {
  try {
    logger.info('Fetching all contracts');
    const contracts = await req.mongoService.getContractService().getAllContracts();
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// GET /api/contracts/:id - Get contract by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching contract with ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// POST /api/contracts - Create new contract
router.post('/', async (req, res) => {
  try {
    const contractData: CreateContractRequest = req.body;
    logger.info('Creating new contract:', contractData);
    
    // Validate required fields
    if (!contractData.name || !contractData.ownerId || !contractData.networkId || !contractData.contractType) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, ownerId, networkId, contractType' 
      });
    }
    
    const newContract = await req.mongoService.getContractService().createContract(contractData);
    res.status(201).json(newContract);
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// POST /api/contracts/deploy - Create contract from frontend deployment form
router.post('/deploy', async (req, res) => {
  try {
    const { contractName, chain, solidityAddress, inkAddress, description } = req.body;
    logger.info('Creating contract from deployment form:', { contractName, chain, solidityAddress, inkAddress });
    
    // Validate required fields
    if (!contractName || !chain) {
      return res.status(400).json({ 
        error: 'Missing required fields: contractName, chain' 
      });
    }
    
    // Determine contract type based on addresses provided
    let contractType: 'solidity' | 'ink' | 'both' = 'solidity';
    if (solidityAddress && inkAddress) {
      contractType = 'both';
    } else if (inkAddress && !solidityAddress) {
      contractType = 'ink';
    }
    
    // Get default user and network (for demo purposes)
    const { User } = await import('../models/User');
    const { Network } = await import('../models/Network');
    
    const defaultUser = await User.findOne();
    const network = await Network.findOne({ name: { $regex: new RegExp(`^${chain}$`, 'i') } });
    
    if (!defaultUser) {
      return res.status(500).json({ error: 'No users found in database' });
    }
    
    if (!network) {
      return res.status(400).json({ error: `Network '${chain}' not found` });
    }
    
    // Create contract data with denormalized info
    const contractData: CreateContractRequest = {
      name: contractName,
      ownerId: (defaultUser._id as any).toString(),
      networkId: (network._id as any).toString(),
      contractType,
      metadata: {
        description: description || `Contract deployed on ${chain}`,
        version: '1.0.0',
        tags: ['deployed', 'frontend'],
        sourceUrl: 'https://github.com/example/contracts'
      }
    };
    
    // Create contract with denormalized data directly
    const contract = new (await import('../models/Contract')).Contract({
      name: contractName,
      ownerId: defaultUser._id,
      networkId: network._id,
      contractType,
      sourceCodeHash: 'a'.repeat(64), // Generate a dummy hash
      // Denormalized data
      ownerInfo: {
        username: defaultUser.username,
        email: defaultUser.email
      },
      networkInfo: {
        name: network.name,
        chainId: network.chainId
      },
      metadata: {
        description: description || `Contract deployed on ${chain}`,
        version: '1.0.0',
        tags: ['deployed', 'frontend'],
        sourceUrl: 'https://github.com/example/contracts'
      }
    });
    
    const newContract = await contract.save();
    
    // If addresses were provided, create deployment records
    if (solidityAddress || inkAddress) {
      const { Deployment } = await import('../models/Deployment');
      const deployments = [];
      
      if (solidityAddress) {
        deployments.push({
          contractId: (newContract as any)._id,
          networkId: (network._id as any),
          deployerId: (defaultUser._id as any),
          deploymentType: 'solidity' as const,
          address: solidityAddress,
          transactionHash: generateUniqueTransactionHash(),
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          gasUsed: Math.floor(Math.random() * 500000) + 100000,
          gasPrice: '0x' + 'b'.repeat(16),
          deployedAt: new Date(),
          status: 'success' as const,
          metadata: {
            compilerVersion: '0.8.19',
            optimization: true,
            verificationStatus: 'verified' as const
          }
        });
      }
      
      if (inkAddress) {
        deployments.push({
          contractId: (newContract as any)._id,
          networkId: (network._id as any),
          deployerId: (defaultUser._id as any),
          deploymentType: 'ink' as const,
          address: inkAddress,
          transactionHash: generateUniqueTransactionHash(),
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          gasUsed: Math.floor(Math.random() * 500000) + 100000,
          gasPrice: '0x' + 'b'.repeat(16),
          deployedAt: new Date(),
          status: 'success' as const,
          metadata: {
            compilerVersion: '4.0.0',
            optimization: true,
            verificationStatus: 'verified' as const
          }
        });
      }
      
      await Deployment.insertMany(deployments);
    }
    
    res.status(201).json({
      success: true,
      contract: newContract,
      message: 'Contract created successfully'
    });
  } catch (error) {
    logger.error('Error creating contract from deployment form:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// PUT /api/contracts/:id - Update contract
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateContractRequest = req.body;
    logger.info(`Updating contract with ID: ${id}`, updateData);
    
    const updatedContract = await req.mongoService.getContractService().updateContract(id, updateData);
    if (!updatedContract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(updatedContract);
  } catch (error) {
    logger.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// DELETE /api/contracts/:id - Delete contract
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting contract with ID: ${id}`);
    
    const deleted = await req.mongoService.getContractService().deleteContract(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// GET /api/contracts/network/:networkId - Get contracts by network ID
router.get('/network/:networkId', async (req, res) => {
  try {
    const { networkId } = req.params;
    logger.info(`Fetching contracts for network ID: ${networkId}`);
    
    const contracts = await req.mongoService.getContractService().getContractsByNetwork(networkId);
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts by network:', error);
    res.status(500).json({ error: 'Failed to fetch contracts by network' });
  }
});

// GET /api/contracts/owner/:ownerId - Get contracts by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    logger.info(`Fetching contracts for owner ID: ${ownerId}`);
    
    const contracts = await req.mongoService.getContractService().getContractsByOwner(ownerId);
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts by owner:', error);
    res.status(500).json({ error: 'Failed to fetch contracts by owner' });
  }
});

// GET /api/contracts/tag/:tag - Get contracts by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    logger.info(`Fetching contracts with tag: ${tag}`);
    
    const contracts = await req.mongoService.getContractService().getContractsByTag(tag);
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts by tag:', error);
    res.status(500).json({ error: 'Failed to fetch contracts by tag' });
  }
});

// GET /api/contracts/type/:type - Get contracts by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    logger.info(`Fetching contracts of type: ${type}`);
    
    if (!['solidity', 'ink', 'both'].includes(type)) {
      return res.status(400).json({ error: 'Invalid contract type' });
    }
    
    const contracts = await req.mongoService.getContractService().getContractsByType(type as "solidity" | "ink" | "both");
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts by type:', error);
    res.status(500).json({ error: 'Failed to fetch contracts by type' });
  }
});

// GET /api/contracts/search/:query - Search contracts
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    logger.info(`Searching contracts with query: ${query}`);
    
    const contracts = await req.mongoService.getContractService().searchContracts(query);
    res.json(contracts);
  } catch (error) {
    logger.error('Error searching contracts:', error);
    res.status(500).json({ error: 'Failed to search contracts' });
  }
});

// GET /api/contracts/:id/abi - Get contract ABI (Solidity and ink!)
router.get('/:id/abi', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching ABI for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Get deployments for this contract to extract ABI
    const { Deployment } = await import('../models/Deployment');
    const { Types } = await import('mongoose');
    const deployments = await Deployment.find({ contractId: new Types.ObjectId(id) }).sort({ deployedAt: -1 });
    
    const abiData = {
      solidity: null,
      ink: null
    };
    
    // Find latest Solidity deployment
    const latestSolidityDeployment = deployments.find(d => d.deploymentType === 'solidity');
    if (latestSolidityDeployment && latestSolidityDeployment.metadata?.abi) {
      abiData.solidity = latestSolidityDeployment.metadata.abi;
    }
    
    // Find latest ink! deployment
    const latestInkDeployment = deployments.find(d => d.deploymentType === 'ink');
    if (latestInkDeployment && latestInkDeployment.metadata?.abi) {
      abiData.ink = latestInkDeployment.metadata.abi;
    }
    
    res.json(abiData);
  } catch (error) {
    logger.error('Error fetching contract ABI:', error);
    res.status(500).json({ error: 'Failed to fetch contract ABI' });
  }
});

// GET /api/contracts/:id/bytecode - Get contract bytecode (Solidity and ink!)
router.get('/:id/bytecode', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching bytecode for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Get deployments for this contract to extract bytecode
    const { Deployment } = await import('../models/Deployment');
    const { Types } = await import('mongoose');
    const deployments = await Deployment.find({ contractId: new Types.ObjectId(id) }).sort({ deployedAt: -1 });
    
    const bytecodeData: {
      solidity: { bytecode: string; size: string } | null;
      ink: { bytecode: string; size: string } | null;
    } = {
      solidity: null,
      ink: null
    };
    
    // Find latest Solidity deployment
    const latestSolidityDeployment = deployments.find(d => d.deploymentType === 'solidity');
    if (latestSolidityDeployment && latestSolidityDeployment.metadata?.bytecode) {
      bytecodeData.solidity = {
        bytecode: latestSolidityDeployment.metadata.bytecode,
        size: latestSolidityDeployment.metadata.bytecodeSize || 'Unknown'
      };
    }
    
    // Find latest ink! deployment
    const latestInkDeployment = deployments.find(d => d.deploymentType === 'ink');
    if (latestInkDeployment && latestInkDeployment.metadata?.bytecode) {
      bytecodeData.ink = {
        bytecode: latestInkDeployment.metadata.bytecode,
        size: latestInkDeployment.metadata.bytecodeSize || 'Unknown'
      };
    }
    
    res.json(bytecodeData);
  } catch (error) {
    logger.error('Error fetching contract bytecode:', error);
    res.status(500).json({ error: 'Failed to fetch contract bytecode' });
  }
});

// GET /api/contracts/:id/functions - Get contract functions for benchmarking
router.get('/:id/functions', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching functions for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Get deployments for this contract to extract functions
    const { Deployment } = await import('../models/Deployment');
    const { Types } = await import('mongoose');
    const deployments = await Deployment.find({ contractId: new Types.ObjectId(id) }).sort({ deployedAt: -1 });
    
    const functionsData = {
      solidity: [],
      ink: []
    };
    
    // Find latest Solidity deployment
    const latestSolidityDeployment = deployments.find(d => d.deploymentType === 'solidity');
    if (latestSolidityDeployment && latestSolidityDeployment.metadata?.abi) {
      const solidityAbi = latestSolidityDeployment.metadata.abi;
      functionsData.solidity = solidityAbi
        .filter((item: any) => item.type === 'function')
        .map((func: any) => ({
          name: func.name,
          inputs: func.inputs || [],
          outputs: func.outputs || [],
          stateMutability: func.stateMutability || 'nonpayable',
          gasUsed: '0', // Will be populated by benchmarks
          runtime: '0ms', // Will be populated by benchmarks
          lastTested: null
        }));
    }
    
    // Find latest ink! deployment
    const latestInkDeployment = deployments.find(d => d.deploymentType === 'ink');
    if (latestInkDeployment && latestInkDeployment.metadata?.abi) {
      const inkAbi = latestInkDeployment.metadata.abi;
      if (inkAbi.spec && inkAbi.spec.messages) {
        functionsData.ink = inkAbi.spec.messages.map((msg: any) => ({
          name: msg.name,
          inputs: msg.args || [],
          outputs: msg.returnType ? [msg.returnType] : [],
          stateMutability: 'nonpayable',
          gasUsed: '0', // Will be populated by benchmarks
          runtime: '0ms', // Will be populated by benchmarks
          lastTested: null
        }));
      }
    }
    
    res.json(functionsData);
  } catch (error) {
    logger.error('Error fetching contract functions:', error);
    res.status(500).json({ error: 'Failed to fetch contract functions' });
  }
});

// POST /api/contracts/:id/benchmark - Run benchmark for a specific function
router.post('/:id/benchmark', async (req, res) => {
  try {
    const { id } = req.params;
    const { functionName, contractType, inputs } = req.body;
    logger.info(`Running benchmark for contract ID: ${id}, function: ${functionName}, type: ${contractType}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // For now, return mock benchmark results
    // TODO: Implement actual PVM dry-run functionality
    const mockResults = {
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
      runtime: Math.floor(Math.random() * 100) + 10,
      success: true,
      error: null
    };
    
    // Create benchmark record
    const { Benchmark } = await import('../models/Benchmark');
    const { Deployment } = await import('../models/Deployment');
    
    // Find the deployment for this contract type
    const { Types } = await import('mongoose');
    const deployment = await Deployment.findOne({ 
      contractId: new Types.ObjectId(id), 
      deploymentType: contractType 
    });
    
    if (deployment) {
      const benchmark = new Benchmark({
        contractId: id,
        deploymentId: deployment._id,
        requestedBy: 'default-user', // TODO: Get from auth
        benchmarkType: 'gas',
        results: {
          gasUsed: mockResults.gasUsed,
          executionTime: mockResults.runtime,
          storageSize: 0,
          cost: mockResults.gasUsed * 0.000000001, // Mock gas price
          efficiency: 100 - (mockResults.gasUsed / 100000) * 100
        },
        parameters: {
          inputSize: JSON.stringify(inputs).length,
          complexity: 'medium',
          iterations: 1
        },
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      });
      
      await benchmark.save();
    }
    
    res.json({
      success: true,
      results: mockResults,
      message: 'Benchmark completed successfully'
    });
  } catch (error) {
    logger.error('Error running benchmark:', error);
    res.status(500).json({ error: 'Failed to run benchmark' });
  }
});

// GET /api/contracts/:id/analytics - Get analytics and comparison data
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching analytics for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Get benchmarks for this contract
    const { Benchmark } = await import('../models/Benchmark');
    const benchmarks = await Benchmark.find({ contractId: id }).sort({ createdAt: -1 });
    
    // Get deployments for gas consumption data
    const { Deployment } = await import('../models/Deployment');
    const { Types } = await import('mongoose');
    const deployments = await Deployment.find({ contractId: new Types.ObjectId(id) }).sort({ deployedAt: -1 });
    
    const analyticsData = {
      gasConsumption: {
        solidity: deployments.find(d => d.deploymentType === 'solidity')?.gasUsed || 0,
        ink: deployments.find(d => d.deploymentType === 'ink')?.gasUsed || 0
      },
      bytecodeSize: {
        solidity: deployments.find(d => d.deploymentType === 'solidity')?.metadata?.bytecodeSize || 'Unknown',
        ink: deployments.find(d => d.deploymentType === 'ink')?.metadata?.bytecodeSize || 'Unknown'
      },
      benchmarks: benchmarks.map(b => ({
        id: b._id,
        type: b.benchmarkType,
        results: b.results,
        createdAt: b.createdAt,
        completedAt: b.completedAt
      })),
      summary: {
        totalBenchmarks: benchmarks.length,
        averageGasUsed: benchmarks.length > 0 
          ? benchmarks.reduce((sum, b) => sum + (b.results.gasUsed || 0), 0) / benchmarks.length 
          : 0,
        averageRuntime: benchmarks.length > 0 
          ? benchmarks.reduce((sum, b) => sum + (b.results.executionTime || 0), 0) / benchmarks.length 
          : 0
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    logger.error('Error fetching contract analytics:', error);
    res.status(500).json({ error: 'Failed to fetch contract analytics' });
  }
});

export default router; 