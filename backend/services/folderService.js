import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { retryWithBackoff } from '../utils/rateLimiter.js';

class FolderService {
  static createGraphClient(accessToken) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  static async getFolders(accessToken) {
    try {
      console.log('🔍 [Backend] Fetching folders from Graph API');
      const graphClient = this.createGraphClient(accessToken);
      
      const response = await retryWithBackoff(async () => {
        return graphClient.api('/me/mailFolders')
          .select('id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount')
          .get();
      });

      console.log(`✅ [Backend] Retrieved ${response.value.length} folders`);
      return response.value.map(folder => ({
        id: folder.id,
        name: folder.displayName,
        parentId: folder.parentFolderId,
        childCount: folder.childFolderCount,
        unreadCount: folder.unreadItemCount,
        totalCount: folder.totalItemCount
      }));
    } catch (error) {
      console.error('❌ [Backend] Folder fetch error:', error);
      throw new Error('Failed to fetch folders');
    }
  }

  static async getEmailsByFolder(accessToken, folderId, forceSync = false) {
    try {
      console.log('🔍 [Backend] Fetching emails for folder:', folderId, 'force:', forceSync);
      const graphClient = this.createGraphClient(accessToken);
      
      const response = await retryWithBackoff(async () => {
        return graphClient.api(`/me/mailFolders/${folderId}/messages`)
          .select('id,subject,bodyPreview,from,receivedDateTime,isRead,isDraft')
          .top(50)
          .orderby('receivedDateTime desc')
          .get();
      });

      console.log('📧 [Backend] Graph API response:', {
        totalEmails: response.value.length,
        sampleEmail: {
          subject: response.value[0]?.subject,
          from: response.value[0]?.from,
          date: response.value[0]?.receivedDateTime
        }
      });
      
      console.log(`✅ [Backend] Found ${response.value.length} emails`);
      return response.value;
    } catch (error) {
      console.error('❌ [Backend] Email fetch error:', error);
      throw new Error('Failed to fetch folder emails');
    }
  }
}

export { FolderService }; 