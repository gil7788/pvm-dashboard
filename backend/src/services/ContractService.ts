import { Contract, IContract } from '../models/Contract';
import { CreateContractRequest, UpdateContractRequest, ContractMetadata } from '../interfaces/Contract';
import logger from '../utils/Logger';

export class ContractService {
  private mapContractToMetadata(contract: IContract): ContractMetadata {
    return {
      id: (contract._id as any).toString(),
      name: contract.name,
      // Map to frontend compatible format using denormalized data
      network: contract.networkInfo.name, // Frontend expects string
      contractType: contract.contractType,
      // Use latest deployment info for frontend compatibility
      solidityAddress: contract.latestDeployment?.solidityAddress || null,
      inkAddress: contract.latestDeployment?.inkAddress || null,
      solidityDeployedTime: contract.latestDeployment?.solidityDeployedTime?.toISOString() || null,
      inkDeployedTime: contract.latestDeployment?.inkDeployedTime?.toISOString() || null
    };
  }
  async getAllContracts(): Promise<ContractMetadata[]> {
    try {
      logger.info('Fetching all contracts from database');
      // No populate needed - using denormalized data for performance
      const contracts = await Contract.find().sort({ createdAt: -1 });
      
      return contracts.map(contract => this.mapContractToMetadata(contract));
    } catch (error) {
      logger.error('Error fetching all contracts:', error);
      throw error;
    }
  }

  async getContractById(id: string): Promise<ContractMetadata | null> {
    try {
      logger.info(`Fetching contract with ID: ${id}`);
      // No populate needed - using denormalized data for performance
      const contract = await Contract.findById(id);
      
      if (!contract) {
        logger.warn(`Contract with ID ${id} not found`);
        return null;
      }

      return this.mapContractToMetadata(contract);
    } catch (error) {
      logger.error(`Error fetching contract with ID ${id}:`, error);
      throw error;
    }
  }

  async createContract(contractData: CreateContractRequest): Promise<ContractMetadata> {
    try {
      logger.info('Creating new contract:', { data: contractData });
      
      const contract = new Contract({
        name: contractData.name,
        ownerId: contractData.ownerId,
        networkId: contractData.networkId,
        contractType: contractData.contractType,
        sourceCodeHash: contractData.sourceCodeHash,
        metadata: contractData.metadata || {}
      });

      // The pre-save hook will populate denormalized data automatically
      const savedContract = await contract.save();
      
      logger.info(`Contract created successfully with ID: ${savedContract._id}`);

      return this.mapContractToMetadata(savedContract);
    } catch (error) {
      logger.error('Error creating contract:', error);
      throw error;
    }
  }

  async updateContract(id: string, updateData: UpdateContractRequest): Promise<ContractMetadata | null> {
    try {
      logger.info(`Updating contract with ID: ${id}`, { data: updateData });
      
      // The pre-save hook will update denormalized data if references change
      const contract = await Contract.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!contract) {
        logger.warn(`Contract with ID ${id} not found for update`);
        return null;
      }

      logger.info(`Contract updated successfully: ${id}`);

      return this.mapContractToMetadata(contract);
    } catch (error) {
      logger.error(`Error updating contract with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteContract(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting contract with ID: ${id}`);
      
      const result = await Contract.findByIdAndDelete(id);
      
      if (!result) {
        logger.warn(`Contract with ID ${id} not found for deletion`);
        return false;
      }

      logger.info(`Contract deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting contract with ID ${id}:`, error);
      throw error;
    }
  }

  async getContractsByNetwork(networkId: string): Promise<ContractMetadata[]> {
    try {
      logger.info(`Fetching contracts for network ID: ${networkId}`);
      
      // No populate needed - using denormalized data for performance
      const contracts = await Contract.find({ networkId }).sort({ createdAt: -1 });
      
      return contracts.map(contract => this.mapContractToMetadata(contract));
    } catch (error) {
      logger.error(`Error fetching contracts for network ${networkId}:`, error);
      throw error;
    }
  }

  async getContractsByOwner(ownerId: string): Promise<ContractMetadata[]> {
    try {
      logger.info(`Fetching contracts for owner ID: ${ownerId}`);
      
      // No populate needed - using denormalized data for performance
      const contracts = await Contract.find({ ownerId }).sort({ createdAt: -1 });
      
      return contracts.map(contract => this.mapContractToMetadata(contract));
    } catch (error) {
      logger.error(`Error fetching contracts for owner ${ownerId}:`, error);
      throw error;
    }
  }

  async getContractsByType(contractType: "solidity" | "ink" | "both"): Promise<ContractMetadata[]> {
    try {
      logger.info(`Fetching contracts of type: ${contractType}`);
      
      // No populate needed - using denormalized data for performance
      const contracts = await Contract.find({ contractType }).sort({ createdAt: -1 });
      
      return contracts.map(contract => this.mapContractToMetadata(contract));
    } catch (error) {
      logger.error(`Error fetching contracts of type ${contractType}:`, error);
      throw error;
    }
  }

  async searchContracts(query: string): Promise<ContractMetadata[]> {
    try {
      logger.info(`Searching contracts with query: ${query}`);
      
      // Use MongoDB text search with denormalized data for performance
      const contracts = await Contract.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { 'metadata.description': { $regex: query, $options: 'i' } },
          { 'metadata.tags': { $in: [new RegExp(query, 'i')] } },
          { sourceCodeHash: { $regex: query, $options: 'i' } },
          { 'ownerInfo.username': { $regex: query, $options: 'i' } },
          { 'networkInfo.name': { $regex: query, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 });
      
      return contracts.map(contract => this.mapContractToMetadata(contract));
    } catch (error) {
      logger.error(`Error searching contracts with query ${query}:`, error);
      throw error;
    }
  }

  async getContractsByTag(tag: string): Promise<ContractMetadata[]> {
    try {
      logger.info(`Fetching contracts with tag: ${tag}`);
      
      // No populate needed - using denormalized data for performance
      const contracts = await Contract.find({ 'metadata.tags': tag }).sort({ createdAt: -1 });
      
      return contracts.map(contract => this.mapContractToMetadata(contract));
    } catch (error) {
      logger.error(`Error fetching contracts with tag ${tag}:`, error);
      throw error;
    }
  }
} 