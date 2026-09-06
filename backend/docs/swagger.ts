import swaggerJsdoc from 'swagger-jsdoc';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Attendance Management System API',
      version: '1.0.0',
      description: 'API documentation for the AMS backend.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  // Look for swagger comments in any YAML or TS files inside the docs folder
  apis: [resolve(__dirname, '*.yaml'), resolve(__dirname, '*.yml'), resolve(__dirname, '*.ts')],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
