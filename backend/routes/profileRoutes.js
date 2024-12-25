import express from 'express';
import ProfileController from '../controllers/profileController.js';
import { validateToken } from '../middleware/auth.js';
import cors from 'cors';
import corsOptions from '../config/corsConfig.js';

const router = express.Router();

router.get('/', cors(corsOptions), validateToken, ProfileController.getProfile);

export default router; 