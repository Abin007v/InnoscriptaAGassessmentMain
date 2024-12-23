import esClient from '../config/database.js';

class ElasticService {
  static async initializeIndices() {
    try {
      await this.createEmailIndex();
      await this.createMailboxIndex();
      console.log('Elasticsearch indices initialized successfully');
    } catch (error) {
      console.error('Error initializing Elasticsearch indices:', error);
    }
  }

  static async createEmailIndex() {
    const exists = await esClient.indices.exists({ index: 'email_messages' });
    if (!exists) {
      await esClient.indices.create({
        index: 'email_messages',
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              messageId: { type: 'keyword' },
              subject: { type: 'text' },
              body: { type: 'text' },
              sender: {
                properties: {
                  name: { type: 'text' },
                  address: { type: 'keyword' }
                }
              },
              receivedDate: { type: 'date' }
            }
          }
        }
      });
    }
  }

  static async createMailboxIndex() {
    // Similar implementation for mailbox index
  }

  static async bulkIndexEmails(emails) {
    const operations = emails.flatMap(email => [
      { index: { _index: 'email_messages' } },
      {
        messageId: email.id,
        userId: email.from.emailAddress.address,
        subject: email.subject,
        body: email.body.content,
        sender: {
          name: email.from.emailAddress.name,
          address: email.from.emailAddress.address
        },
        receivedDate: email.receivedDateTime
      }
    ]);

    if (operations.length > 0) {
      await esClient.bulk({ body: operations });
    }
  }

  static async searchEmails(query) {
    try {
      const result = await esClient.search({
        index: 'email_messages',
        body: {
          query: {
            multi_match: {
              query: query,
              fields: ['subject', 'body', 'sender.name', 'sender.address']
            }
          },
          sort: [
            { receivedDate: { order: 'desc' } }
          ]
        }
      });

      return result;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  static async updateEmail(emailId, updates) {
    try {
      await esClient.update({
        index: 'email_messages',
        id: emailId,
        body: {
          doc: updates
        }
      });
    } catch (error) {
      console.error('Error updating email in Elasticsearch:', error);
      throw error;
    }
  }
}

export { ElasticService }; 