import mongoose from 'mongoose';
import { Contract } from '../models/Contract';
import { Deployment } from '../models/Deployment';
import { Logger } from '../utils/Logger';

const logger = Logger.getInstance();

async function updateContractDeployments() {
  try {
    logger.info('Starting contract deployment updates...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_pvm-dashboard';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Get all contracts
    const contracts = await Contract.find();
    logger.info(`Found ${contracts.length} contracts`);

    // Get all deployments
    const deployments = await Deployment.find();
    logger.info(`Found ${deployments.length} deployments`);

    // Update each contract with its latest deployment info
    for (const contract of contracts) {
      const contractDeployments = deployments.filter(
        d => (d.contractId as any).toString() === (contract._id as any).toString()
      );

      if (contractDeployments.length > 0) {
        // Find latest solidity deployment
        const latestSolidityDeployment = contractDeployments
          .filter(d => d.deploymentType === 'solidity')
          .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime())[0];

        // Find latest ink deployment
        const latestInkDeployment = contractDeployments
          .filter(d => d.deploymentType === 'ink')
          .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime())[0];

        // Update contract with latest deployment info
        if (!contract.latestDeployment) {
          contract.latestDeployment = {
            network: contract.networkInfo.name
          };
        }

        if (latestSolidityDeployment) {
          contract.latestDeployment.solidityAddress = latestSolidityDeployment.address;
          contract.latestDeployment.solidityDeployedTime = latestSolidityDeployment.deployedAt;
        }

        if (latestInkDeployment) {
          contract.latestDeployment.inkAddress = latestInkDeployment.address;
          contract.latestDeployment.inkDeployedTime = latestInkDeployment.deployedAt;
        }

        await contract.save();
        logger.info(`Updated contract ${contract.name} with deployment info`);
      }
    }

    logger.info('Contract deployment updates completed successfully!');

  } catch (error) {
    logger.error('Error updating contract deployments:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  updateContractDeployments()
    .then(() => {
      console.log('✅ Contract deployment updates completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Contract deployment updates failed:', error);
      process.exit(1);
    });
}

export { updateContractDeployments }; 