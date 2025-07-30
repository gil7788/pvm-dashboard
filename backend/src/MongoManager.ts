import mongoose, { Connection, Document } from 'mongoose';
import logger from './utils/Logger';
import config from './env';

class MongoManager {
    private static instance: MongoManager;
    private connection: Connection | null = null;
    private isConnecting: boolean = false;
    private connectPromise: Promise<void> | null = null;
    private retentionService!: RetentionService;

    private constructor(private uri: string, private dbName: string) {
        // Configure mongoose
        mongoose.set('strictQuery', false);
        
        // Handle connection events
        mongoose.connection.on('connected', () => {
            logger.info(`Connected to MongoDB ${this.dbName} at ${this.uri}`);
        });

        mongoose.connection.on('error', (error) => {
            logger.error(`MongoDB connection error: ${error}`);
            this.handleDisconnect(error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB connection disconnected');
            this.handleDisconnect();
        });
    }

    public static getInstance(uri: string, dbName: string): MongoManager {
        if (!MongoManager.instance) {
            MongoManager.instance = new MongoManager(uri, dbName);
        }
        return MongoManager.instance;
    }

    private handleDisconnect(error?: any): void {
        if (error) {
            logger.error(`MongoDB connection lost: ${error}`);
        }
        this.connection = null;
        this.scheduleReconnect();
    }

    public async connect(): Promise<void> {
        if (this.connection && mongoose.connection.readyState === 1) {
            return; // Already connected
        }

        if (this.isConnecting) {
            if (this.connectPromise) {
                await this.connectPromise;
            }
            return;
        }

        this.isConnecting = true;
        this.connectPromise = this.tryConnectWithRetry();

        try {
            await this.connectPromise;
            this.connection = mongoose.connection;
            this.retentionService = RetentionService.getInstance(this);
        } catch (error) {
            logger.error(`Failed to connect to MongoDB: ${error}`);
            console.error(`Failed to connect to MongoDB: ${error}`);
            this.scheduleReconnect();
        } finally {
            this.isConnecting = false;
            this.connectPromise = null;
        }
    }

    private async tryConnectWithRetry(): Promise<void> {
        const retryDelay = 5000; // 5 seconds
        while (true) {
            try {
                await mongoose.connect(this.uri, {
                    dbName: this.dbName,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                });
                return;
            } catch (error) {
                logger.error(`Failed to connect to MongoDB: ${error}`);
                console.error(`Failed to connect to MongoDB: ${error}`);
                logger.warn(`Application is running without Mongo connection. Retrying in ${retryDelay}ms...`);
                console.warn(`Application is running without Mongo connection. Retrying in ${retryDelay}ms...`);
                await this.delay(retryDelay);
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private scheduleReconnect(): void {
        setTimeout(() => {
            this.connect().catch(err => {
                logger.error(`Failed to reconnect to MongoDB: ${err}`);
                this.scheduleReconnect();
            });
        }, 5000);
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            this.connection = null;
            logger.info('Disconnected from MongoDB');
            console.log('Disconnected from MongoDB');
        } catch (error) {
            logger.error(`Failed to disconnect from MongoDB: ${error}`);
            console.error(`Failed to disconnect from MongoDB: ${error}`);
        }
    }

    private async ensureConnected(): Promise<void> {
        if (!this.connection || mongoose.connection.readyState !== 1) {
            await this.connect();
        }
    }

    public async getConnection(): Promise<Connection> {
        await this.ensureConnected();
        return mongoose.connection;
    }

    public async getDb(): Promise<any> {
        const connection = await this.getConnection();
        return connection.db;
    }

    public async deleteOlderThan<T extends Document>(collectionName: string, days: number): Promise<void> {
        const date = new Date();
        date.setDate(date.getDate() - days);

        try {
            const db = await this.getDb();
            const collection = db.collection(collectionName);
            await collection.deleteMany({ createdAt: { $lte: date } });
            logger.info(`Deleted documents older than ${days} days from collection ${collectionName}`);
        } catch (error) {
            logger.error(`Failed to delete documents older than ${days} days from ${collectionName}: ${error}`);
            throw error;
        }
    }

    public async insertMany<T extends Document>(collectionName: string, documents: T[]): Promise<void> {
        try {
            const db = await this.getDb();
            const collection = db.collection(collectionName);
            await collection.insertMany(documents);
        } catch (error) {
            logger.error(`Failed to insert documents into ${collectionName}: ${error}`);
            throw error;
        }
    }

    public async deleteCollection(collectionName: string): Promise<void> {
        try {
            const db = await this.getDb();
            const collection = db.collection(collectionName);
            await collection.drop();
            logger.info(`Deleted collection ${collectionName}`);
        } catch (error) {
            logger.error(`Failed to delete collection ${collectionName}: ${error}`);
            throw error;
        }
    }

    public setRetentionDays(days: number): void {
        if (this.retentionService) {
            this.retentionService.setRetentionDays(days);
        }
    }

    public isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }
}

class RetentionService {
    private static instance: RetentionService;
    private mongoManager: MongoManager;
    private retentionDays: number;

    private constructor(mongoManager: MongoManager) {
        this.mongoManager = mongoManager;
        this.retentionDays = config.retentionDaysThreshold || 30; // Default to 30 days
        this.initRetentionJob();
    }

    public static getInstance(mongoManager: MongoManager): RetentionService {
        if (!RetentionService.instance) {
            RetentionService.instance = new RetentionService(mongoManager);
        }
        return RetentionService.instance;
    }

    public async runRetention(): Promise<void> {
        try {
            const db = await this.mongoManager.getDb();
            const collections = await db.listCollections().toArray();
            
            for (const collection of collections) {
                const collectionName = collection.name;
                // Skip system collections
                if (!collectionName.startsWith('system.')) {
                    await this.mongoManager.deleteOlderThan(collectionName, this.retentionDays);
                }
            }
            logger.info('Retention process completed successfully');
        } catch (error) {
            logger.error('Retention process failed:', error);
            throw error;
        }
    }

    private initRetentionJob(): void {
        // Schedule the retention process to run once a day at 3 am
        // For now, we'll use a simple interval since node-schedule isn't installed
        setInterval(() => {
            const now = new Date();
            if (now.getHours() === 3 && now.getMinutes() === 0) {
                this.runRetention()
                    .then(() => {
                        console.log('Retention process completed successfully.');
                    })
                    .catch(error => {
                        console.error('Retention process failed:', error);
                    });
            }
        }, 60000); // Check every minute
    }

    public setRetentionDays(days: number): void {
        this.retentionDays = days;
    }
}

export default MongoManager; 