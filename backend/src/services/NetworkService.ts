import { Network as NetworkModel, INetwork } from '../models/Network';
import { Network, CreateNetworkRequest, UpdateNetworkRequest } from '../interfaces/Network';
import logger from '../utils/Logger';

export class NetworkService {
  private mapNetworkToInterface(network: INetwork): Network {
    return {
      id: (network._id as any).toString(),
      name: network.name,
      chainId: network.chainId,
      rpcUrl: network.rpcUrl,
      explorerUrl: network.explorerUrl,
      currency: network.currency,
      status: network.status,
      features: network.features,
      metadata: network.metadata || {},
      createdAt: network.createdAt.toISOString(),
      updatedAt: network.updatedAt.toISOString()
    };
  }

  async getAllNetworks(): Promise<Network[]> {
    try {
      logger.info('Fetching all networks from database');
      const networks = await NetworkModel.find().sort({ createdAt: -1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error('Error fetching all networks:', error);
      throw error;
    }
  }

  async getActiveNetworks(): Promise<Network[]> {
    try {
      logger.info('Fetching active networks from database');
      const networks = await NetworkModel.find({ status: 'active' }).sort({ name: 1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error('Error fetching active networks:', error);
      throw error;
    }
  }

  async getNetworkById(id: string): Promise<Network | null> {
    try {
      logger.info(`Fetching network with ID: ${id}`);
      const network = await NetworkModel.findById(id);
      
      if (!network) {
        logger.warn(`Network with ID ${id} not found`);
        return null;
      }

      return this.mapNetworkToInterface(network);
    } catch (error) {
      logger.error(`Error fetching network with ID ${id}:`, error);
      throw error;
    }
  }

  async getNetworkByName(name: string): Promise<Network | null> {
    try {
      logger.info(`Fetching network with name: ${name}`);
      const network = await NetworkModel.findOne({ name });
      
      if (!network) {
        logger.warn(`Network with name ${name} not found`);
        return null;
      }

      return this.mapNetworkToInterface(network);
    } catch (error) {
      logger.error(`Error fetching network with name ${name}:`, error);
      throw error;
    }
  }

  async getNetworkByChainId(chainId: string): Promise<Network | null> {
    try {
      logger.info(`Fetching network with chain ID: ${chainId}`);
      const network = await NetworkModel.findOne({ chainId });
      
      if (!network) {
        logger.warn(`Network with chain ID ${chainId} not found`);
        return null;
      }

      return this.mapNetworkToInterface(network);
    } catch (error) {
      logger.error(`Error fetching network with chain ID ${chainId}:`, error);
      throw error;
    }
  }

  async createNetwork(networkData: CreateNetworkRequest): Promise<Network> {
    try {
      logger.info('Creating new network:', { data: networkData });
      
      // Check if network with same name already exists
      const existingNetwork = await NetworkModel.findOne({ name: networkData.name });
      if (existingNetwork) {
        throw new Error(`Network with name '${networkData.name}' already exists`);
      }

      // Check if network with same chain ID already exists
      const existingChainId = await NetworkModel.findOne({ chainId: networkData.chainId });
      if (existingChainId) {
        throw new Error(`Network with chain ID '${networkData.chainId}' already exists`);
      }
      
      const network = new NetworkModel({
        name: networkData.name,
        chainId: networkData.chainId,
        rpcUrl: networkData.rpcUrl,
        explorerUrl: networkData.explorerUrl,
        currency: networkData.currency,
        status: networkData.status || 'active',
        features: networkData.features,
        metadata: networkData.metadata || {}
      });

      const savedNetwork = await network.save();
      
      logger.info(`Network created successfully with ID: ${savedNetwork._id}`);

      return this.mapNetworkToInterface(savedNetwork);
    } catch (error) {
      logger.error('Error creating network:', error);
      throw error;
    }
  }

  async updateNetwork(id: string, updateData: UpdateNetworkRequest): Promise<Network | null> {
    try {
      logger.info(`Updating network with ID: ${id}`, { data: updateData });
      
      // If updating name, check if another network already has that name
      if (updateData.name) {
        const existingNetwork = await NetworkModel.findOne({ 
          name: updateData.name, 
          _id: { $ne: id } 
        });
        if (existingNetwork) {
          throw new Error(`Network with name '${updateData.name}' already exists`);
        }
      }

      // If updating chain ID, check if another network already has that chain ID
      if (updateData.chainId) {
        const existingChainId = await NetworkModel.findOne({ 
          chainId: updateData.chainId, 
          _id: { $ne: id } 
        });
        if (existingChainId) {
          throw new Error(`Network with chain ID '${updateData.chainId}' already exists`);
        }
      }
      
      const network = await NetworkModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!network) {
        logger.warn(`Network with ID ${id} not found for update`);
        return null;
      }

      logger.info(`Network updated successfully: ${id}`);

      return this.mapNetworkToInterface(network);
    } catch (error) {
      logger.error(`Error updating network with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteNetwork(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting network with ID: ${id}`);
      
      const result = await NetworkModel.findByIdAndDelete(id);
      
      if (!result) {
        logger.warn(`Network with ID ${id} not found for deletion`);
        return false;
      }

      logger.info(`Network deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting network with ID ${id}:`, error);
      throw error;
    }
  }

  async getNetworksByStatus(status: 'active' | 'inactive' | 'maintenance'): Promise<Network[]> {
    try {
      logger.info(`Fetching networks with status: ${status}`);
      
      const networks = await NetworkModel.find({ status }).sort({ name: 1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error(`Error fetching networks with status ${status}:`, error);
      throw error;
    }
  }

  async getNetworksByFeature(feature: string): Promise<Network[]> {
    try {
      logger.info(`Fetching networks that support feature: ${feature}`);
      
      const query: any = {};
      query[`features.${feature}`] = true;
      
      const networks = await NetworkModel.find(query).sort({ name: 1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error(`Error fetching networks with feature ${feature}:`, error);
      throw error;
    }
  }

  async getSolidityNetworks(): Promise<Network[]> {
    try {
      logger.info('Fetching networks that support Solidity');
      
      const networks = await NetworkModel.find({ 
        'features.supportsSolidity': true,
        status: 'active'
      }).sort({ name: 1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error('Error fetching Solidity networks:', error);
      throw error;
    }
  }

  async getInkNetworks(): Promise<Network[]> {
    try {
      logger.info('Fetching networks that support ink!');
      
      const networks = await NetworkModel.find({ 
        'features.supportsInk': true,
        status: 'active'
      }).sort({ name: 1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error('Error fetching ink! networks:', error);
      throw error;
    }
  }

  async updateNetworkStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Network | null> {
    try {
      logger.info(`Updating network status for ID ${id} to: ${status}`);
      
      const network = await NetworkModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!network) {
        logger.warn(`Network with ID ${id} not found for status update`);
        return null;
      }

      logger.info(`Network status updated successfully: ${id}`);

      return this.mapNetworkToInterface(network);
    } catch (error) {
      logger.error(`Error updating network status for ID ${id}:`, error);
      throw error;
    }
  }

  async searchNetworks(query: string): Promise<Network[]> {
    try {
      logger.info(`Searching networks with query: ${query}`);
      
      const networks = await NetworkModel.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { chainId: { $regex: query, $options: 'i' } },
          { 'currency.symbol': { $regex: query, $options: 'i' } },
          { 'currency.name': { $regex: query, $options: 'i' } },
          { 'metadata.description': { $regex: query, $options: 'i' } }
        ]
      }).sort({ name: 1 });
      
      return networks.map(network => this.mapNetworkToInterface(network));
    } catch (error) {
      logger.error(`Error searching networks with query ${query}:`, error);
      throw error;
    }
  }

  async getNetworkStats(id: string): Promise<{
    totalContracts: number;
    totalDeployments: number;
    totalBenchmarks: number;
    activeContracts: number;
  } | null> {
    try {
      logger.info(`Getting stats for network ID: ${id}`);
      
      // Import models here to avoid circular dependencies
      const { Contract } = await import('../models/Contract');
      const { Deployment } = await import('../models/Deployment');
      const { Benchmark } = await import('../models/Benchmark');
      
      const [totalContracts, totalDeployments, totalBenchmarks] = await Promise.all([
        Contract.countDocuments({ networkId: id }),
        Deployment.countDocuments({ networkId: id }),
        Benchmark.aggregate([
          {
            $lookup: {
              from: 'deployments',
              localField: 'deploymentId',
              foreignField: '_id',
              as: 'deployment'
            }
          },
          {
            $match: {
              'deployment.networkId': id
            }
          },
          {
            $count: 'total'
          }
        ])
      ]);

      // Count active contracts (contracts with successful deployments)
      const activeContracts = await Deployment.distinct('contractId', { 
        networkId: id, 
        status: 'success' 
      }).then(contractIds => contractIds.length);

      return {
        totalContracts,
        totalDeployments,
        totalBenchmarks: totalBenchmarks[0]?.total || 0,
        activeContracts
      };
    } catch (error) {
      logger.error(`Error getting network stats for ID ${id}:`, error);
      throw error;
    }
  }
}