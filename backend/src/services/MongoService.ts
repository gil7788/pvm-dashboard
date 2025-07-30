import logger from '../utils/Logger';
import MongoManager from '../MongoManager';
import { ContractService } from './ContractService';
import { NetworkService } from './NetworkService';
import { BenchmarkService } from './BenchmarkService';
import { DeploymentService } from './DeploymentService';
import { BenchmarkRunService } from './BenchmarkRunService';

export class MongoService {
    private static instance: MongoService;
    private mongoManager: MongoManager;
    private contractService: ContractService;
    private networkService: NetworkService;
    private benchmarkService: BenchmarkService;
    private deploymentService: DeploymentService;
    private benchmarkRunService: BenchmarkRunService;

    private constructor(mongoManager: MongoManager) {
        this.mongoManager = mongoManager;
        this.contractService = new ContractService();
        this.networkService = new NetworkService();
        this.benchmarkService = new BenchmarkService();
        this.deploymentService = new DeploymentService();
        this.benchmarkRunService = new BenchmarkRunService();
    }

    public static getInstance(mongoManager: MongoManager): MongoService {
        if (!MongoService.instance) {
            MongoService.instance = new MongoService(mongoManager);
        }
        return MongoService.instance;
    }

    public getContractService(): ContractService {
        return this.contractService;
    }

    public getNetworkService(): NetworkService {
        return this.networkService;
    }

    public getBenchmarkService(): BenchmarkService {
        return this.benchmarkService;
    }

    public getDeploymentService(): DeploymentService {
        return this.deploymentService;
    }

    public getBenchmarkRunService(): BenchmarkRunService {
        return this.benchmarkRunService;
    }

    public async isConnected(): Promise<boolean> {
        return this.mongoManager.isConnected();
    }

    public async getConnectionStatus(): Promise<{ connected: boolean; dbName: string }> {
        const connected = this.mongoManager.isConnected();
        const db = await this.mongoManager.getDb();
        return {
            connected,
            dbName: db.databaseName
        };
    }

    public async healthCheck(): Promise<{ 
        status: 'healthy' | 'degraded' | 'unhealthy';
        message: string;
        checks: {
            database: boolean;
            collections: boolean;
        }
    }> {
        try {
            const connected = await this.isConnected();
            if (!connected) {
                return {
                    status: 'unhealthy',
                    message: 'Database connection failed',
                    checks: {
                        database: false,
                        collections: false
                    }
                };
            }

            // Check if collections exist and are accessible
            const db = await this.mongoManager.getDb();
            const collections = await db.listCollections().toArray();
            const hasCollections = collections.length > 0;

            return {
                status: hasCollections ? 'healthy' : 'degraded',
                message: hasCollections ? 'All systems operational' : 'Database connected but no collections found',
                checks: {
                    database: true,
                    collections: hasCollections
                }
            };
        } catch (error) {
            logger.error('Health check failed:', error);
            return {
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Unknown error',
                checks: {
                    database: false,
                    collections: false
                }
            };
        }
    }
}