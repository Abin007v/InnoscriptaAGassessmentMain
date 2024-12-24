import express from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import emailRoutes from './routes/emailRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { ElasticService } from './services/elasticService.js';
import authRoutes from './routes/authRoutes.js';
import debugRoutes from './routes/debugRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api', emailRoutes);
app.use('/api', folderRoutes);
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);

// Debug routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
}

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    // Initialize Elasticsearch indices
    await ElasticService.initializeIndices();
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log('All indices initialized successfully');
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();
