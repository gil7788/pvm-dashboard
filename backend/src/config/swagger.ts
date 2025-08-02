import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'PVM Dashboard API',
        version: '1.0.0',
        description: 'API documentation for the PVM Dashboard - Smart contract benchmarking for Polkadot ecosystem',
        contact: {
            name: 'PVM Dashboard Team'
        }
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Development server'
        }
    ],
    tags: [
        {
            name: 'Contracts',
            description: 'Contract management operations'
        },
        {
            name: 'Health',
            description: 'API health and status'
        }
    ],
    components: {
        schemas: {
            Contract: {
                type: 'object',
                properties: {
                    _id: { type: 'string', description: 'Contract unique identifier' },
                    name: { type: 'string', description: 'Contract name' },
                    description: { type: 'string', description: 'Contract description' },
                    contractType: { 
                        type: 'string', 
                        enum: ['solidity', 'ink', 'both'],
                        description: 'Type of contract'
                    },
                    network: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Network name' },
                            chainId: { type: 'string', description: 'Chain ID' },
                            type: { type: 'string', enum: ['evm', 'pvm'], description: 'Network type' }
                        }
                    },
                    deployments: {
                        type: 'array',
                        description: 'Contract deployments',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['solidity', 'ink'] },
                                address: { type: 'string', description: 'Contract address' },
                                gasUsed: { type: 'number', description: 'Gas used for deployment' }
                            }
                        }
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string', description: 'Error message' }
                }
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: [path.join(__dirname, '../routes/*.ts')],
};

const swaggerSpec = swaggerJSDoc(options);

export {swaggerUi, swaggerSpec}


