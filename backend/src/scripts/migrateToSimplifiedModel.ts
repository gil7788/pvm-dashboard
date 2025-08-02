import mongoose from 'mongoose';
import { Contract } from '../models/Contract';
import { User } from '../models/User';
import { Network } from '../models/Network';
import { Deployment } from '../models/Deployment';
import { Benchmark } from '../models/Benchmark';
import logger from '../utils/Logger';

// Configuración de conexión
const mongoUri = 'mongodb://localhost:27017/dev_pvm-dashboard';

async function migrateToSimplifiedModel() {
  try {
    logger.info('Starting migration to simplified model...');
    
    // Conectar a MongoDB
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
    
    // Obtener todos los contratos existentes
    const oldContracts = await Contract.find({});
    logger.info(`Found ${oldContracts.length} contracts to migrate`);
    
    // Crear nuevos contratos con datos embebidos
    for (const oldContract of oldContracts) {
      logger.info(`Migrating contract: ${oldContract.name}`);
      
      // Obtener datos relacionados
      const user = await User.findById(oldContract.ownerId);
      const network = await Network.findById(oldContract.networkId);
      const deployments = await Deployment.find({ contractId: oldContract._id });
      const benchmarks = await Benchmark.find({ contractId: oldContract._id });
      
      if (!user || !network) {
        logger.warn(`Skipping contract ${oldContract.name} - missing user or network`);
        continue;
      }
      
      // Crear nuevo contrato con datos embebidos
      const newContractData = {
        name: oldContract.name,
        description: oldContract.metadata?.description || '',
        contractType: oldContract.contractType,
        sourceCodeHash: oldContract.sourceCodeHash || 'a'.repeat(64),
        
        // Owner embebido
        owner: {
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress || '0x0000000000000000000000000000000000000000'
        },
        
        // Network embebido
        network: {
          name: network.name,
          chainId: network.chainId,
          rpcUrl: network.rpcUrl,
          type: network.type
        },
        
        // Deployments embebidos
        deployments: deployments.map(deployment => ({
          type: deployment.deploymentType,
          address: deployment.address,
          transactionHash: deployment.transactionHash,
          blockNumber: deployment.blockNumber,
          gasUsed: deployment.gasUsed,
          gasPrice: deployment.gasPrice,
          deployedAt: deployment.deployedAt,
          status: deployment.status,
          bytecode: deployment.metadata?.bytecode || null,
          bytecodeSize: deployment.metadata?.bytecodeSize || null,
          abi: deployment.metadata?.abi || null,
          metadata: {
            compilerVersion: deployment.metadata?.compilerVersion || '0.8.19',
            optimization: deployment.metadata?.optimization || true,
            verificationStatus: deployment.metadata?.verificationStatus || 'unverified'
          }
        })),
        
        // Benchmarks embebidos
        benchmarks: benchmarks.map(benchmark => ({
          functionName: benchmark.functionName || 'unknown',
          contractType: benchmark.contractType || 'solidity',
          gasUsed: benchmark.results?.gasUsed || 0,
          executionTime: benchmark.results?.executionTime || 0,
          createdAt: benchmark.createdAt,
          completedAt: benchmark.completedAt,
          status: benchmark.status,
          results: {
            gasUsed: benchmark.results?.gasUsed || 0,
            executionTime: benchmark.results?.executionTime || 0,
            storageSize: benchmark.results?.storageSize || 0,
            cost: benchmark.results?.cost || 0,
            efficiency: benchmark.results?.efficiency || 0
          },
          parameters: {
            inputSize: benchmark.parameters?.inputSize || 0,
            complexity: benchmark.parameters?.complexity || 'medium',
            iterations: benchmark.parameters?.iterations || 1
          }
        })),
        
        // Metadata
        metadata: {
          version: oldContract.metadata?.version || '1.0.0',
          tags: oldContract.metadata?.tags || [],
          sourceUrl: oldContract.metadata?.sourceUrl || '',
          license: oldContract.metadata?.license || 'MIT'
        }
      };
      
      // Crear nuevo contrato
      const newContract = new Contract(newContractData);
      await newContract.save();
      
      logger.info(`Successfully migrated contract: ${oldContract.name}`);
    }
    
    logger.info('Migration completed successfully!');
    
    // Opcional: Eliminar colecciones antiguas
    logger.info('Do you want to drop old collections? (This will delete all old data)');
    logger.info('To drop old collections, run:');
    logger.info('await mongoose.connection.db.dropCollection("users")');
    logger.info('await mongoose.connection.db.dropCollection("networks")');
    logger.info('await mongoose.connection.db.dropCollection("deployments")');
    logger.info('await mongoose.connection.db.dropCollection("benchmarks")');
    
  } catch (error) {
    logger.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToSimplifiedModel();
}

export default migrateToSimplifiedModel; 