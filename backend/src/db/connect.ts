import { MongoClient, Db } from 'mongodb';
import config from '../env';

const client = new MongoClient(config.connectionString);
let db: Db;

export async function connect(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    await client.connect();
    console.log("Connected successfully to the database " + config.dbName);
    db = client.db(config.dbName);
    return db;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function closeConnection(): Promise<void> {
  await client.close();
}
