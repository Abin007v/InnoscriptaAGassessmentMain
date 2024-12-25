import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import corsOptions from './config/corsConfig.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { ElasticService } from './services/elasticService.js';
import debugRoutes from './routes/debugRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', healthRoutes);

// Debug routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
  console.log('🔧 Debug routes enabled');
}

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    // Setup Elasticsearch indices
    await ElasticService.setupIndices();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
