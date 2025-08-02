import mongoose, { Schema, Document } from 'mongoose';

// Interfaces para datos embebidos
interface OwnerInfo {
  username: string;
  email: string;
  walletAddress: string;
}

interface NetworkInfo {
  name: string;
  chainId: string;
  rpcUrl: string;
  type: 'evm' | 'pvm';
}

interface Deployment {
  type: 'solidity' | 'ink';
  address: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
  deployedAt: Date;
  status: 'success' | 'failed' | 'pending';
  bytecode: string;
  bytecodeSize: string;
  abi: any;
  metadata: {
    compilerVersion: string;
    optimization: boolean;
    verificationStatus: 'verified' | 'unverified';
  };
}

interface Benchmark {
  functionName: string;
  contractType: 'solidity' | 'ink';
  gasUsed: number;
  executionTime: number;
  createdAt: Date;
  completedAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: {
    gasUsed: number;
    executionTime: number;
    storageSize: number;
    cost: number;
    efficiency: number;
  };
  parameters: {
    inputSize: number;
    complexity: string;
    iterations: number;
  };
}

// Interface principal del contrato
export interface IContract extends Document {
  name: string;
  description: string;
  contractType: 'solidity' | 'ink' | 'both';
  sourceCodeHash: string;
  
  // Datos embebidos
  owner: OwnerInfo;
  network: NetworkInfo;
  deployments: Deployment[];
  benchmarks: Benchmark[];
  
  // Metadata
  metadata: {
    version: string;
    tags: string[];
    sourceUrl: string;
    license: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos de instancia
  getLatestDeployment(type: 'solidity' | 'ink'): Deployment | undefined;
  getLatestBenchmark(functionName: string): Benchmark | undefined;
}

// Interface para métodos estáticos del modelo
export interface IContractModel extends mongoose.Model<IContract> {
  // No static methods needed for now
}

// Schema simplificado
const ContractSchema = new Schema<IContract>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  contractType: {
    type: String,
    enum: ['solidity', 'ink', 'both'],
    required: true,
    index: true
  },
  sourceCodeHash: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Source code hash must be a valid SHA-256 hash (64 hex characters)'
    }
  },
  
  // Owner embebido
  owner: {
    username: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Network embebido
  network: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    chainId: {
      type: String,
      required: true,
      trim: true
    },
    rpcUrl: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['evm', 'pvm'],
      required: true
    }
  },
  
  // Deployments embebidos
  deployments: [{
    type: {
      type: String,
      enum: ['solidity', 'ink'],
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    transactionHash: {
      type: String,
      required: true,
      trim: true
    },
    blockNumber: {
      type: Number,
      required: true
    },
    gasUsed: {
      type: Number,
      required: true
    },
    gasPrice: {
      type: String,
      required: true
    },
    deployedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    },
    bytecode: {
      type: String,
      default: null
    },
    bytecodeSize: {
      type: String,
      default: null
    },
    abi: {
      type: Schema.Types.Mixed,
      default: null
    },
    metadata: {
      compilerVersion: {
        type: String,
        default: '0.8.19'
      },
      optimization: {
        type: Boolean,
        default: true
      },
      verificationStatus: {
        type: String,
        enum: ['verified', 'unverified'],
        default: 'unverified'
      }
    }
  }],
  
  // Benchmarks embebidos
  benchmarks: [{
    functionName: {
      type: String,
      required: true,
      trim: true
    },
    contractType: {
      type: String,
      enum: ['solidity', 'ink'],
      required: true
    },
    gasUsed: {
      type: Number,
      required: true
    },
    executionTime: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'completed'
    },
    results: {
      gasUsed: {
        type: Number,
        required: true
      },
      executionTime: {
        type: Number,
        required: true
      },
      storageSize: {
        type: Number,
        default: 0
      },
      cost: {
        type: Number,
        required: true
      },
      efficiency: {
        type: Number,
        required: true
      }
    },
    parameters: {
      inputSize: {
        type: Number,
        required: true
      },
      complexity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      iterations: {
        type: Number,
        default: 1
      }
    }
  }],
  
  // Metadata
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    tags: [{
      type: String,
      trim: true
    }],
    sourceUrl: {
      type: String,
      trim: true,
      default: ''
    },
    license: {
      type: String,
      trim: true,
      default: 'MIT'
    }
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
ContractSchema.index({ 'owner.username': 1 });
ContractSchema.index({ 'network.name': 1 });
ContractSchema.index({ 'network.type': 1 });
ContractSchema.index({ 'deployments.type': 1 });
ContractSchema.index({ 'benchmarks.status': 1 });
ContractSchema.index({ createdAt: -1 });

// Métodos de instancia
ContractSchema.methods.getLatestDeployment = function(type: 'solidity' | 'ink') {
  return this.deployments
    .filter((d: any) => d.type === type)
    .sort((a: any, b: any) => b.deployedAt.getTime() - a.deployedAt.getTime())[0];
};

ContractSchema.methods.getLatestBenchmark = function(functionName: string) {
  return this.benchmarks
    .filter((b: any) => b.functionName === functionName)
    .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())[0];
};

export const Contract = mongoose.model<IContract, IContractModel>('Contract', ContractSchema);
export default Contract; 