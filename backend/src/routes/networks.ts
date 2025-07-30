import express from 'express';
import { NetworkService } from '../services/NetworkService';
import { CreateNetworkRequest, UpdateNetworkRequest } from '../interfaces/Network';
import logger from '../utils/Logger';

const router = express.Router();
const networkService = new NetworkService();

// GET /api/networks - Get all networks
router.get('/', async (req, res) => {
  try {
    const networks = await networkService.getAllNetworks();
    res.json(networks);
  } catch (error) {
    logger.error('Error fetching all networks', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/networks/:id - Get network by ID
router.get('/:id', async (req, res) => {
  try {
    const network = await networkService.getNetworkById(req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }
    res.json(network);
  } catch (error) {
    logger.error('Error fetching network by ID', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/networks - Create new network
router.post('/', async (req, res) => {
  try {
    const networkData: CreateNetworkRequest = req.body;
    
    // Validate required fields
    if (!networkData.name || !networkData.chainId || !networkData.rpcUrl || !networkData.explorerUrl || !networkData.currency || !networkData.features) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, chainId, rpcUrl, explorerUrl, currency, features' 
      });
    }

    const newNetwork = await networkService.createNetwork(networkData);
    res.status(201).json(newNetwork);
  } catch (error) {
    logger.error('Error creating network', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/networks/:id - Update network
router.put('/:id', async (req, res) => {
  try {
    const updateData: UpdateNetworkRequest = req.body;
    const updatedNetwork = await networkService.updateNetwork(req.params.id, updateData);
    
    if (!updatedNetwork) {
      return res.status(404).json({ error: 'Network not found' });
    }
    
    res.json(updatedNetwork);
  } catch (error) {
    logger.error('Error updating network', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/networks/:id - Delete network
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await networkService.deleteNetwork(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Network not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting network', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/networks/status/:status - Get networks by status
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status as "active" | "inactive" | "maintenance";
    const networks = await networkService.getNetworksByStatus(status);
    res.json(networks);
  } catch (error) {
    logger.error('Error fetching networks by status', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/networks/feature/:feature - Get networks by feature
router.get('/feature/:feature', async (req, res) => {
  try {
    const feature = req.params.feature as "solidity" | "ink" | "evm" | "wasm";
    const networks = await networkService.getNetworksByFeature(feature);
    res.json(networks);
  } catch (error) {
    logger.error('Error fetching networks by feature', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/networks/search/:query - Search networks
router.get('/search/:query', async (req, res) => {
  try {
    const networks = await networkService.searchNetworks(req.params.query);
    res.json(networks);
  } catch (error) {
    logger.error('Error searching networks', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/networks/active - Get active networks
router.get('/active', async (req, res) => {
  try {
    const networks = await networkService.getActiveNetworks();
    res.json(networks);
  } catch (error) {
    logger.error('Error fetching active networks', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 