import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { retryWithBackoff } from '../utils/rateLimiter.js';
import { ElasticService } from './elasticService.js';

class EmailSyncService {
  static createGraphClient(accessToken) {
    try {
      return Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
    } catch (error) {
      console.error('❌ [Backend] Error creating Graph client:', error);
      throw new Error('Failed to initialize Microsoft Graph client');
    }
  }

  static async initialSync(userId, accessToken, outlookEmail) {
    try {
      console.log('🔄 [Backend] Starting initial sync for user:', userId);
      
      if (!userId || !accessToken || !outlookEmail) {
        throw new Error('Missing required parameters for sync');
      }

      const graphClient = this.createGraphClient(accessToken);

      // First, get all folders
      console.log('📂 [Backend] Fetching folders...');
      const folders = await this.getFolders(graphClient);
      console.log(`📂 [Backend] Found ${folders.length} folders`);

      // Update mailbox info in Elasticsearch
      console.log('💾 [Backend] Updating mailbox folders...');
      await ElasticService.updateMailboxFolders(userId, outlookEmail, folders);

      // Then sync emails from each folder
      console.log('📨 [Backend] Starting folder sync...');
      for (const folder of folders) {
        try {
          await this.syncFolderEmails(graphClient, folder.id, userId, outlookEmail);
        } catch (error) {
          console.error(`❌ [Backend] Error syncing folder ${folder.id}:`, error);
          // Continue with other folders even if one fails
        }
      }

      console.log('✅ [Backend] Initial sync completed for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ [Backend] Initial sync error:', error);
      throw new Error('Failed to complete initial sync: ' + error.message);
    }
  }

  static async getFolders(graphClient) {
    try {
      const response = await retryWithBackoff(async () => {
        return graphClient.api('/me/mailFolders')
          .select('id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount')
          .get();
      });

      if (!response || !response.value) {
        throw new Error('Invalid folder response from Microsoft Graph');
      }

      return response.value;
    } catch (error) {
      console.error('❌ [Backend] Error fetching folders:', error);
      throw new Error('Failed to fetch folders: ' + error.message);
    }
  }

  static async syncFolderEmails(graphClient, folderId, userId, outlookEmail) {
    try {
      console.log(`📨 [Backend] Syncing emails for folder: ${folderId} for user: ${userId}`);
      
      const response = await retryWithBackoff(async () => {
        return graphClient.api(`/me/mailFolders/${folderId}/messages`)
          .select([
            'id',
            'subject',
            'bodyPreview',
            'from',
            'toRecipients',
            'receivedDateTime',
            'isRead',
            'isDraft',
            'hasAttachments',
            'importance'
          ].join(','))
          .top(50)
          .orderby('receivedDateTime desc')
          .get();
      });

      if (!response || !response.value) {
        throw new Error('Invalid email response from Microsoft Graph');
      }

      // Transform emails to match our schema
      const transformedEmails = response.value.map(email => ({
        userId,
        outlookEmail,
        messageId: email.id,
        folderId,
        subject: email.subject || 'No Subject',
        from: {
          name: email.from?.emailAddress?.name || 'Unknown',
          email: email.from?.emailAddress?.address || 'no-email'
        },
        to: email.toRecipients?.map(recipient => ({
          name: recipient.emailAddress?.name || 'Unknown',
          email: recipient.emailAddress?.address || 'no-email'
        })) || [],
        receivedDateTime: email.receivedDateTime,
        bodyPreview: email.bodyPreview || '',
        isRead: email.isRead || false,
        isDraft: email.isDraft || false,
        hasAttachments: email.hasAttachments || false,
        importance: email.importance || 'normal'
      }));

      if (transformedEmails.length > 0) {
        console.log(`📥 [Backend] Indexing ${transformedEmails.length} emails for folder ${folderId}`);
        await ElasticService.bulkIndexEmails(transformedEmails, userId, outlookEmail);
        console.log(`✅ [Backend] Successfully indexed emails for folder:`, folderId);
      } else {
        console.log(`ℹ️ [Backend] No emails to index for folder:`, folderId);
      }

      return transformedEmails;
    } catch (error) {
      console.error('❌ [Backend] Error syncing folder emails:', error);
      throw new Error('Failed to sync folder emails: ' + error.message);
    }
  }
}

export { EmailSyncService }; 