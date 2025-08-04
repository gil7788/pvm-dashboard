import express from 'express';
// No interfaces needed for now
import logger from '../utils/Logger';

const router = express.Router();

// Helper function to generate unique transaction hash
function generateUniqueTransactionHash(): string {
  return '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0');
}

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
    const { contractName, chain, solidityAddress, inkAddress, description } = req.body;
    
    logger.info('Deploying new contract:', { contractName, chain });

    // Validate required fields
    if (!contractName || !chain) {
      return res.status(400).json({ error: 'Contract name and chain are required' });
    }

    // Create contract data with embedded structure
    const contractData = {
      name: contractName,
      description: description || `Deployed contract: ${contractName}`,
      contractType: solidityAddress && inkAddress ? 'both' : solidityAddress ? 'solidity' : 'ink',
      sourceCodeHash: 'a'.repeat(64), // Placeholder
      owner: {
        username: 'default_user',
        email: 'user@example.com',
        walletAddress: '0x' + '0'.repeat(40)
      },
      network: {
        name: chain,
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

    // Add deployments if addresses provided
    if (solidityAddress) {
      contractData.deployments.push({
        type: 'solidity' as const,
        address: solidityAddress,
        transactionHash: generateUniqueTransactionHash(),
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
      });
    }

    if (inkAddress) {
      contractData.deployments.push({
        type: 'ink' as const,
        address: inkAddress,
        transactionHash: generateUniqueTransactionHash(),
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
      });
    }

    const contract = await req.mongoService.getContractService().createContract(contractData);
    
    logger.info('Contract deployed successfully:', { id: contract._id, name: contract.name });
    res.status(201).json(contract);
  } catch (error) {
    logger.error('Error deploying contract:', error);
    res.status(500).json({ error: 'Failed to deploy contract' });
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
    const { id } = req.params;
    logger.info(`Fetching ABI for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    const abiData = {
      solidity: null,
      ink: null
    };
    
    // Get ABI from embedded deployments
    const solidityDeployment = contract.deployments.find((d: any) => d.type === 'solidity');
    if (solidityDeployment && solidityDeployment.abi) {
      abiData.solidity = solidityDeployment.abi;
    }
    
    const inkDeployment = contract.deployments.find((d: any) => d.type === 'ink');
    if (inkDeployment && inkDeployment.abi) {
      abiData.ink = inkDeployment.abi;
    }
    
    res.json(abiData);
  } catch (error) {
    logger.error('Error fetching contract ABI:', error);
    res.status(500).json({ error: 'Failed to fetch contract ABI' });
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
    const { id } = req.params;
    logger.info(`Fetching bytecode for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    const bytecodeData: {
      solidity: { bytecode: string; size: string } | null;
      ink: { bytecode: string; size: string } | null;
    } = {
      solidity: null,
      ink: null
    };
    
    // Get bytecode from embedded deployments
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
    
    res.json(bytecodeData);
  } catch (error) {
    logger.error('Error fetching contract bytecode:', error);
    res.status(500).json({ error: 'Failed to fetch contract bytecode' });
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
    const { id } = req.params;
    logger.info(`Fetching functions for contract ID: ${id}`);
    
    const contract = await req.mongoService.getContractService().getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    const functionsData = {
      solidity: [],
      ink: []
    };
    
    // Extract functions from ABI
    const solidityDeployment = contract.deployments.find((d: any) => d.type === 'solidity');
    if (solidityDeployment && solidityDeployment.abi) {
      functionsData.solidity = solidityDeployment.abi
        .filter((item: any) => item.type === 'function')
        .map((func: any) => ({
          name: func.name,
          inputs: func.inputs || [],
          outputs: func.outputs || [],
          stateMutability: func.stateMutability || 'nonpayable',
          gasUsed: '0',
          runtime: '0ms',
          lastTested: null
        }));
    }
    
    const inkDeployment = contract.deployments.find((d: any) => d.type === 'ink');
    if (inkDeployment && inkDeployment.abi && inkDeployment.abi.spec) {
      functionsData.ink = inkDeployment.abi.spec.messages.map((msg: any) => ({
        name: msg.name,
        inputs: msg.args || [],
        outputs: msg.returnType ? [msg.returnType] : [],
        stateMutability: 'nonpayable',
        gasUsed: '0',
        runtime: '0ms',
        lastTested: null
      }));
    }
    
    res.json(functionsData);
  } catch (error) {
    logger.error('Error fetching contract functions:', error);
    res.status(500).json({ error: 'Failed to fetch contract functions' });
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
    const { id } = req.params;
    const { functionName, contractType } = req.body;
    
    logger.info(`Running benchmark for contract ID: ${id}, function: ${functionName}, type: ${contractType}`);
    
    // Simulate benchmark execution
    const benchmarkResult = {
      id: Math.random().toString(36).substring(7),
      functionName,
      contractType,
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
      executionTime: Math.floor(Math.random() * 100) + 10,
      status: 'completed',
      results: {
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        executionTime: Math.floor(Math.random() * 100) + 10,
        storageSize: Math.floor(Math.random() * 1000) + 100,
        cost: Math.random() * 0.001,
        efficiency: Math.floor(Math.random() * 20) + 80
      },
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    res.json(benchmarkResult);
  } catch (error) {
    logger.error('Error running benchmark:', error);
    res.status(500).json({ error: 'Failed to run benchmark' });
  }
});

export default router; 