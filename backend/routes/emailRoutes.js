import express from 'express';
import EmailController from '../controllers/emailController.js';
import { validateToken } from '../middleware/auth.js';
import cors from 'cors';
import corsOptions from '../config/corsConfig.js';

const router = express.Router();

// Use corsOptions for both the OPTIONS preflight and the actual route
router.options('/sync', cors(corsOptions));
router.get('/sync', cors(corsOptions), validateToken, EmailController.syncEmails);

// Add other email-related routes here
router.post('/', validateToken, EmailController.getEmails);
router.post('/attachments/:emailId', validateToken, EmailController.getAttachments);

export default router; 