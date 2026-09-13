import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { env } from './config/env';
import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false, // For Swagger UI assets
}));

// CORS configured with Zod parsed allowed origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser callers (cURL, Postman, mobile) or origins matching whitelist
    if (!origin || env.ALLOWED_ORIGINS.includes(origin) || env.ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI documentation route
const swaggerJsonPath = path.join(__dirname, 'docs/swagger.json');
if (fs.existsSync(swaggerJsonPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  app.get('/docs', (_req: Request, res: Response) => {
    res.json({
      message: 'OpenAPI Swagger documentation will be available after running `npm run build:tsoa`',
    });
  });
}

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'City Discovery Platform API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
  });
});

// Register tsoa auto-generated routes
try {
  RegisterRoutes(app);
} catch (err) {
  console.warn('tsoa routes not yet generated. Run `npm run build:tsoa` to generate routes.');
}

// Global error handler (must be last)
app.use(errorHandler);

export default app;
