import { Schema, model, Document } from 'mongoose';

// 🎯 INTERFACE: Define the TypeScript structure of the document
export interface IUser extends Document {
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'admin' | 'developer';
  status: 'active' | 'inactive' | 'suspended';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    website?: string;
    github?: string;
    twitter?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      benchmarkUpdates: boolean;
      deploymentAlerts: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'es' | 'fr';
  };
  stats: {
    contractsDeployed: number;
    benchmarksRun: number;
    totalGasUsed: number;
    lastActivity: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

// 🎯 SCHEMA: Defines the structure and validations for MongoDB
const UserSchema = new Schema<IUser>({
  // Required fields
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    validate: {
      validator: function(value: string) {
        // Only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(value);
      },
      message: 'Username can only contain letters, numbers, underscores, and hyphens'
    }
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: function(value: string) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    trim: true,
    unique: true,
    validate: {
      validator: function(value: string) {
        // Validate Ethereum address format
        return /^0x[a-fA-F0-9]{40}$/.test(value);
      },
      message: 'Wallet address must be a valid Ethereum address'
    }
  },
  
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
      values: ['user', 'admin', 'developer'],
      message: 'Invalid role. Allowed values: user, admin, developer'
    },
    default: 'user'
  },
  
  status: {
    type: String,
    required: [true, 'User status is required'],
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: 'Invalid status. Allowed values: active, inactive, suspended'
    },
    default: 'active'
  },
  
  // Optional profile object
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
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
        message: 'Avatar must be a valid URL'
      }
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
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
    },
    twitter: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (!value) return true; // Optional field
          // Twitter handle validation (starts with @ and contains valid characters)
          return /^@[a-zA-Z0-9_]{1,15}$/.test(value);
        },
        message: 'Twitter handle must be a valid format (e.g., @username)'
      }
    }
  },
  
  // User preferences
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      benchmarkUpdates: {
        type: Boolean,
        default: true
      },
      deploymentAlerts: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: {
        values: ['light', 'dark', 'auto'],
        message: 'Invalid theme. Allowed values: light, dark, auto'
      },
      default: 'auto'
    },
    language: {
      type: String,
      enum: {
        values: ['en', 'es', 'fr'],
        message: 'Invalid language. Allowed values: en, es, fr'
      },
      default: 'en'
    }
  },
  
  // User statistics
  stats: {
    contractsDeployed: {
      type: Number,
      default: 0,
      min: [0, 'Contracts deployed cannot be negative']
    },
    benchmarksRun: {
      type: Number,
      default: 0,
      min: [0, 'Benchmarks run cannot be negative']
    },
    totalGasUsed: {
      type: Number,
      default: 0,
      min: [0, 'Total gas used cannot be negative']
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  // 🎯 SCHEMA OPTIONS
  timestamps: true,
  collection: 'users',
  versionKey: false
});

// 🎯 INDEXES: Improve query performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ 'stats.lastActivity': -1 });

// 🎯 COMPOUND INDEXES
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ status: 1, 'stats.lastActivity': -1 });

// 🎯 TEXT INDEXES for search functionality
UserSchema.index({ 
  username: 'text', 
  email: 'text', 
  'profile.firstName': 'text', 
  'profile.lastName': 'text' 
});

// 🎯 STATIC METHODS
UserSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

UserSchema.statics.findByRole = function(role: string) {
  return this.find({ role });
};

UserSchema.statics.findByWallet = function(walletAddress: string) {
  return this.findOne({ walletAddress });
};

// 🎯 INSTANCE METHODS
UserSchema.methods.getUserInfo = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    walletAddress: this.walletAddress,
    role: this.role,
    status: this.status,
    profile: this.profile,
    preferences: this.preferences,
    stats: this.stats,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
};

UserSchema.methods.updateLastActivity = function() {
  this.stats.lastActivity = new Date();
  return this.save();
};

UserSchema.methods.incrementContractsDeployed = function() {
  this.stats.contractsDeployed += 1;
  return this.save();
};

UserSchema.methods.incrementBenchmarksRun = function() {
  this.stats.benchmarksRun += 1;
  return this.save();
};

// 🎯 MIDDLEWARE (HOOKS)
UserSchema.pre('save', function(next) {
  // Update lastActivity when user data is modified
  if (this.isModified()) {
    this.stats.lastActivity = new Date();
  }
  
  // Ensure username is unique (case-insensitive)
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
  
  next();
});

// 🎯 EXPORT: Create and export the model
export const User = model<IUser>('User', UserSchema); 