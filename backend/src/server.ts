import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerSpec from '../docs/swagger.js';
import healthRoutes from '../routes/health.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Attendance Management System API is running');
});

// Swagger JSON Endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Stoplight Elements Swagger UI
app.get('/docs', (req: Request, res: Response) => {
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>AMS API Docs</title>
        <!-- Stoplight Elements -->
        <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
      </head>
      <body style="height: 100vh;">
        <elements-api
          apiDescriptionUrl="/api-docs.json"
          router="hash"
          layout="sidebar"
          logo="https://stoplight.io/images/logo-icon-light.svg"
        />
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
