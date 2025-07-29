import express from 'express';
import { ContractService } from '../services/ContractService';
import { CreateContractRequest, UpdateContractRequest } from '../interfaces/Contract';
import logger from '../utils/Logger';

const router = express.Router();
const contractService = new ContractService();

// GET /api/contracts - Get all contracts
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all contracts');
    const contracts = await contractService.getAllContracts();
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
    
    const contract = await contractService.getContractById(id);
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
    if (!contractData.name || !contractData.network || !contractData.contractType) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, network, contractType' 
      });
    }
    
    const newContract = await contractService.createContract(contractData);
    res.status(201).json(newContract);
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// PUT /api/contracts/:id - Update contract
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateContractRequest = req.body;
    logger.info(`Updating contract with ID: ${id}`, updateData);
    
    const updatedContract = await contractService.updateContract(id, updateData);
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
    
    const deleted = await contractService.deleteContract(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// GET /api/contracts/network/:network - Get contracts by network
router.get('/network/:network', async (req, res) => {
  try {
    const { network } = req.params;
    logger.info(`Fetching contracts for network: ${network}`);
    
    const contracts = await contractService.getContractsByNetwork(network);
    res.json(contracts);
  } catch (error) {
    logger.error('Error fetching contracts by network:', error);
    res.status(500).json({ error: 'Failed to fetch contracts by network' });
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
    
    const contracts = await contractService.getContractsByType(type as "solidity" | "ink" | "both");
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
    
    const contracts = await contractService.searchContracts(query);
    res.json(contracts);
  } catch (error) {
    logger.error('Error searching contracts:', error);
    res.status(500).json({ error: 'Failed to search contracts' });
  }
});

export default router; 