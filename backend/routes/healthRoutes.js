import { Router } from 'express';
import { HealthController } from '../controllers/healthController.js';

const router = Router();

router.get('/health', HealthController.checkHealth);

export default router; 