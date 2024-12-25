import { BaseModel } from './BaseModel.js';

class MailboxModel extends BaseModel {
  static indexName = 'mailboxes';

  static mappings = {
    userId: { type: 'keyword' },
    outlookEmail: { type: 'keyword' },
    folderId: { type: 'keyword' },
    displayName: { type: 'text' },
    parentFolderId: { type: 'keyword' },
    childFolderCount: { type: 'integer' },
    unreadItemCount: { type: 'integer' },
    totalItemCount: { type: 'integer' },
    lastSyncTime: { type: 'date' }
  };

  static async setup() {
    await this.createIndex(this.indexName, this.mappings);
  }
}

export { MailboxModel }; 