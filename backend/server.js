import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsConfig.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import { setupModels } from './models/index.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/folders', folderRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await setupModels();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
