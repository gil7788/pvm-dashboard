import dotenv from 'dotenv';

dotenv.config();
const environment = (process.env.ENV as 'dev' | 'release') || 'dev';

interface Config {
    dbName: string;
    port: string;
    env: 'dev' | 'release';
    connectionString: string;
    retentionDaysThreshold: number;
}

const releaseConfig: Config = {
    dbName: process.env.DB_NAME || 'default_db_name',
    port: process.env.PORT || '3001',
    env: environment,
    connectionString: process.env.CONNECTION_STRING || "mongodb://localhost:27017",
    retentionDaysThreshold: parseInt(process.env.RETENTION_DAYS_THRESHOLD || '30'),
}

const devConfig: Config = {
    dbName: getDevDatabaseName(process.env.DB_NAME || 'default_db_name'),
    port: process.env.PORT || '3001',
    env: environment,
    connectionString: process.env.MONGO_URI || "mongodb://localhost:27017",
    retentionDaysThreshold: parseInt(process.env.RETENTION_DAYS_THRESHOLD || '30'),
}

function getDevDatabaseName(releaseDatabaseName: string): string {
    return 'dev_' + releaseDatabaseName;
}

const config = environment === 'release' ? releaseConfig : devConfig;
console.log("Config: ", config);

export default config;
