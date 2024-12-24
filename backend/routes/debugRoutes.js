import express from 'express';
import { DebugController } from '../controllers/debugController.js';

const router = express.Router();

// Get all indices
router.get('/indices', DebugController.getIndices);

// Get data from specific index
router.get('/index/:index', DebugController.getIndexData);

// Get user's emails
router.get('/user/:userId/emails', DebugController.getUserEmails);

// Get user's mailboxes
router.get('/user/:userId/mailboxes', DebugController.getUserMailboxes);

export default router; 