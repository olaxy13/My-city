import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = env.PORT || 4000;

async function startServer() {
  try {
    // Verify DB connectivity
    await prisma.$connect();
    console.log('✅ Connected to Database successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 City Discovery Backend API is running on http://localhost:${PORT}`);
      console.log(`📚 OpenAPI / Swagger Documentation available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
