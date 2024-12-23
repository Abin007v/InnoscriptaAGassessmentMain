import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';
import { validateToken } from '../middleware/auth.js';

const router = Router();

router.post('/emails', validateToken, EmailController.getEmails);
router.post('/attachments/:emailId', validateToken, EmailController.getAttachments);

export default router; 