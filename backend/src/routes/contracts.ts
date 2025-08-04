import express from 'express';
// No interfaces needed for now
import logger from '../utils/Logger';

const router = express.Router();



// Type for requests with mongoService
type RequestWithService = express.Request & {
  mongoService: any;
}

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts
 *     description: Returns a list of all contracts in the system
 *     tags: [Contracts]
 */
router.get('/', async (req: any, res) => {
  try {
    logger.info('Fetching all contracts');
    const contracts = await req.mongoService.getContractService().getAllContracts();
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     description: Returns a specific contract by its ID
 *     tags: [Contracts]
 */
router.get('/:id', async (req: any, res) => {
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

/**
 * @swagger
 * /api/contracts/deploy:
 *   post:
 *     summary: Deploy a new contract
 *     description: Creates a new contract with deployment data
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractName
 *               - chain
 *             properties:
 *               contractName:
 *                 type: string
 *               chain:
 *                 type: string
 *               solidityAddress:
 *                 type: string
 *               inkAddress:
 *                 type: string
 *               description:
 *                 type: string
 */
router.post('/deploy', async (req: any, res) => {
  try {
    const contract = await req.mongoService.getContractService().deployContract(req.body);
    res.status(201).json(contract);
  } catch (error: any) {
    if (error.message === 'Contract name and chain are required') {
      res.status(400).json({ error: error.message });
    } else {
      logger.error('Error deploying contract:', error);
      res.status(500).json({ error: 'Failed to deploy contract' });
    }
  }
});

// ===== AUXILIARY ROUTES =====

/**
 * @swagger
 * /api/contracts/{id}/abi:
 *   get:
 *     summary: Get contract ABI
 *     description: Returns the ABI for both Solidity and ink! contracts
 *     tags: [Contracts]
 */
router.get('/:id/abi', async (req: any, res) => {
  try {
    const abiData = await req.mongoService.getContractService().getContractABI(req.params.id);
    res.json(abiData);
  } catch (error: any) {
    if (error.message === 'Contract not found') {
      res.status(404).json({ error: error.message });
    } else {
      logger.error('Error fetching contract ABI:', error);
      res.status(500).json({ error: 'Failed to fetch contract ABI' });
    }
  }
});

/**
 * @swagger
 * /api/contracts/{id}/bytecode:
 *   get:
 *     summary: Get contract bytecode
 *     description: Returns the bytecode for both Solidity and ink! contracts
 *     tags: [Contracts]
 */
router.get('/:id/bytecode', async (req: any, res) => {
  try {
    const bytecodeData = await req.mongoService.getContractService().getContractBytecode(req.params.id);
    res.json(bytecodeData);
  } catch (error: any) {
    if (error.message === 'Contract not found') {
      res.status(404).json({ error: error.message });
    } else {
      logger.error('Error fetching contract bytecode:', error);
      res.status(500).json({ error: 'Failed to fetch contract bytecode' });
    }
  }
});

/**
 * @swagger
 * /api/contracts/{id}/functions:
 *   get:
 *     summary: Get contract functions
 *     description: Returns the functions available in the contract
 *     tags: [Contracts]
 */
router.get('/:id/functions', async (req: any, res) => {
  try {
    const functions = await req.mongoService.getContractService().getContractFunctions(req.params.id);
    res.json(functions);
  } catch (error: any) {
    if (error.message === 'Contract not found') {
      res.status(404).json({ error: error.message });
    } else {
      logger.error('Error fetching contract functions:', error);
      res.status(500).json({ error: 'Failed to fetch contract functions' });
    }
  }
});

/**
 * @swagger
 * /api/contracts/{id}/analytics:
 *   get:
 *     summary: Get contract analytics
 *     description: Returns analytics data for the contract
 *     tags: [Contracts]
 */
router.get('/:id/analytics', async (req: any, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching analytics for contract ID: ${id}`);
    
    const analytics = await req.mongoService.getContractService().getContractAnalytics(id);
    if (!analytics) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching contract analytics:', error);
    res.status(500).json({ error: 'Failed to fetch contract analytics' });
  }
});

/**
 * @swagger
 * /api/contracts/{id}/benchmark:
 *   post:
 *     summary: Run benchmark
 *     description: Executes a benchmark test on the contract
 *     tags: [Contracts]
 */
router.post('/:id/benchmark', async (req: any, res) => {
  try {
    const benchmark = await req.mongoService.getContractService().addBenchmark(req.params.id, req.body);
    res.json(benchmark);
  } catch (error: any) {
    if (error.message === 'Contract not found') {
      res.status(404).json({ error: error.message });
    } else {
      logger.error('Error running benchmark:', error);
      res.status(500).json({ error: 'Failed to run benchmark' });
    }
  }
});

export default router; 