import esClient from '../config/database.js';

class HealthService {
  static async checkElasticsearchHealth() {
    try {
      const health = await esClient.cluster.health();
      
      return {
        status: 'healthy',
        elasticsearch: {
          status: health.status,
          connected: true
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Elasticsearch health check failed:', error);
      return {
        status: 'unhealthy',
        elasticsearch: {
          status: 'disconnected',
          connected: false,
          error: error.message
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export { HealthService }; 