import { Schema, model, Document } from 'mongoose';

// 🎯 INTERFACE: Define the TypeScript structure of the document
export interface INetwork extends Document {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    symbol: string;
    name: string;
    decimals: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  features: {
    supportsSolidity: boolean;
    supportsInk: boolean;
    supportsEVM: boolean;
    supportsWASM: boolean;
  };
  metadata: {
    description?: string;
    website?: string;
    documentation?: string;
    github?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 🎯 SCHEMA: Defines the structure and validations for MongoDB
const NetworkSchema = new Schema<INetwork>({
  // Required fields
  name: {
    type: String,
    required: [true, 'Network name is required'],
    trim: true,
    unique: true, // Ensures no duplicate network names
    maxlength: [50, 'Network name cannot exceed 50 characters']
  },
  
  chainId: {
    type: String,
    required: [true, 'Chain ID is required'],
    trim: true,
    unique: true, // Ensures no duplicate chain IDs
    validate: {
      validator: function(value: string) {
        // Validates hex format (0x + hex characters)
        return /^0x[a-fA-F0-9]+$/.test(value);
      },
      message: 'Chain ID must be in hex format (e.g., 0x1, 0x89)'
    }
  },
  
  rpcUrl: {
    type: String,
    required: [true, 'RPC URL is required'],
    trim: true,
    validate: {
      validator: function(value: string) {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'RPC URL must be a valid URL'
    }
  },
  
  explorerUrl: {
    type: String,
    required: [true, 'Explorer URL is required'],
    trim: true,
    validate: {
      validator: function(value: string) {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Explorer URL must be a valid URL'
    }
  },
  
  // Nested object for currency information
  currency: {
    symbol: {
      type: String,
      required: [true, 'Currency symbol is required'],
      trim: true,
      maxlength: [10, 'Currency symbol cannot exceed 10 characters']
    },
    name: {
      type: String,
      required: [true, 'Currency name is required'],
      trim: true,
      maxlength: [50, 'Currency name cannot exceed 50 characters']
    },
    decimals: {
      type: Number,
      required: [true, 'Currency decimals are required'],
      min: [0, 'Decimals cannot be negative'],
      max: [18, 'Decimals cannot exceed 18']
    }
  },
  
  status: {
    type: String,
    required: [true, 'Network status is required'],
    enum: {
      values: ['active', 'inactive', 'maintenance'],
      message: 'Invalid status. Allowed values: active, inactive, maintenance'
    },
    default: 'active'
  },
  
  // Nested object for network features
  features: {
    supportsSolidity: {
      type: Boolean,
      required: [true, 'Solidity support flag is required'],
      default: false
    },
    supportsInk: {
      type: Boolean,
      required: [true, 'ink! support flag is required'],
      default: false
    },
    supportsEVM: {
      type: Boolean,
      required: [true, 'EVM support flag is required'],
      default: false
    },
    supportsWASM: {
      type: Boolean,
      required: [true, 'WASM support flag is required'],
      default: false
    }
  },
  
  // Optional metadata object
  metadata: {
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (!value) return true; // Optional field
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Website must be a valid URL'
      }
    },
    documentation: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (!value) return true; // Optional field
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Documentation must be a valid URL'
      }
    },
    github: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (!value) return true; // Optional field
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'GitHub URL must be a valid URL'
      }
    }
  }
}, {
  // 🎯 SCHEMA OPTIONS
  timestamps: true,
  collection: 'networks',
  versionKey: false
});

// 🎯 INDEXES: Improve query performance
NetworkSchema.index({ name: 1 });
NetworkSchema.index({ chainId: 1 });
NetworkSchema.index({ status: 1 });
NetworkSchema.index({ 'features.supportsSolidity': 1 });
NetworkSchema.index({ 'features.supportsInk': 1 });
NetworkSchema.index({ createdAt: -1 });

// 🎯 COMPOUND INDEXES
NetworkSchema.index({ status: 1, 'features.supportsSolidity': 1 });
NetworkSchema.index({ status: 1, 'features.supportsInk': 1 });

// 🎯 STATIC METHODS
NetworkSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

NetworkSchema.statics.findByFeature = function(feature: string) {
  const query: any = {};
  query[`features.${feature}`] = true;
  return this.find(query);
};

// 🎯 INSTANCE METHODS
NetworkSchema.methods.getNetworkInfo = function() {
  return {
    id: this._id,
    name: this.name,
    chainId: this.chainId,
    rpcUrl: this.rpcUrl,
    explorerUrl: this.explorerUrl,
    currency: this.currency,
    status: this.status,
    features: this.features,
    metadata: this.metadata
  };
};

// 🎯 MIDDLEWARE (HOOKS)
NetworkSchema.pre('save', function(next) {
  // Ensure at least one feature is supported
  const features = this.features;
  if (!features.supportsSolidity && !features.supportsInk && 
      !features.supportsEVM && !features.supportsWASM) {
    next(new Error('Network must support at least one feature (Solidity, ink!, EVM, or WASM)'));
  }
  next();
});

// 🎯 EXPORT: Create and export the model
export const Network = model<INetwork>('Network', NetworkSchema); 