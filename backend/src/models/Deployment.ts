import { Schema, model, Document, Types } from 'mongoose';

// 🎯 INTERFACE: Define the TypeScript structure of the document
export interface IDeployment extends Document {
  contractId: Types.ObjectId; // Reference to Contract
  networkId: Types.ObjectId;  // Reference to Network
  deployerId: Types.ObjectId; // Reference to User who deployed
  deploymentType: 'solidity' | 'ink';
  address: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
  deployedAt: Date;
  status: 'success' | 'failed' | 'pending';
  metadata?: {
    compilerVersion?: string;
    optimization?: boolean;
    constructorArgs?: string[];
    verificationStatus?: 'verified' | 'unverified' | 'pending';
    contractSize?: number; // Size in bytes
    optimizationRuns?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 🎯 SCHEMA: Defines the structure and validations for MongoDB
const DeploymentSchema = new Schema<IDeployment>({
  // Required references to other collections
  contractId: {
    type: Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, 'Contract ID is required']
  },
  
  networkId: {
    type: Schema.Types.ObjectId,
    ref: 'Network',
    required: [true, 'Network ID is required']
  },
  
  deployerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Deployer ID is required']
  },
  
  deploymentType: {
    type: String,
    required: [true, 'Deployment type is required'],
    enum: {
      values: ['solidity', 'ink'],
      message: 'Invalid deployment type. Allowed values: solidity, ink'
    }
  },
  
  address: {
    type: String,
    required: [true, 'Contract address is required'],
    trim: true,
    validate: {
      validator: function(value: string) {
        // Validate based on deployment type
        if (this.deploymentType === 'solidity') {
          return /^0x[a-fA-F0-9]{40}$/.test(value);
        } else if (this.deploymentType === 'ink') {
          return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(value);
        }
        return false;
      },
      message: 'Invalid contract address format for the specified deployment type'
    }
  },
  
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    trim: true,
    validate: {
      validator: function(value: string) {
        // Validate hex format for transaction hash
        return /^0x[a-fA-F0-9]{64}$/.test(value);
      },
      message: 'Transaction hash must be a valid hex string (0x + 64 characters)'
    }
  },
  
  blockNumber: {
    type: Number,
    required: [true, 'Block number is required'],
    min: [0, 'Block number cannot be negative'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 0;
      },
      message: 'Block number must be a non-negative integer'
    }
  },
  
  gasUsed: {
    type: Number,
    required: [true, 'Gas used is required'],
    min: [0, 'Gas used cannot be negative'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 0;
      },
      message: 'Gas used must be a non-negative integer'
    }
  },
  
  gasPrice: {
    type: String,
    required: [true, 'Gas price is required'],
    trim: true,
    validate: {
      validator: function(value: string) {
        // Validate hex format for gas price
        return /^0x[a-fA-F0-9]+$/.test(value);
      },
      message: 'Gas price must be a valid hex string'
    }
  },
  

  
  deployedAt: {
    type: Date,
    required: [true, 'Deployment time is required'],
    validate: {
      validator: function(value: Date) {
        return value <= new Date(); // Cannot be in the future
      },
      message: 'Deployment time cannot be in the future'
    }
  },
  
  status: {
    type: String,
    required: [true, 'Deployment status is required'],
    enum: {
      values: ['success', 'failed', 'pending'],
      message: 'Invalid status. Allowed values: success, failed, pending'
    },
    default: 'pending'
  },
  
  // Optional metadata object
  metadata: {
    compilerVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'Compiler version cannot exceed 20 characters']
    },
    optimization: {
      type: Boolean,
      default: false
    },
    constructorArgs: [{
      type: String,
      trim: true
    }],
    verificationStatus: {
      type: String,
      enum: {
        values: ['verified', 'unverified', 'pending'],
        message: 'Invalid verification status. Allowed values: verified, unverified, pending'
      },
      default: 'unverified'
    }
  }
}, {
  // 🎯 SCHEMA OPTIONS
  timestamps: true,
  collection: 'deployments',
  versionKey: false
});

// 🎯 INDEXES: Improve query performance
DeploymentSchema.index({ contractId: 1 });
DeploymentSchema.index({ networkId: 1 });
DeploymentSchema.index({ deploymentType: 1 });
DeploymentSchema.index({ address: 1 });
DeploymentSchema.index({ transactionHash: 1 });
DeploymentSchema.index({ deployer: 1 });
DeploymentSchema.index({ status: 1 });
DeploymentSchema.index({ deployedAt: -1 });
DeploymentSchema.index({ blockNumber: -1 });

// 🎯 COMPOUND INDEXES
DeploymentSchema.index({ contractId: 1, deploymentType: 1 });
DeploymentSchema.index({ networkId: 1, status: 1 });
DeploymentSchema.index({ deployer: 1, deployedAt: -1 });
DeploymentSchema.index({ status: 1, deployedAt: -1 });

// 🎯 UNIQUE INDEXES
DeploymentSchema.index({ address: 1, networkId: 1 }, { unique: true });
DeploymentSchema.index({ transactionHash: 1, networkId: 1 }, { unique: true });

// 🎯 STATIC METHODS
DeploymentSchema.statics.findByContract = function(contractId: string) {
  return this.find({ contractId }).populate('contractId networkId');
};

DeploymentSchema.statics.findByNetwork = function(networkId: string) {
  return this.find({ networkId }).populate('contractId networkId');
};

DeploymentSchema.statics.findByAddress = function(address: string) {
  return this.find({ address }).populate('contractId networkId');
};

DeploymentSchema.statics.findByDeployer = function(deployer: string) {
  return this.find({ deployer }).populate('contractId networkId');
};

// 🎯 INSTANCE METHODS
DeploymentSchema.methods.getDeploymentInfo = function() {
  return {
    id: this._id,
    contractId: this.contractId,
    networkId: this.networkId,
    deploymentType: this.deploymentType,
    address: this.address,
    transactionHash: this.transactionHash,
    blockNumber: this.blockNumber,
    gasUsed: this.gasUsed,
    gasPrice: this.gasPrice,
    deployer: this.deployer,
    deployedAt: this.deployedAt,
    status: this.status,
    metadata: this.metadata
  };
};

// 🎯 MIDDLEWARE (HOOKS)
DeploymentSchema.pre('save', function(next) {
  // Validate that successful deployments have all required fields
  if (this.status === 'success') {
    if (!this.address || !this.transactionHash || !this.blockNumber || 
        !this.gasUsed || !this.gasPrice || !this.deployerId || !this.deployedAt) {
      next(new Error('Successful deployments must have all required fields'));
      return;
    }
  }
  
  // Set deployedAt to current time if not provided and status is success
  if (this.status === 'success' && !this.deployedAt) {
    this.deployedAt = new Date();
  }
  
  next();
});

// 🎯 MIDDLEWARE: Update contract's latestDeployment when deployment changes
DeploymentSchema.post('save', async function() {
  try {
    // Dynamically import to avoid circular dependencies
    const { Contract } = await import('./Contract');
    
    if (this.status === 'success') {
      // Find the contract and update its latest deployment info
      const contract = await Contract.findById(this.contractId);
      if (contract) {
        if (!contract.latestDeployment) {
          contract.latestDeployment = {
            network: contract.networkInfo.name
          };
        }
        
        // Update deployment info based on type
        if (this.deploymentType === 'solidity') {
          contract.latestDeployment.solidityAddress = this.address;
          contract.latestDeployment.solidityDeployedTime = this.deployedAt;
        } else if (this.deploymentType === 'ink') {
          contract.latestDeployment.inkAddress = this.address;
          contract.latestDeployment.inkDeployedTime = this.deployedAt;
        }
        
        // Update network name for frontend compatibility
        contract.latestDeployment.network = contract.networkInfo.name;
        
        await contract.save();
      }
    }
  } catch (error) {
    console.error('Error updating contract latest deployment:', error);
  }
});

// 🎯 EXPORT: Create and export the model
export const Deployment = model<IDeployment>('Deployment', DeploymentSchema); 