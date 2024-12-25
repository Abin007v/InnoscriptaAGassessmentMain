import { BaseModel } from './BaseModel.js';

class EmailMessageModel extends BaseModel {
  static indexName = 'email_messages';

  static mappings = {
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
  };

  static async setup() {
    await this.createIndex(this.indexName, this.mappings);
  }
}

export { EmailMessageModel }; 