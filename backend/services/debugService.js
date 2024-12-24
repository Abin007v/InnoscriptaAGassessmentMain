import esClient from '../config/database.js';

class DebugService {
  static async getAllIndices() {
    try {
      return await esClient.cat.indices({ format: 'json' });
    } catch (error) {
      console.error('Error getting indices:', error);
      throw error;
    }
  }

  static async getIndexData(indexName, size = 100) {
    try {
      const result = await esClient.search({
        index: indexName,
        body: {
          query: { match_all: {} },
          size: size
        }
      });
      return result.hits.hits;
    } catch (error) {
      console.error(`Error getting data from index ${indexName}:`, error);
      throw error;
    }
  }

  static async getEmailsByUser(userId) {
    try {
      const result = await esClient.search({
        index: 'email_messages',
        body: {
          query: {
            match: {
              userId: userId
            }
          },
          sort: [
            { receivedDate: { order: 'desc' } }
          ],
          size: 100
        }
      });
      return result.hits.hits;
    } catch (error) {
      console.error('Error getting user emails:', error);
      throw error;
    }
  }

  static async getUserMailboxes(userId) {
    try {
      const result = await esClient.search({
        index: 'mailboxes',
        body: {
          query: {
            match: {
              userId: userId
            }
          },
          size: 100
        }
      });
      return result.hits.hits;
    } catch (error) {
      console.error('Error getting user mailboxes:', error);
      throw error;
    }
  }
}

export { DebugService }; 