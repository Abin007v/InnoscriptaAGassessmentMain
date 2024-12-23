import { HealthService } from '../services/healthService.js';

export class HealthController {
  static async checkHealth(req, res) {
    try {
      const status = await HealthService.checkElasticsearchHealth();
      res.status(200).json(status);
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
} 