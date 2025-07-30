import { Schema, model, Document, Types } from 'mongoose';

// 🎯 INTERFACE: Define the TypeScript structure of the document
export interface IBenchmarkRun extends Document {
  benchmarkId: Types.ObjectId; // Reference to Benchmark
  runNumber: number; // Sequential run number for this benchmark
  results: {
    gasUsed?: number;
    executionTime?: number; // in milliseconds
    storageSize?: number;
    cost?: number;
    efficiency?: number;
    memoryUsage?: number; // Memory used during execution
  };
  executedAt: Date;
  duration: number; // Total execution duration in milliseconds
  environment: {
    nodeVersion?: string;
    memoryLimit?: number;
    cpuCores?: number;
    platform?: string;
  };
  status: 'success' | 'failed' | 'timeout';
  errorDetails?: string;
  createdAt: Date;
}

// 🎯 SCHEMA: Defines the structure and validations for MongoDB
const BenchmarkRunSchema = new Schema<IBenchmarkRun>({
  // Required reference to Benchmark
  benchmarkId: {
    type: Schema.Types.ObjectId,
    ref: 'Benchmark',
    required: [true, 'Benchmark ID is required']
  },
  
  runNumber: {
    type: Number,
    required: [true, 'Run number is required'],
    min: [1, 'Run number must be at least 1'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'Run number must be a positive integer'
    }
  },
  
  // Results object
  results: {
    gasUsed: {
      type: Number,
      min: [0, 'Gas used cannot be negative'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true;
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
          if (value === undefined || value === null) return true;
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
          if (value === undefined || value === null) return true;
          return Number.isInteger(value);
        },
        message: 'Storage size must be an integer'
      }
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    efficiency: {
      type: Number,
      min: [0, 'Efficiency cannot be negative'],
      max: [100, 'Efficiency cannot exceed 100%']
    },
    memoryUsage: {
      type: Number,
      min: [0, 'Memory usage cannot be negative'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true;
          return Number.isInteger(value);
        },
        message: 'Memory usage must be an integer (bytes)'
      }
    }
  },
  
  executedAt: {
    type: Date,
    required: [true, 'Execution time is required'],
    validate: {
      validator: function(value: Date) {
        return value <= new Date();
      },
      message: 'Execution time cannot be in the future'
    }
  },
  
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration cannot be negative'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 0;
      },
      message: 'Duration must be a non-negative integer (milliseconds)'
    }
  },
  
  // Environment information
  environment: {
    nodeVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'Node version cannot exceed 20 characters']
    },
    memoryLimit: {
      type: Number,
      min: [0, 'Memory limit cannot be negative']
    },
    cpuCores: {
      type: Number,
      min: [1, 'CPU cores must be at least 1'],
      validate: {
        validator: function(value: number) {
          if (value === undefined || value === null) return true;
          return Number.isInteger(value) && value > 0;
        },
        message: 'CPU cores must be a positive integer'
      }
    },
    platform: {
      type: String,
      trim: true,
      enum: {
        values: ['linux', 'darwin', 'win32', 'freebsd', 'openbsd'],
        message: 'Invalid platform'
      }
    }
  },
  
  status: {
    type: String,
    required: [true, 'Run status is required'],
    enum: {
      values: ['success', 'failed', 'timeout'],
      message: 'Invalid status. Allowed values: success, failed, timeout'
    }
  },
  
  errorDetails: {
    type: String,
    trim: true,
    maxlength: [1000, 'Error details cannot exceed 1000 characters']
  }
}, {
  // 🎯 SCHEMA OPTIONS
  timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
  collection: 'benchmark_runs',
  versionKey: false
});

// 🎯 INDEXES: Improve query performance
BenchmarkRunSchema.index({ benchmarkId: 1 });
BenchmarkRunSchema.index({ runNumber: 1 });
BenchmarkRunSchema.index({ status: 1 });
BenchmarkRunSchema.index({ executedAt: -1 });
BenchmarkRunSchema.index({ duration: 1 });

// 🎯 COMPOUND INDEXES
BenchmarkRunSchema.index({ benchmarkId: 1, runNumber: 1 }, { unique: true }); // Unique run per benchmark
BenchmarkRunSchema.index({ benchmarkId: 1, status: 1 });
BenchmarkRunSchema.index({ benchmarkId: 1, executedAt: -1 });

// 🎯 STATIC METHODS
BenchmarkRunSchema.statics.findByBenchmark = function(benchmarkId: string) {
  return this.find({ benchmarkId }).populate('benchmarkId');
};

BenchmarkRunSchema.statics.findSuccessfulRuns = function(benchmarkId: string) {
  return this.find({ benchmarkId, status: 'success' }).populate('benchmarkId');
};

BenchmarkRunSchema.statics.getAverageResults = function(benchmarkId: string) {
  return this.aggregate([
    { $match: { benchmarkId: new Types.ObjectId(benchmarkId), status: 'success' } },
    {
      $group: {
        _id: '$benchmarkId',
        avgGasUsed: { $avg: '$results.gasUsed' },
        avgExecutionTime: { $avg: '$results.executionTime' },
        avgStorageSize: { $avg: '$results.storageSize' },
        avgCost: { $avg: '$results.cost' },
        avgEfficiency: { $avg: '$results.efficiency' },
        avgMemoryUsage: { $avg: '$results.memoryUsage' },
        runCount: { $sum: 1 },
        minDuration: { $min: '$duration' },
        maxDuration: { $max: '$duration' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

// 🎯 INSTANCE METHODS
BenchmarkRunSchema.methods.getRunInfo = function() {
  return {
    id: this._id,
    benchmarkId: this.benchmarkId,
    runNumber: this.runNumber,
    results: this.results,
    executedAt: this.executedAt,
    duration: this.duration,
    environment: this.environment,
    status: this.status,
    errorDetails: this.errorDetails,
    createdAt: this.createdAt
  };
};

// 🎯 MIDDLEWARE (HOOKS)
BenchmarkRunSchema.pre('save', function(next) {
  // Ensure error details are only set for failed/timeout runs
  if (this.status === 'success' && this.errorDetails) {
    this.errorDetails = undefined;
  }
  
  // Validate that successful runs have at least one result
  if (this.status === 'success') {
    const hasResults = this.results && (
      this.results.gasUsed !== undefined ||
      this.results.executionTime !== undefined ||
      this.results.storageSize !== undefined ||
      this.results.cost !== undefined ||
      this.results.efficiency !== undefined ||
      this.results.memoryUsage !== undefined
    );
    
    if (!hasResults) {
      next(new Error('Successful benchmark runs must have at least one result'));
      return;
    }
  }
  
  next();
});

// 🎯 EXPORT: Create and export the model
export const BenchmarkRun = model<IBenchmarkRun>('BenchmarkRun', BenchmarkRunSchema);