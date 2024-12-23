import esClient from '../config/database.js';

class HealthService {
  static async checkElasticsearchHealth() {
    try {
      // Test the connection
      const health = await esClient.cluster.health();
      
      // List all indices
      const indices = await esClient.cat.indices({ format: 'json' });
      
      return {
        status: 'healthy',
        elasticsearch: {
          status: health.status,
          connected: true,
          indices: indices
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