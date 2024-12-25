import express from 'express';
import FolderController from '../controllers/folderController.js';
import { validateToken } from '../middleware/auth.js';
import cors from 'cors';
import corsOptions from '../config/corsConfig.js';

const router = express.Router();

// Apply CORS options to specific routes
router.options('/:folderId/emails', cors(corsOptions)); // Handle OPTIONS preflight
router.get('/:folderId/emails', cors(corsOptions), validateToken, FolderController.getEmailsByFolder);

router.options('/', cors(corsOptions)); // Handle OPTIONS preflight
router.get('/', cors(corsOptions), validateToken, FolderController.getFolders);

export default router; 