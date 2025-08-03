import MongoManager from '../MongoManager';

export class MongoService {
  private static instance: MongoService;
  private mongoManager: MongoManager;

  private constructor(mongoManager: MongoManager) {
    this.mongoManager = mongoManager;
  }

  public static of(mongoManager: MongoManager): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService(mongoManager);
    }
    return MongoService.instance;
  }

  public map<T>(fn: (self: MongoService) => T): T {
    return fn(this);
  }

  public async isConnected(): Promise<boolean> {
    return this.mongoManager.isConnected();
  }

  public async getConnectionStatus(): Promise<{ connected: boolean; dbName: string }> {
    const connected = await this.mongoManager.isConnected();
    const db = await this.mongoManager.getDb();
    return {
      connected,
      dbName: db.databaseName,
    };
  }
}
