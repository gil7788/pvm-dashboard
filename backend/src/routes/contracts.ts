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

export default router; 