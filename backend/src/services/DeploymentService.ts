import { Deployment, IDeployment } from '../models/Deployment';
import { CreateDeploymentRequest, UpdateDeploymentRequest, Deployment as DeploymentInterface } from '../interfaces/Deployment';
import logger from '../utils/Logger';

export class DeploymentService {
  private mapDeploymentToInterface(deployment: IDeployment): DeploymentInterface {
    return {
      id: (deployment._id as any).toString(),
      contractId: (deployment.contractId as any).toString(),
      networkId: (deployment.networkId as any).toString(),
      deployerId: (deployment.deployerId as any).toString(),
      deploymentType: deployment.deploymentType,
      address: deployment.address,
      transactionHash: deployment.transactionHash,
      blockNumber: deployment.blockNumber,
      gasUsed: deployment.gasUsed,
      gasPrice: deployment.gasPrice,
      deployedAt: deployment.deployedAt.toISOString(),
      status: deployment.status,
      metadata: deployment.metadata,
      createdAt: deployment.createdAt.toISOString(),
      updatedAt: deployment.updatedAt.toISOString()
    };
  }

  async getAllDeployments(): Promise<DeploymentInterface[]> {
    try {
      logger.info('Fetching all deployments from database');
      const deployments = await Deployment.find()
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email')
        .sort({ createdAt: -1 });
      
      return deployments.map(deployment => this.mapDeploymentToInterface(deployment));
    } catch (error) {
      logger.error('Error fetching all deployments:', error);
      throw error;
    }
  }

  async getDeploymentById(id: string): Promise<DeploymentInterface | null> {
    try {
      logger.info(`Fetching deployment with ID: ${id}`);
      const deployment = await Deployment.findById(id)
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email');
      
      if (!deployment) {
        logger.warn(`Deployment with ID ${id} not found`);
        return null;
      }

      return this.mapDeploymentToInterface(deployment);
    } catch (error) {
      logger.error(`Error fetching deployment with ID ${id}:`, error);
      throw error;
    }
  }

  async createDeployment(deploymentData: CreateDeploymentRequest): Promise<DeploymentInterface> {
    try {
      logger.info('Creating new deployment:', { data: deploymentData });
      
      const deployment = new Deployment({
        contractId: deploymentData.contractId,
        networkId: deploymentData.networkId,
        deployerId: deploymentData.deployerId,
        deploymentType: deploymentData.deploymentType,
        address: deploymentData.address,
        transactionHash: deploymentData.transactionHash,
        blockNumber: deploymentData.blockNumber,
        gasUsed: deploymentData.gasUsed,
        gasPrice: deploymentData.gasPrice,
        deployedAt: deploymentData.deployedAt ? new Date(deploymentData.deployedAt) : new Date(),
        metadata: deploymentData.metadata || {}
      });

      const savedDeployment = await deployment.save();
      
      // Populate the relationships before returning
      await savedDeployment.populate('contractId', 'name contractType');
      await savedDeployment.populate('networkId', 'name chainId');
      await savedDeployment.populate('deployerId', 'username email');
      
      logger.info(`Deployment created successfully with ID: ${savedDeployment._id}`);

      return this.mapDeploymentToInterface(savedDeployment);
    } catch (error) {
      logger.error('Error creating deployment:', error);
      throw error;
    }
  }

  async updateDeployment(id: string, updateData: UpdateDeploymentRequest): Promise<DeploymentInterface | null> {
    try {
      logger.info(`Updating deployment with ID: ${id}`, { data: updateData });
      
      const deployment = await Deployment.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('contractId', 'name contractType')
       .populate('networkId', 'name chainId')
       .populate('deployerId', 'username email');

      if (!deployment) {
        logger.warn(`Deployment with ID ${id} not found for update`);
        return null;
      }

      logger.info(`Deployment updated successfully: ${id}`);

      return this.mapDeploymentToInterface(deployment);
    } catch (error) {
      logger.error(`Error updating deployment with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteDeployment(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting deployment with ID: ${id}`);
      
      const result = await Deployment.findByIdAndDelete(id);
      
      if (!result) {
        logger.warn(`Deployment with ID ${id} not found for deletion`);
        return false;
      }

      logger.info(`Deployment deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting deployment with ID ${id}:`, error);
      throw error;
    }
  }

  async getDeploymentsByContract(contractId: string): Promise<DeploymentInterface[]> {
    try {
      logger.info(`Fetching deployments for contract ID: ${contractId}`);
      
      const deployments = await Deployment.find({ contractId })
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email')
        .sort({ createdAt: -1 });
      
      return deployments.map(deployment => this.mapDeploymentToInterface(deployment));
    } catch (error) {
      logger.error(`Error fetching deployments for contract ${contractId}:`, error);
      throw error;
    }
  }

  async getDeploymentsByNetwork(networkId: string): Promise<DeploymentInterface[]> {
    try {
      logger.info(`Fetching deployments for network ID: ${networkId}`);
      
      const deployments = await Deployment.find({ networkId })
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email')
        .sort({ createdAt: -1 });
      
      return deployments.map(deployment => this.mapDeploymentToInterface(deployment));
    } catch (error) {
      logger.error(`Error fetching deployments for network ${networkId}:`, error);
      throw error;
    }
  }

  async getDeploymentsByDeployer(deployerId: string): Promise<DeploymentInterface[]> {
    try {
      logger.info(`Fetching deployments for deployer ID: ${deployerId}`);
      
      const deployments = await Deployment.find({ deployerId })
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email')
        .sort({ createdAt: -1 });
      
      return deployments.map(deployment => this.mapDeploymentToInterface(deployment));
    } catch (error) {
      logger.error(`Error fetching deployments for deployer ${deployerId}:`, error);
      throw error;
    }
  }

  async getDeploymentsByType(deploymentType: 'solidity' | 'ink'): Promise<DeploymentInterface[]> {
    try {
      logger.info(`Fetching deployments of type: ${deploymentType}`);
      
      const deployments = await Deployment.find({ deploymentType })
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email')
        .sort({ createdAt: -1 });
      
      return deployments.map(deployment => this.mapDeploymentToInterface(deployment));
    } catch (error) {
      logger.error(`Error fetching deployments of type ${deploymentType}:`, error);
      throw error;
    }
  }

  async getDeploymentsByStatus(status: 'success' | 'failed' | 'pending'): Promise<DeploymentInterface[]> {
    try {
      logger.info(`Fetching deployments with status: ${status}`);
      
      const deployments = await Deployment.find({ status })
        .populate('contractId', 'name contractType')
        .populate('networkId', 'name chainId')
        .populate('deployerId', 'username email')
        .sort({ createdAt: -1 });
      
      return deployments.map(deployment => this.mapDeploymentToInterface(deployment));
    } catch (error) {
      logger.error(`Error fetching deployments with status ${status}:`, error);
      throw error;
    }
  }

  async verifyDeployment(id: string, verificationStatus: 'verified' | 'unverified' | 'pending'): Promise<DeploymentInterface | null> {
    try {
      logger.info(`Updating verification status for deployment ${id} to: ${verificationStatus}`);
      
      const deployment = await Deployment.findByIdAndUpdate(
        id,
        { 
          'metadata.verificationStatus': verificationStatus 
        },
        { new: true, runValidators: true }
      ).populate('contractId', 'name contractType')
       .populate('networkId', 'name chainId')
       .populate('deployerId', 'username email');

      if (!deployment) {
        logger.warn(`Deployment with ID ${id} not found for verification update`);
        return null;
      }

      logger.info(`Deployment verification status updated successfully: ${id}`);

      return this.mapDeploymentToInterface(deployment);
    } catch (error) {
      logger.error(`Error updating verification status for deployment ${id}:`, error);
      throw error;
    }
  }
}