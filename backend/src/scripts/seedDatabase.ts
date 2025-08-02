import mongoose from 'mongoose';
import { Contract } from '../models/Contract';
import logger from '../utils/Logger';

// Helper function to generate valid transaction hash
function generateTransactionHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// 🎯 DATABASE SEEDING SCRIPT - Simplified Model
// This script populates the database with sample contracts using the new simplified model

const sampleContracts = [
  {
    name: 'SimpleStorage',
    description: 'A simple storage contract for demonstration',
    contractType: 'solidity' as const,
    sourceCodeHash: 'a'.repeat(64),
    owner: {
      username: 'alice',
      email: 'alice@example.com',
      walletAddress: '0x1234567890123456789012345678901234567890'
    },
    network: {
      name: 'Passethub',
      chainId: '0x1',
      rpcUrl: 'https://rpc.passethub.com',
      type: 'pvm' as const
    },
    deployments: [
      {
        type: 'solidity' as const,
        address: '0x9876543210987654321098765432109876543210',
        transactionHash: generateTransactionHash(),
        blockNumber: 1234567,
        gasUsed: 245000,
        gasPrice: '0x' + 'b'.repeat(16),
        deployedAt: new Date('2024-01-15'),
        status: 'success' as const,
        bytecode: '0x608060405234801561001057600080fd5b50...',
        bytecodeSize: '12.5 KB',
        abi: [
          { "inputs": [], "name": "getBalance", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
          { "inputs": [{"name": "amount", "type": "uint256"}], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
        ],
        metadata: {
          compilerVersion: '0.8.19',
          optimization: true,
          verificationStatus: 'verified' as const
        }
      }
    ],
    benchmarks: [
      {
        functionName: 'getBalance',
        contractType: 'solidity' as const,
        gasUsed: 245000,
        executionTime: 15,
        createdAt: new Date('2024-01-16'),
        completedAt: new Date('2024-01-16'),
        status: 'completed' as const,
        results: {
          gasUsed: 245000,
          executionTime: 15,
          storageSize: 32,
          cost: 0.000245,
          efficiency: 85
        },
        parameters: {
          inputSize: 0,
          complexity: 'low',
          iterations: 1
        }
      }
    ],
    metadata: {
      version: '1.0.0',
      tags: ['storage', 'demo'],
      sourceUrl: 'https://github.com/example/simple-storage',
      license: 'MIT'
    }
  },
  {
    name: 'TokenContract',
    description: 'A token contract supporting both Solidity and ink!',
    contractType: 'both' as const,
    sourceCodeHash: 'b'.repeat(64),
    owner: {
      username: 'bob',
      email: 'bob@example.com',
      walletAddress: '0x2345678901234567890123456789012345678901'
    },
    network: {
      name: 'Passethub',
      chainId: '0x1',
      rpcUrl: 'https://rpc.passethub.com',
      type: 'pvm' as const
    },
    deployments: [
      {
        type: 'solidity' as const,
        address: '0x8765432109876543210987654321098765432109',
        transactionHash: generateTransactionHash(),
        blockNumber: 1234568,
        gasUsed: 350000,
        gasPrice: '0x' + 'b'.repeat(16),
        deployedAt: new Date('2024-01-17'),
        status: 'success' as const,
        bytecode: '0x608060405234801561001057600080fd5b50...',
        bytecodeSize: '15.2 KB',
        abi: [
          { "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
          { "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function" }
        ],
        metadata: {
          compilerVersion: '0.8.19',
          optimization: true,
          verificationStatus: 'verified' as const
        }
      },
      {
        type: 'ink' as const,
        address: '0x7654321098765432109876543210987654321098',
        transactionHash: generateTransactionHash(),
        blockNumber: 1234569,
        gasUsed: 280000,
        gasPrice: '0x' + 'b'.repeat(16),
        deployedAt: new Date('2024-01-18'),
        status: 'success' as const,
        bytecode: '0x0061736d0100000001...',
        bytecodeSize: '10.8 KB',
        abi: { spec: { messages: [
          { name: 'total_supply', args: [], returnType: { type: 'u128' } },
          { name: 'transfer', args: [{ name: 'to', type: 'AccountId' }, { name: 'amount', type: 'u128' }], returnType: { type: 'bool' } }
        ]}},
        metadata: {
          compilerVersion: '4.0.0',
          optimization: true,
          verificationStatus: 'verified' as const
        }
      }
    ],
    benchmarks: [
      {
        functionName: 'totalSupply',
        contractType: 'solidity' as const,
        gasUsed: 350000,
        executionTime: 20,
        createdAt: new Date('2024-01-19'),
        completedAt: new Date('2024-01-19'),
        status: 'completed' as const,
        results: {
          gasUsed: 350000,
          executionTime: 20,
          storageSize: 64,
          cost: 0.00035,
          efficiency: 78
        },
        parameters: {
          inputSize: 0,
          complexity: 'medium',
          iterations: 1
        }
      },
      {
        functionName: 'total_supply',
        contractType: 'ink' as const,
        gasUsed: 280000,
        executionTime: 18,
        createdAt: new Date('2024-01-20'),
        completedAt: new Date('2024-01-20'),
        status: 'completed' as const,
        results: {
          gasUsed: 280000,
          executionTime: 18,
          storageSize: 48,
          cost: 0.00028,
          efficiency: 82
        },
        parameters: {
          inputSize: 0,
          complexity: 'medium',
          iterations: 1
        }
      }
    ],
    metadata: {
      version: '2.0.0',
      tags: ['token', 'multi-runtime'],
      sourceUrl: 'https://github.com/example/token-contract',
      license: 'MIT'
    }
  },
  {
    name: 'VotingSystem',
    description: 'A voting system implemented in ink!',
    contractType: 'ink' as const,
    sourceCodeHash: 'c'.repeat(64),
    owner: {
      username: 'charlie',
      email: 'charlie@example.com',
      walletAddress: '0x3456789012345678901234567890123456789012'
    },
    network: {
      name: 'Passethub',
      chainId: '0x1',
      rpcUrl: 'https://rpc.passethub.com',
      type: 'pvm' as const
    },
    deployments: [
      {
        type: 'ink' as const,
        address: '0x6543210987654321098765432109876543210987',
        transactionHash: generateTransactionHash(),
        blockNumber: 1234570,
        gasUsed: 420000,
        gasPrice: '0x' + 'b'.repeat(16),
        deployedAt: new Date('2024-01-21'),
        status: 'success' as const,
        bytecode: '0x0061736d0100000001...',
        bytecodeSize: '18.5 KB',
        abi: { spec: { messages: [
          { name: 'create_proposal', args: [{ name: 'description', type: 'String' }], returnType: { type: 'u32' } },
          { name: 'vote', args: [{ name: 'proposal_id', type: 'u32' }, { name: 'support', type: 'bool' }], returnType: { type: 'bool' } }
        ]}},
        metadata: {
          compilerVersion: '4.0.0',
          optimization: true,
          verificationStatus: 'verified' as const
        }
      }
    ],
    benchmarks: [
      {
        functionName: 'create_proposal',
        contractType: 'ink' as const,
        gasUsed: 420000,
        executionTime: 25,
        createdAt: new Date('2024-01-22'),
        completedAt: new Date('2024-01-22'),
        status: 'completed' as const,
        results: {
          gasUsed: 420000,
          executionTime: 25,
          storageSize: 128,
          cost: 0.00042,
          efficiency: 75
        },
        parameters: {
          inputSize: 50,
          complexity: 'high',
          iterations: 1
        }
      }
    ],
    metadata: {
      version: '1.5.0',
      tags: ['voting', 'governance'],
      sourceUrl: 'https://github.com/example/voting-system',
      license: 'MIT'
    }
  },
  {
    name: 'DeFi Lending Protocol',
    description: 'A decentralized lending protocol supporting multiple runtimes',
    contractType: 'both' as const,
    sourceCodeHash: 'd'.repeat(64),
    owner: {
      username: 'defi_user',
      email: 'defi@example.com',
      walletAddress: '0x4567890123456789012345678901234567890123'
    },
    network: {
      name: 'Passethub',
      chainId: '0x1',
      rpcUrl: 'https://rpc.passethub.com',
      type: 'pvm' as const
    },
    deployments: [
      {
        type: 'solidity' as const,
        address: '0x1234567890123456789012345678901234567890',
        transactionHash: generateTransactionHash(),
        blockNumber: 1234571,
        gasUsed: 500000,
        gasPrice: '0x' + 'b'.repeat(16),
        deployedAt: new Date('2024-01-23'),
        status: 'success' as const,
        bytecode: '0x608060405234801561001057600080fd5b50...',
        bytecodeSize: '25.8 KB',
        abi: [
          { "inputs": [{"name": "amount", "type": "uint256"}], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
          { "inputs": [{"name": "amount", "type": "uint256"}], "name": "borrow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
        ],
        metadata: {
          compilerVersion: '0.8.19',
          optimization: true,
          verificationStatus: 'verified' as const
        }
      },
      {
        type: 'ink' as const,
        address: '0x5432109876543210987654321098765432109876',
        transactionHash: generateTransactionHash(),
        blockNumber: 1234572,
        gasUsed: 380000,
        gasPrice: '0x' + 'b'.repeat(16),
        deployedAt: new Date('2024-01-24'),
        status: 'success' as const,
        bytecode: '0x0061736d0100000001...',
        bytecodeSize: '22.1 KB',
        abi: { spec: { messages: [
          { name: 'deposit', args: [{ name: 'amount', type: 'u128' }], returnType: { type: 'bool' } },
          { name: 'borrow', args: [{ name: 'amount', type: 'u128' }], returnType: { type: 'bool' } }
        ]}},
        metadata: {
          compilerVersion: '4.0.0',
          optimization: true,
          verificationStatus: 'verified' as const
        }
      }
    ],
    benchmarks: [
      {
        functionName: 'deposit',
        contractType: 'solidity' as const,
        gasUsed: 500000,
        executionTime: 30,
        createdAt: new Date('2024-01-25'),
        completedAt: new Date('2024-01-25'),
        status: 'completed' as const,
        results: {
          gasUsed: 500000,
          executionTime: 30,
          storageSize: 256,
          cost: 0.0005,
          efficiency: 70
        },
        parameters: {
          inputSize: 32,
          complexity: 'high',
          iterations: 1
        }
      },
      {
        functionName: 'deposit',
        contractType: 'ink' as const,
        gasUsed: 380000,
        executionTime: 22,
        createdAt: new Date('2024-01-26'),
        completedAt: new Date('2024-01-26'),
        status: 'completed' as const,
        results: {
          gasUsed: 380000,
          executionTime: 22,
          storageSize: 192,
          cost: 0.00038,
          efficiency: 80
        },
        parameters: {
          inputSize: 16,
          complexity: 'high',
          iterations: 1
        }
      }
    ],
    metadata: {
      version: '3.0.0',
      tags: ['defi', 'lending', 'multi-runtime'],
      sourceUrl: 'https://github.com/example/defi-lending',
      license: 'MIT'
    }
  }
];

async function seedDatabase() {
  try {
    logger.info('Starting database seeding with simplified model...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dev_pvm-dashboard';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
    
    // Clear existing contracts
    await Contract.deleteMany({});
    logger.info('Cleared existing contracts');
    
    // Insert contracts with embedded data
    const createdContracts = [];
    for (const contractData of sampleContracts) {
      const contract = new Contract(contractData);
      await contract.save();
      createdContracts.push(contract);
      logger.info(`Created contract: ${contract.name}`);
    }
    
    logger.info(`Successfully seeded database with ${createdContracts.length} contracts`);
    logger.info('Sample contracts created:');
    createdContracts.forEach(contract => {
      logger.info(`- ${contract.name} (${contract.contractType}) on ${contract.network.name}`);
      logger.info(`  Owner: ${contract.owner.username}`);
      logger.info(`  Deployments: ${contract.deployments.length}`);
      logger.info(`  Benchmarks: ${contract.benchmarks.length}`);
    });
    
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase; 