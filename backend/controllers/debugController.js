import esClient from '../config/database.js';

class DebugController {
  static async getIndices(req, res) {
    try {
      const response = await esClient.cat.indices({ format: 'json' });
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Debug - Get indices error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch indices'
      });
    }
  }

  static async getIndexData(req, res) {
    try {
      const { index } = req.params;
      const result = await esClient.search({
        index,
        body: {
          query: { match_all: {} },
          size: 100
        }
      });

      const data = result.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source
      }));

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      console.error(`Debug - Get ${req.params.index} data error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${req.params.index} data`
      });
    }
  }

  static async getUserEmails(req, res) {
    try {
      const { userId } = req.params;
      const result = await esClient.search({
        index: 'email_messages',
        body: {
          query: {
            term: {
              userId: userId
            }
          },
          sort: [
            { receivedDateTime: { order: 'desc' } }
          ],
          size: 100
        }
      });

      const emails = result.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source,
        _score: hit._score
      }));

      res.json({
        success: true,
        count: emails.length,
        data: emails,
        aggregations: {
          folders: await this.getEmailFolderStats(userId),
          readStatus: await this.getEmailReadStats(userId)
        }
      });
    } catch (error) {
      console.error('Debug - Get user emails error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user emails'
      });
    }
  }

  static async getEmailFolderStats(userId) {
    const result = await esClient.search({
      index: 'email_messages',
      body: {
        query: {
          term: { userId: userId }
        },
        aggs: {
          folders: {
            terms: { field: 'folderId' }
          }
        },
        size: 0
      }
    });

    return result.aggregations?.folders?.buckets || [];
  }

  static async getEmailReadStats(userId) {
    const result = await esClient.search({
      index: 'email_messages',
      body: {
        query: {
          term: { userId: userId }
        },
        aggs: {
          read_status: {
            terms: { field: 'isRead' }
          }
        },
        size: 0
      }
    });

    return result.aggregations?.read_status?.buckets || [];
  }

  static async getUserMailboxes(req, res) {
    try {
      const { userId } = req.params;
      const result = await esClient.search({
        index: 'mailboxes',
        body: {
          query: {
            term: {
              userId: userId
            }
          }
        }
      });

      const mailboxes = result.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source
      }));

      res.json({
        success: true,
        count: mailboxes.length,
        data: mailboxes
      });
    } catch (error) {
      console.error('Debug - Get user mailboxes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user mailboxes'
      });
    }
  }

  static async getElasticsearchStats(req, res) {
    try {
      const indices = ['users', 'email_messages', 'mailboxes'];
      const stats = {};

      for (const index of indices) {
        const count = await esClient.count({ index });
        stats[index] = count.count;
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Debug - Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Elasticsearch stats'
      });
    }
  }

  static async verifyUserEmails(req, res) {
    try {
      const { userId } = req.params;
      
      // First, check if user exists
      const userExists = await esClient.exists({
        index: 'users',
        id: userId
      });

      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get email count
      const emailCount = await esClient.count({
        index: 'email_messages',
        body: {
          query: {
            term: {
              userId: userId
            }
          }
        }
      });

      // Get sample emails
      const result = await esClient.search({
        index: 'email_messages',
        body: {
          query: {
            term: {
              userId: userId
            }
          },
          sort: [
            { receivedDateTime: { order: 'desc' } }
          ],
          size: 10
        }
      });

      res.json({
        success: true,
        data: {
          totalEmails: emailCount.count,
          sampleEmails: result.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
          }))
        }
      });
    } catch (error) {
      console.error('Debug - Verify user emails error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify user emails'
      });
    }
  }
}

export { DebugController }; 