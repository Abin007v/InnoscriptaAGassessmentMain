import { BaseModel } from './BaseModel.js';

class UserModel extends BaseModel {
  static indexName = 'users';

  static mappings = {
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
  };

  static async setup() {
    await this.createIndex(this.indexName, this.mappings);
  }
}

export { UserModel }; 