import { Router } from 'express';
import { FolderController } from '../controllers/folderController.js';
import { validateToken } from '../middleware/auth.js';

const router = Router();

router.post('/folders', validateToken, FolderController.getFolders);
router.post('/folders/:folderId/messages', validateToken, FolderController.getFolderMessages);

export default router; 