import { Schema, model, Document, Types } from 'mongoose';

// 🎯 INTERFACE: Define the TypeScript structure of the document
export interface IBenchmark extends Document {
  contractId: Types.ObjectId; // Reference to Contract
  deploymentId: Types.ObjectId; // Reference to specific Deployment
  requestedBy: Types.ObjectId; // Reference to User who requested benchmark
  benchmarkType: 'gas' | 'execution_time' | 'storage' | 'comprehensive';
  results: {
    gasUsed?: number;
    executionTime?: number;
    storageSize?: number;
    cost?: number;
    efficiency?: number;
  };
  parameters: {
    inputSize?: number;
    complexity?: string;
    iterations?: number;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  metadata?: {
    compiler?: string;
    optimization?: boolean;
    environment?: string;
    runCount?: number; // Number of times this benchmark was executed
  };
  updatedAt: Date;
}

// 🎯 SCHEMA: Defines the structure and validations for MongoDB
const BenchmarkSchema = new Schema<IBenchmark>({
  // Required references to other collections
  contractId: {
    type: Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, 'Contract ID is required']
  },
  
  deploymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Deployment',
    required: [true, 'Deployment ID is required']
  },
  
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user ID is required']
  },
  
  benchmarkType: {
    type: String,
    required: [true, 'Benchmark type is required'],
    enum: {
      values: ['gas', 'execution_time', 'storage', 'comprehensive'],
      message: 'Invalid benchmark type. Allowed values: gas, execution_time, storage, comprehensive'
    }
  },
  
  // Results object (optional until benchmark is completed)
  results: {
    gasUsed: {
      type: Number,
      min: [0, 'Gas used cannot be negative'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return Number.isInteger(value);
        },
        message: 'Gas used must be an integer'
      }
    },
    executionTime: {
      type: Number,
      min: [0, 'Execution time cannot be negative'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return value >= 0;
        },
        message: 'Execution time must be a positive number'
      }
    },
    storageSize: {
      type: Number,
      min: [0, 'Storage size cannot be negative'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return Number.isInteger(value);
        },
        message: 'Storage size must be an integer'
      }
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return value >= 0;
        },
        message: 'Cost must be a positive number'
      }
    },
    efficiency: {
      type: Number,
      min: [0, 'Efficiency cannot be negative'],
      max: [100, 'Efficiency cannot exceed 100%'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return value >= 0 && value <= 100;
        },
        message: 'Efficiency must be between 0 and 100'
      }
    }
  },
  
  // Parameters object (optional)
  parameters: {
    inputSize: {
      type: Number,
      min: [1, 'Input size must be at least 1'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return Number.isInteger(value) && value > 0;
        },
        message: 'Input size must be a positive integer'
      }
    },
    complexity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'extreme'],
        message: 'Invalid complexity. Allowed values: low, medium, high, extreme'
      }
    },
    iterations: {
      type: Number,
      min: [1, 'Iterations must be at least 1'],
      max: [10000, 'Iterations cannot exceed 10000'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true; // Optional
          return Number.isInteger(value) && value > 0 && value <= 10000;
        },
        message: 'Iterations must be a positive integer between 1 and 10000'
      }
    }
  },
  
  status: {
    type: String,
    required: [true, 'Benchmark status is required'],
    enum: {
      values: ['pending', 'running', 'completed', 'failed'],
      message: 'Invalid status. Allowed values: pending, running, completed, failed'
    },
    default: 'pending'
  },
  
  completedAt: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        if (!value) return true; // Optional field
        return value >= this.createdAt; // Cannot complete before creation
      },
      message: 'Completion time cannot be before creation time'
    }
  },
  
  errorMessage: {
    type: String,
    trim: true,
    maxlength: [1000, 'Error message cannot exceed 1000 characters']
  },
  
  // Optional metadata object
  metadata: {
    compiler: {
      type: String,
      trim: true,
      maxlength: [50, 'Compiler name cannot exceed 50 characters']
    },
    optimization: {
      type: Boolean,
      default: false
    },
    environment: {
      type: String,
      trim: true,
      enum: {
        values: ['development', 'staging', 'production'],
        message: 'Invalid environment. Allowed values: development, staging, production'
      }
    },
    runCount: {
      type: Number,
      min: [1, 'Run count must be at least 1'],
      max: [100, 'Run count cannot exceed 100'],
      default: 1
    }
  }
}, {
  // 🎯 SCHEMA OPTIONS
  timestamps: true,
  collection: 'benchmarks',
  versionKey: false
});

// 🎯 INDEXES: Improve query performance
BenchmarkSchema.index({ contractId: 1 });
BenchmarkSchema.index({ deploymentId: 1 });
BenchmarkSchema.index({ requestedBy: 1 });
BenchmarkSchema.index({ benchmarkType: 1 });
BenchmarkSchema.index({ status: 1 });
BenchmarkSchema.index({ createdAt: -1 });
BenchmarkSchema.index({ completedAt: -1 });

// 🎯 COMPOUND INDEXES
BenchmarkSchema.index({ contractId: 1, status: 1 });
BenchmarkSchema.index({ deploymentId: 1, benchmarkType: 1 });
BenchmarkSchema.index({ requestedBy: 1, status: 1 });
BenchmarkSchema.index({ status: 1, createdAt: -1 });

// 🎯 STATIC METHODS
BenchmarkSchema.statics.findByContract = function(contractId: string) {
  return this.find({ contractId }).populate('contractId deploymentId requestedBy');
};

BenchmarkSchema.statics.findByDeployment = function(deploymentId: string) {
  return this.find({ deploymentId }).populate('contractId deploymentId requestedBy');
};

BenchmarkSchema.statics.findByUser = function(requestedBy: string) {
  return this.find({ requestedBy }).populate('contractId deploymentId requestedBy');
};

BenchmarkSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).populate('contractId deploymentId requestedBy');
};

// 🎯 INSTANCE METHODS
BenchmarkSchema.methods.getBenchmarkInfo = function() {
  return {
    id: this._id,
    contractId: this.contractId,
    deploymentId: this.deploymentId,
    requestedBy: this.requestedBy,
    benchmarkType: this.benchmarkType,
    results: this.results,
    parameters: this.parameters,
    status: this.status,
    createdAt: this.createdAt,
    completedAt: this.completedAt,
    errorMessage: this.errorMessage,
    metadata: this.metadata
  };
};

// 🎯 MIDDLEWARE (HOOKS)
BenchmarkSchema.pre('save', function(next) {
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Clear error message when status is not failed
  if (this.isModified('status') && this.status !== 'failed') {
    this.errorMessage = undefined;
  }
  
  // Validate that results exist when status is completed
  if (this.status === 'completed') {
    const hasResults = this.results && (
      this.results.gasUsed !== undefined ||
      this.results.executionTime !== undefined ||
      this.results.storageSize !== undefined ||
      this.results.cost !== undefined ||
      this.results.efficiency !== undefined
    );
    
    if (!hasResults) {
      next(new Error('Completed benchmarks must have at least one result'));
      return;
    }
  }
  
  next();
});

// 🎯 EXPORT: Create and export the model
export const Benchmark = model<IBenchmark>('Benchmark', BenchmarkSchema); 