import { Schema, model, Document, Types } from 'mongoose';

// 🎯 INTERFACE: Define the TypeScript structure of the document
export interface IContract extends Document {
  name: string;
  ownerId: Types.ObjectId; // Reference to User who owns this contract
  networkId: Types.ObjectId; // Reference to Network
  contractType: 'solidity' | 'ink' | 'both';
  sourceCodeHash?: string; // Hash of the source code for verification
  
  // DENORMALIZED DATA for performance (updated via hooks)
  ownerInfo: {
    username: string;
    email: string;
  };
  networkInfo: {
    name: string;
    chainId: string;
  };
  
  // Latest deployment info (for quick access and frontend compatibility)
  latestDeployment?: {
    solidityAddress?: string;
    inkAddress?: string;
    solidityDeployedTime?: Date; // Keep frontend field names
    inkDeployedTime?: Date;
    network: string; // For backward compatibility with frontend
  };
  
  metadata: {
    description?: string;
    version?: string;
    tags?: string[];
    sourceUrl?: string; // GitHub or other repository URL
    compiler?: {
      name: string;
      version: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// 🎯 SCHEMA: Defines the structure and validations for MongoDB
const ContractSchema = new Schema<IContract>({
  // Required field (mandatory)
  name: {
    type: String,
    required: [true, 'Contract name is required'],
    trim: true, // Removes whitespace
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Required reference to User (owner)
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  // Required reference to Network
  networkId: {
    type: Schema.Types.ObjectId,
    ref: 'Network',
    required: [true, 'Network ID is required']
  },
  
  // Required field with specific values
  contractType: {
    type: String,
    required: [true, 'Contract type is required'],
    enum: {
      values: ['solidity', 'ink', 'both'],
      message: 'Invalid contract type. Allowed values: solidity, ink, both'
    }
  },
  
  // Optional source code hash for verification
  sourceCodeHash: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true; // Optional field
        return /^[a-fA-F0-9]{64}$/.test(value); // SHA-256 hash
      },
      message: 'Source code hash must be a valid SHA-256 hash (64 hex characters)'
    }
  },
  
  // DENORMALIZED DATA for performance
  ownerInfo: {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  
  networkInfo: {
    name: {
      type: String,
      required: true
    },
    chainId: {
      type: String,
      required: true
    }
  },
  
  // Latest deployment info for quick access
  latestDeployment: {
    solidityAddress: String,
    inkAddress: String,
    solidityDeployedTime: Date,
    inkDeployedTime: Date,
    network: String // For frontend compatibility
  },
  
  // Metadata object
  metadata: {
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    version: {
      type: String,
      trim: true,
      maxlength: [20, 'Version cannot exceed 20 characters'],
      validate: {
        validator: function(value: string) {
          if (!value) return true; // Optional
          return /^v?\d+\.\d+\.\d+(-\w+)?$/.test(value); // Semantic versioning
        },
        message: 'Version must follow semantic versioning format (e.g., 1.0.0, v2.1.0-beta)'
      }
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Each tag cannot exceed 30 characters']
    }],
    sourceUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (!value) return true; // Optional
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Source URL must be a valid URL'
      }
    },
    compiler: {
      name: {
        type: String,
        trim: true,
        maxlength: [50, 'Compiler name cannot exceed 50 characters']
      },
      version: {
        type: String,
        trim: true,
        maxlength: [20, 'Compiler version cannot exceed 20 characters']
      }
    }
  }
}, {
  // 🎯 SCHEMA OPTIONS
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'contracts', // Collection name in MongoDB
  versionKey: false // Don't include __v field
});

// 🎯 INDEXES: Improve query performance
ContractSchema.index({ name: 1 }); // Simple index by name
ContractSchema.index({ ownerId: 1 }); // Index by owner
ContractSchema.index({ networkId: 1 }); // Index by network
ContractSchema.index({ contractType: 1 }); // Index by type
ContractSchema.index({ sourceCodeHash: 1 }); // Index by source code hash
ContractSchema.index({ createdAt: -1 }); // Index by creation date (descending)
ContractSchema.index({ 'metadata.tags': 1 }); // Index by tags

// 🎯 COMPOUND INDEXES: For queries using multiple fields
ContractSchema.index({ networkId: 1, contractType: 1 }); // Queries by network + type
ContractSchema.index({ ownerId: 1, networkId: 1 }); // Queries by owner + network
ContractSchema.index({ name: 'text', 'metadata.description': 'text' }); // Text search

// 🎯 STATIC METHODS: Functions you can call on the model  
ContractSchema.statics.findByNetwork = function(networkId: string) {
  // No need for populate anymore - data is denormalized
  return this.find({ networkId });
};

ContractSchema.statics.findByType = function(contractType: string) {
  // No need for populate anymore - data is denormalized
  return this.find({ contractType });
};

ContractSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ ownerId }).populate('ownerId networkId');
};

// 🎯 INSTANCE METHODS: Functions you can call on a specific document
ContractSchema.methods.getFullInfo = function() {
  return {
    id: this._id,
    name: this.name,
    ownerId: this.ownerId,
    networkId: this.networkId,
    contractType: this.contractType,
    sourceCodeHash: this.sourceCodeHash,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// 🎯 MIDDLEWARE (HOOKS): Execute before/after certain operations
ContractSchema.pre('save', async function(next) {
  // Validate metadata if contract type is 'both'
  if (this.contractType === 'both' && (!this.metadata || !this.metadata.description)) {
    next(new Error('Contracts supporting both runtimes should have a description'));
    return;
  }
  
  // Populate denormalized data if this is a new document or refs changed
  if (this.isNew || this.isModified('ownerId') || this.isModified('networkId')) {
    try {
      // Dynamically import to avoid circular dependencies
      const { User } = await import('./User');
      const { Network } = await import('./Network');
      
      const [owner, network] = await Promise.all([
        User.findById(this.ownerId).select('username email'),
        Network.findById(this.networkId).select('name chainId')
      ]);
      
      if (!owner) {
        next(new Error('Referenced owner not found'));
        return;
      }
      
      if (!network) {
        next(new Error('Referenced network not found'));
        return;
      }
      
      // Update denormalized data
      this.ownerInfo = {
        username: owner.username,
        email: owner.email
      };
      
      this.networkInfo = {
        name: network.name,
        chainId: network.chainId
      };
      
      // Set network for frontend compatibility
      if (this.latestDeployment) {
        this.latestDeployment.network = network.name;
      }
      
    } catch (error) {
      next(error as Error);
      return;
    }
  }
  
  next();
});

// 🎯 EXPORT: Create and export the model
export const Contract = model<IContract>('Contract', ContractSchema); 