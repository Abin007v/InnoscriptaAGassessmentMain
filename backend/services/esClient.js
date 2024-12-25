import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// Test the connection
esClient.ping()
  .then(() => console.log('Connected to Elasticsearch'))
  .catch(error => console.error('Elasticsearch connection error:', error));

export default esClient; 