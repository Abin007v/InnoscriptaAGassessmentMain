import express from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import emailRoutes from './routes/emailRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { ElasticService } from './services/elasticService.js';

dotenv.config();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api', emailRoutes);
app.use('/api', folderRoutes);
app.use('/api', healthRoutes);

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    await ElasticService.initializeIndices();
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();
