import esClient from '../config/database.js';

class ElasticService {
  static async setupIndices() {
    try {
      console.log('🔧 Setting up Elasticsearch indices...');

      // Create users index
      await this.createUsersIndex();
      
      // Create email_messages index
      await this.createEmailMessagesIndex();
      
      // Create mailboxes index
      await this.createMailboxesIndex();

      console.log('✅ Elasticsearch indices setup complete');
    } catch (error) {
      console.error('❌ Error setting up indices:', error);
      throw error;
    }
  }

  static async createUsersIndex() {
    const indexExists = await esClient.indices.exists({ index: 'users' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'users',
        body: {
          mappings: {
            properties: {
              email: { type: 'keyword' },
              password: { type: 'keyword' },
              createdAt: { type: 'date' },
              lastLogin: { type: 'date' },
              isActive: { type: 'boolean' },
              outlookData: {
                properties: {
                  email: { type: 'keyword' },
                  name: { type: 'text' },
                  accessToken: { type: 'keyword' },
                  lastSync: { type: 'date' }
                }
              }
            }
          }
        }
      });
      console.log('📝 Created users index');
    }
  }

  static async createEmailMessagesIndex() {
    const indexExists = await esClient.indices.exists({ index: 'email_messages' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'email_messages',
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              outlookEmail: { type: 'keyword' },
              messageId: { type: 'keyword' },
              folderId: { type: 'keyword' },
              subject: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              from: {
                properties: {
                  name: { type: 'text' },
                  email: { type: 'keyword' }
                }
              },
              to: {
                properties: {
                  name: { type: 'text' },
                  email: { type: 'keyword' }
                }
              },
              receivedDateTime: { type: 'date' },
              bodyPreview: { type: 'text' },
              isRead: { type: 'boolean' },
              isDraft: { type: 'boolean' },
              hasAttachments: { type: 'boolean' },
              importance: { type: 'keyword' },
              lastSyncTime: { type: 'date' }
            }
          }
        }
      });
      console.log('📝 Created email_messages index');
    }
  }

  static async createMailboxesIndex() {
    const indexExists = await esClient.indices.exists({ index: 'mailboxes' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'mailboxes',
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              outlookEmail: { type: 'keyword' },
              folderId: { type: 'keyword' },
              displayName: { type: 'text' },
              parentFolderId: { type: 'keyword' },
              childFolderCount: { type: 'integer' },
              unreadItemCount: { type: 'integer' },
              totalItemCount: { type: 'integer' },
              lastSyncTime: { type: 'date' }
            }
          }
        }
      });
      console.log('📝 Created mailboxes index');
    }
  }

  static async bulkIndexEmails(emails, userId, outlookEmail) {
    try {
      console.log(`📥 [Backend] Preparing to bulk index ${emails.length} emails for user ${userId}`);
      
      const operations = emails.flatMap(email => [
        { 
          index: { 
            _index: 'email_messages',
            _id: `${userId}-${email.messageId}` // Ensure unique ID per user-message combination
          } 
        },
        {
          userId,
          outlookEmail,
          messageId: email.messageId,
          folderId: email.folderId,
          subject: email.subject,
          from: email.from,
          to: email.to || [],
          receivedDateTime: email.receivedDateTime,
          bodyPreview: email.bodyPreview,
          isRead: email.isRead,
          isDraft: email.isDraft,
          hasAttachments: email.hasAttachments,
          importance: email.importance,
          lastSyncTime: new Date()
        }
      ]);

      if (operations.length > 0) {
        console.log(`📤 [Backend] Executing bulk operation for ${operations.length / 2} emails`);
        const bulkResponse = await esClient.bulk({ 
          refresh: true, 
          body: operations 
        });

        if (bulkResponse.errors) {
          const errorItems = bulkResponse.items.filter(item => item.index.error);
          console.error('❌ Bulk email indexing errors:', errorItems);
          throw new Error(`Failed to index ${errorItems.length} emails`);
        }

        console.log(`✅ [Backend] Successfully indexed ${operations.length / 2} emails`);
      }
    } catch (error) {
      console.error('❌ [Backend] Error in bulk indexing:', error);
      throw error;
    }
  }

  static async updateMailboxFolders(userId, outlookEmail, folders) {
    const operations = folders.flatMap(folder => [
      { index: { _index: 'mailboxes' } },
      {
        userId,
        outlookEmail,
        folderId: folder.id,
        displayName: folder.displayName,
        parentFolderId: folder.parentFolderId,
        childFolderCount: folder.childFolderCount,
        unreadItemCount: folder.unreadItemCount,
        totalItemCount: folder.totalItemCount,
        lastSyncTime: new Date()
      }
    ]);

    if (operations.length > 0) {
      const { body: bulkResponse } = await esClient.bulk({ refresh: true, body: operations });
      if (bulkResponse.errors) {
        console.error('❌ Bulk mailbox indexing errors:', bulkResponse.errors);
      }
    }
  }
}

export { ElasticService }; 