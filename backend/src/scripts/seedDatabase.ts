import mongoose from 'mongoose';
import { Contract, Network, Benchmark, Deployment, User } from '../models';
import logger from '../utils/Logger';

// Helper function to generate valid transaction hash
function generateTransactionHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// 🎯 DATABASE SEEDING SCRIPT
// This script populates the database with sample data for development and testing

const sampleNetworks = [
  {
    name: 'Passethub',
    chainId: '0x1',
    rpcUrl: 'https://rpc.passethub.com',
    explorerUrl: 'https://explorer.passethub.com',
    currency: {
      symbol: 'PETH',
      name: 'Passethub Token',
      decimals: 18
    },
    status: 'active' as const,
    features: {
      supportsSolidity: true,
      supportsInk: true,
      supportsEVM: true,
      supportsWASM: true
    },
    metadata: {
      description: 'Passethub is a Polkadot parachain that supports both EVM and WASM smart contracts',
      website: 'https://passethub.com',
      documentation: 'https://docs.passethub.com',
      github: 'https://github.com/passethub'
    }
  },
  {
    name: 'Polkadot',
    chainId: '0x0',
    rpcUrl: 'https://rpc.polkadot.io',
    explorerUrl: 'https://polkascan.io/polkadot',
    currency: {
      symbol: 'DOT',
      name: 'Polkadot',
      decimals: 10
    },
    status: 'active' as const,
    features: {
      supportsSolidity: false,
      supportsInk: true,
      supportsEVM: false,
      supportsWASM: true
    },
    metadata: {
      description: 'Polkadot is a heterogeneous multi-chain technology',
      website: 'https://polkadot.network',
      documentation: 'https://wiki.polkadot.network',
      github: 'https://github.com/paritytech/polkadot'
    }
  },
  {
    name: 'Ethereum',
    chainId: '0x3',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://etherscan.io',
    currency: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18
    },
    status: 'active' as const,
    features: {
      supportsSolidity: true,
      supportsInk: false,
      supportsEVM: true,
      supportsWASM: false
    },
    metadata: {
      description: 'Ethereum is a decentralized platform for smart contracts',
      website: 'https://ethereum.org',
      documentation: 'https://docs.ethereum.org',
      github: 'https://github.com/ethereum'
    }
  }
];

const sampleContracts = [
  {
    name: 'DeFi Lending Protocol',
    network: 'Passethub',
    contractType: 'both' as const,
    solidityAddress: '0x1234567890123456789012345678901234567890',
    inkAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    solidityDeployedTime: new Date('2024-01-15T10:30:00Z'),
    inkDeployedTime: new Date('2024-01-20T14:45:00Z')
  },
  {
    name: 'NFT Marketplace',
    network: 'Passethub',
    contractType: 'solidity' as const,
    solidityAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    solidityDeployedTime: new Date('2024-02-10T09:15:00Z')
  },
  {
    name: 'DAO Governance',
    network: 'Polkadot',
    contractType: 'ink' as const,
    inkAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    inkDeployedTime: new Date('2024-03-05T16:20:00Z')
  },
  {
    name: 'DEX Aggregator',
    network: 'Ethereum',
    contractType: 'solidity' as const,
    solidityAddress: '0x9876543210987654321098765432109876543210',
    solidityDeployedTime: new Date('2024-01-25T11:00:00Z')
  }
];

const sampleUsers = [
  {
    username: 'alice_dev',
    email: 'alice@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    role: 'developer' as const,
    status: 'active' as const,
    profile: {
      firstName: 'Alice',
      lastName: 'Developer',
      bio: 'Smart contract developer specializing in DeFi protocols',
      github: 'https://github.com/alice-dev',
      twitter: '@alice_dev'
    },
    preferences: {
      notifications: {
        email: true,
        push: false,
        benchmarkUpdates: true,
        deploymentAlerts: true
      },
      theme: 'dark' as const,
      language: 'en' as const
    },
    stats: {
      contractsDeployed: 5,
      benchmarksRun: 12,
      totalGasUsed: 1500000,
      lastActivity: new Date()
    }
  },
  {
    username: 'bob_admin',
    email: 'bob@example.com',
    walletAddress: '0x8ba1f109551bD432803012645aac136c772c3a4b',
    role: 'admin' as const,
    status: 'active' as const,
    profile: {
      firstName: 'Bob',
      lastName: 'Administrator',
      bio: 'Platform administrator and network operator',
      website: 'https://bob-admin.com'
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        benchmarkUpdates: true,
        deploymentAlerts: true
      },
      theme: 'light' as const,
      language: 'en' as const
    },
    stats: {
      contractsDeployed: 2,
      benchmarksRun: 8,
      totalGasUsed: 800000,
      lastActivity: new Date()
    }
  }
];

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Connect to MongoDB - use same database as backend
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_pvm-dashboard';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Network.deleteMany({}),
      Contract.deleteMany({}),
      User.deleteMany({}),
      Benchmark.deleteMany({}),
      Deployment.deleteMany({})
    ]);
    logger.info('Cleared existing data');

    // Insert networks
    const networks = await Network.insertMany(sampleNetworks);
    logger.info(`Inserted ${networks.length} networks`);

    // Insert users
    const users = await User.insertMany(sampleUsers);
    logger.info(`Inserted ${users.length} users`);

    // Insert contracts with denormalized data directly
    const contracts = [];
    for (let i = 0; i < sampleContracts.length; i++) {
      const contractData = sampleContracts[i];
      const owner = users[i % users.length];
      const network = networks.find(n => n.name === contractData.network);
      
      if (!network) {
        logger.warn(`Network not found for contract ${contractData.name}`);
        continue;
      }
      
      const contract = new Contract({
        name: contractData.name,
        ownerId: owner._id,
        networkId: network._id,
        contractType: contractData.contractType,
        sourceCodeHash: generateTransactionHash().replace('0x', ''),
        // Denormalized data
        ownerInfo: {
          username: owner.username,
          email: owner.email
        },
        networkInfo: {
          name: network.name,
          chainId: network.chainId
        },
        metadata: {
          description: `Sample contract: ${contractData.name}`,
          version: '1.0.0',
          tags: ['sample', 'test'],
          sourceUrl: 'https://github.com/example/contracts'
        }
      });
      
      await contract.save();
      contracts.push(contract);
    }
    logger.info(`Inserted ${contracts.length} contracts`);

    // Create sample deployments based on original contract data
    const deployments = [];
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      const originalContract = sampleContracts[i];
      
      if (originalContract.solidityAddress) {
        deployments.push({
          contractId: contract._id,
          networkId: contract.networkId,
          deployerId: contract.ownerId,
          deploymentType: 'solidity' as const,
          address: originalContract.solidityAddress,
          transactionHash: generateTransactionHash(),
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          gasUsed: Math.floor(Math.random() * 500000) + 100000,
          gasPrice: '0x' + Math.floor(Math.random() * 1000000000).toString(16),
          deployedAt: originalContract.solidityDeployedTime,
          status: 'success' as const,
          metadata: {
            compilerVersion: '0.8.19',
            optimization: true,
            verificationStatus: 'verified' as const,
            abi: [
              {
                "inputs": [],
                "name": "getBalance",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [{"name": "amount", "type": "uint256"}],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "inputs": [{"name": "amount", "type": "uint256"}],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ],
            bytecode: '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e1a7d4d1461003b578063d0e30db014610057575b600080fd5b610055600480360381019061005091906100c3565b610073565b005b610071600480360381019061006c91906100c3565b61007d565b005b8060008190555050565b8060008190555050565b600080fd5b6000819050919050565b6100a08161008d565b81146100ab57600080fd5b50565b6000813590506100bd81610097565b92915050565b6000602082840312156100d9576100d8610088565b5b60006100e7848285016100ae565b9150509291505056fea2646970667358221220a1b2c3d4e5f67890123456789012345678901234567890123456789012345678964736f6c63430008120033',
            bytecodeSize: '512 bytes'
          }
        });
      }
      
      if (originalContract.inkAddress) {
        deployments.push({
          contractId: contract._id,
          networkId: contract.networkId,
          deployerId: contract.ownerId,
          deploymentType: 'ink' as const,
          address: originalContract.inkAddress,
          transactionHash: generateTransactionHash(),
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          gasUsed: Math.floor(Math.random() * 500000) + 100000,
          gasPrice: '0x' + Math.floor(Math.random() * 1000000000).toString(16),
          deployedAt: originalContract.inkDeployedTime,
          status: 'success' as const,
          metadata: {
            compilerVersion: '4.0.0',
            optimization: true,
            verificationStatus: 'verified' as const
          }
        });
      }
    }

    // Insert deployments one by one to ensure hooks are triggered
    const createdDeployments = [];
    for (const deploymentData of deployments) {
      const deployment = new Deployment(deploymentData);
      await deployment.save();
      createdDeployments.push(deployment);
    }
    logger.info(`Inserted ${createdDeployments.length} deployments`);

    // Create sample benchmarks with deployment references
    const benchmarks = [];
    for (const contract of contracts) {
      // Find deployments for this contract
      const contractDeployments = createdDeployments.filter(d => (d.contractId as any).toString() === (contract._id as any).toString());
      
      if (contractDeployments.length === 0) {
        logger.warn(`No deployments found for contract ${contract.name}`);
        continue;
      }
      
      const benchmarkTypes = ['gas', 'execution_time', 'storage', 'comprehensive'];
      for (const benchmarkType of benchmarkTypes) {
        // Use a random deployment for this benchmark
        const deployment = contractDeployments[Math.floor(Math.random() * contractDeployments.length)];
        const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
        const completedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Up to 24h later
        
        benchmarks.push({
          contractId: contract._id,
          deploymentId: deployment._id, // Reference to specific deployment
          requestedBy: contract.ownerId,
          benchmarkType: benchmarkType as any,
          results: {
            gasUsed: Math.floor(Math.random() * 1000000) + 50000,
            executionTime: Math.random() * 1000 + 100,
            storageSize: Math.floor(Math.random() * 10000) + 1000,
            cost: Math.random() * 10 + 0.1,
            efficiency: Math.random() * 100
          },
          parameters: {
            inputSize: Math.floor(Math.random() * 1000) + 100,
            complexity: ['low', 'medium', 'high', 'extreme'][Math.floor(Math.random() * 4)],
            iterations: Math.floor(Math.random() * 1000) + 100
          },
          status: 'completed' as const,
          createdAt: createdAt,
          completedAt: completedAt,
          metadata: {
            compiler: 'solc',
            optimization: Math.random() > 0.5,
            environment: 'production',
            runCount: Math.floor(Math.random() * 10) + 1
          }
        });
      }
    }

    const createdBenchmarks = await Benchmark.insertMany(benchmarks);
    logger.info(`Inserted ${createdBenchmarks.length} benchmarks`);

    logger.info('Database seeding completed successfully!');
    logger.info(`Summary:
      - Networks: ${networks.length}
      - Users: ${users.length}
      - Contracts: ${contracts.length}
      - Deployments: ${createdDeployments.length}
      - Benchmarks: ${createdBenchmarks.length}
    `);

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the seeding script if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase }; 