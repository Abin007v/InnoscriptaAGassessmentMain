import express from 'express';
import FolderController from '../controllers/folderController.js';
import { validateToken } from '../middleware/auth.js';
import cors from 'cors';
import corsOptions from '../config/corsConfig.js';

const router = express.Router();

router.options('/:folderId/emails', cors(corsOptions));
router.get('/:folderId/emails', cors(corsOptions), validateToken, FolderController.getEmailsByFolder);

router.options('/', cors(corsOptions));
router.get('/', cors(corsOptions), validateToken, FolderController.getFolders);

export default router; 