import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'PVM Dashboard API',
        version: '1.0.0',
        description: 'API for Ink! Benchmarch Dashboard',
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
            description: 'Contract operations'
        }
    ],
    components: {
        schemas: {
            Contract: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    contractType: { type: 'string' },
                    network: { type: 'object' },
                    deployments: { type: 'array' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                }
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

export {swaggerUi, swaggerSpec}


