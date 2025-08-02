import express from 'express';
import { CreateDeploymentRequest, UpdateDeploymentRequest } from '../interfaces/Deployment';
import logger from '../utils/Logger';

const router = express.Router();

// GET /api/deployments - Get all deployments
router.get('/', async (req: any, res) => {
  try {
    logger.info('Fetching all deployments');
    const deployments = await req.mongoService.getDeploymentService().getAllDeployments();
    res.json(deployments);
  } catch (error) {
    logger.error('Error fetching deployments:', error);
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

// GET /api/deployments/:id - Get deployment by ID
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching deployment with ID: ${id}`);
    
    const deployment = await req.mongoService.getDeploymentService().getDeploymentById(id);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.json(deployment);
  } catch (error) {
    logger.error('Error fetching deployment:', error);
    res.status(500).json({ error: 'Failed to fetch deployment' });
  }
});

// POST /api/deployments - Create new deployment
router.post('/', async (req: any, res) => {
  try {
    const deploymentData: CreateDeploymentRequest = req.body;
    logger.info('Creating new deployment:', deploymentData);
    
    // Validate required fields
    if (!deploymentData.contractId || !deploymentData.networkId || !deploymentData.deployerId || 
        !deploymentData.deploymentType || !deploymentData.address || !deploymentData.transactionHash) {
      return res.status(400).json({ 
        error: 'Missing required fields: contractId, networkId, deployerId, deploymentType, address, transactionHash' 
      });
    }
    
    const newDeployment = await req.mongoService.getDeploymentService().createDeployment(deploymentData);
    res.status(201).json(newDeployment);
  } catch (error) {
    logger.error('Error creating deployment:', error);
    res.status(500).json({ error: 'Failed to create deployment' });
  }
});

// PUT /api/deployments/:id - Update deployment
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateDeploymentRequest = req.body;
    logger.info(`Updating deployment with ID: ${id}`, updateData);
    
    const updatedDeployment = await req.mongoService.getDeploymentService().updateDeployment(id, updateData);
    if (!updatedDeployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.json(updatedDeployment);
  } catch (error) {
    logger.error('Error updating deployment:', error);
    res.status(500).json({ error: 'Failed to update deployment' });
  }
});

// DELETE /api/deployments/:id - Delete deployment
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting deployment with ID: ${id}`);
    
    const deleted = await req.mongoService.getDeploymentService().deleteDeployment(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting deployment:', error);
    res.status(500).json({ error: 'Failed to delete deployment' });
  }
});

// GET /api/deployments/contract/:contractId - Get deployments by contract
router.get('/contract/:contractId', async (req: any, res) => {
  try {
    const { contractId } = req.params;
    logger.info(`Fetching deployments for contract ID: ${contractId}`);
    
    const deployments = await req.mongoService.getDeploymentService().getDeploymentsByContract(contractId);
    res.json(deployments);
  } catch (error) {
    logger.error('Error fetching deployments by contract:', error);
    res.status(500).json({ error: 'Failed to fetch deployments by contract' });
  }
});

// GET /api/deployments/network/:networkId - Get deployments by network
router.get('/network/:networkId', async (req: any, res) => {
  try {
    const { networkId } = req.params;
    logger.info(`Fetching deployments for network ID: ${networkId}`);
    
    const deployments = await req.mongoService.getDeploymentService().getDeploymentsByNetwork(networkId);
    res.json(deployments);
  } catch (error) {
    logger.error('Error fetching deployments by network:', error);
    res.status(500).json({ error: 'Failed to fetch deployments by network' });
  }
});

// GET /api/deployments/deployer/:deployerId - Get deployments by deployer
router.get('/deployer/:deployerId', async (req: any, res) => {
  try {
    const { deployerId } = req.params;
    logger.info(`Fetching deployments for deployer ID: ${deployerId}`);
    
    const deployments = await req.mongoService.getDeploymentService().getDeploymentsByDeployer(deployerId);
    res.json(deployments);
  } catch (error) {
    logger.error('Error fetching deployments by deployer:', error);
    res.status(500).json({ error: 'Failed to fetch deployments by deployer' });
  }
});

// GET /api/deployments/type/:type - Get deployments by type
router.get('/type/:type', async (req: any, res) => {
  try {
    const { type } = req.params;
    logger.info(`Fetching deployments of type: ${type}`);
    
    if (!['solidity', 'ink'].includes(type)) {
      return res.status(400).json({ error: 'Invalid deployment type' });
    }
    
    const deployments = await req.mongoService.getDeploymentService().getDeploymentsByType(type as 'solidity' | 'ink');
    res.json(deployments);
  } catch (error) {
    logger.error('Error fetching deployments by type:', error);
    res.status(500).json({ error: 'Failed to fetch deployments by type' });
  }
});

// GET /api/deployments/status/:status - Get deployments by status
router.get('/status/:status', async (req: any, res) => {
  try {
    const { status } = req.params;
    logger.info(`Fetching deployments with status: ${status}`);
    
    if (!['success', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid deployment status' });
    }
    
    const deployments = await req.mongoService.getDeploymentService().getDeploymentsByStatus(status as 'success' | 'failed' | 'pending');
    res.json(deployments);
  } catch (error) {
    logger.error('Error fetching deployments by status:', error);
    res.status(500).json({ error: 'Failed to fetch deployments by status' });
  }
});

// PUT /api/deployments/:id/verify - Update verification status
router.put('/:id/verify', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;
    logger.info(`Updating verification status for deployment ${id} to: ${verificationStatus}`);
    
    if (!['verified', 'unverified', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }
    
    const updatedDeployment = await req.mongoService.getDeploymentService().verifyDeployment(id, verificationStatus);
    if (!updatedDeployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.json(updatedDeployment);
  } catch (error) {
    logger.error('Error updating deployment verification:', error);
    res.status(500).json({ error: 'Failed to update deployment verification' });
  }
});

export default router;