import { Router } from 'express';
import { DebugController } from '../controllers/debugController.js';

const router = Router();

// Get indices and stats
router.get('/indices', DebugController.getIndices);
router.get('/index/:index', DebugController.getIndexData);
router.get('/stats', DebugController.getElasticsearchStats);

// User specific routes
router.get('/user/:userId/emails', DebugController.getUserEmails);
router.get('/user/:userId/mailboxes', DebugController.getUserMailboxes);
router.get('/user/:userId/verify-emails', DebugController.verifyUserEmails);

// Get specific index data routes
router.get('/index/email_messages', (req, res) => {
  DebugController.getIndexData(req, { ...req, params: { index: 'email_messages' } }, res);
});
router.get('/index/mailboxes', (req, res) => {
  DebugController.getIndexData(req, { ...req, params: { index: 'mailboxes' } }, res);
});
router.get('/index/users', (req, res) => {
  DebugController.getIndexData(req, { ...req, params: { index: 'users' } }, res);
});

// Health check route
router.get('/health', async (req, res) => {
  try {
    await esClient.ping();
    res.json({ status: 'OK', message: 'Elasticsearch is connected' });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: 'Elasticsearch connection failed' });
  }
});

export default router; 