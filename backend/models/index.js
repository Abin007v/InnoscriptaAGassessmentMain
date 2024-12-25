import { BaseModel } from './BaseModel.js';
import { UserModel } from './UserModel.js';
import { EmailMessageModel } from './EmailMessageModel.js';
import { MailboxModel } from './MailboxModel.js';

export async function setupModels() {
  try {
    console.log('🔧 Setting up Elasticsearch indices...');
    
    // Setup indices in order
    await UserModel.setup();
    await EmailMessageModel.setup();
    await MailboxModel.setup();
    
    console.log('✅ Elasticsearch indices setup complete');
  } catch (error) {
    console.error('❌ Error setting up indices:', error);
    throw error;
  }
}

export {
  BaseModel,
  UserModel,
  EmailMessageModel,
  MailboxModel
}; 