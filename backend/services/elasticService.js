import esClient from '../config/database.js';
import { User } from '../models/userModel.js';

class ElasticService {
  static async initializeIndices() {
    try {
      await this.createEmailIndex();
      await this.createMailboxIndex();
      await User.createIndex(esClient);
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
              receivedDate: { type: 'date' },
              outlookEmail: { type: 'keyword' },
              folderId: { type: 'keyword' }
            }
          }
        }
      });
      console.log('Email messages index created');
    }
  }

  static async createMailboxIndex() {
    const exists = await esClient.indices.exists({ index: 'mailboxes' });
    if (!exists) {
      await esClient.indices.create({
        index: 'mailboxes',
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              outlookEmail: { type: 'keyword' },
              folders: {
                properties: {
                  id: { type: 'keyword' },
                  displayName: { type: 'text' },
                  parentFolderId: { type: 'keyword' },
                  childFolderCount: { type: 'integer' },
                  unreadItemCount: { type: 'integer' },
                  totalItemCount: { type: 'integer' }
                }
              },
              lastSynced: { type: 'date' }
            }
          }
        }
      });
      console.log('Mailboxes index created');
    }
  }

  static async bulkIndexEmails(emails, userId, outlookEmail) {
    const operations = emails.flatMap(email => [
      { index: { _index: 'email_messages' } },
      {
        messageId: email.id,
        userId: userId,
        outlookEmail: outlookEmail,
        subject: email.subject,
        body: email.body.content,
        sender: {
          name: email.from.emailAddress.name,
          address: email.from.emailAddress.address
        },
        receivedDate: email.receivedDateTime,
        folderId: email.parentFolderId
      }
    ]);

    if (operations.length > 0) {
      await esClient.bulk({ body: operations });
    }
  }

  static async updateMailboxFolders(userId, outlookEmail, folders) {
    try {
      const mailboxDoc = {
        userId,
        outlookEmail,
        folders: folders.map(folder => ({
          id: folder.id,
          displayName: folder.displayName,
          parentFolderId: folder.parentFolderId,
          childFolderCount: folder.childFolderCount,
          unreadItemCount: folder.unreadItemCount,
          totalItemCount: folder.totalItemCount
        })),
        lastSynced: new Date()
      };

      await esClient.index({
        index: 'mailboxes',
        id: `${userId}-${outlookEmail}`,
        body: mailboxDoc,
        refresh: true
      });
    } catch (error) {
      console.error('Error updating mailbox folders:', error);
      throw error;
    }
  }
}

export { ElasticService }; 