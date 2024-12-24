import axios from 'axios';
import { ElasticService } from './elasticService.js';

class FolderService {
  static async fetchFolders(accessToken, userId, outlookEmail) {
    try {
      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/mailFolders',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const folders = response.data.value.map(folder => ({
        id: folder.id,
        displayName: folder.displayName,
        parentFolderId: folder.parentFolderId,
        childFolderCount: folder.childFolderCount,
        unreadItemCount: folder.unreadItemCount,
        totalItemCount: folder.totalItemCount
      }));

      // Store folder information in Elasticsearch
      await ElasticService.updateMailboxFolders(userId, outlookEmail, folders);

      return {
        '@odata.context': response.data['@odata.context'],
        value: folders
      };
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  static async fetchFolderMessages(folderId, accessToken, userId, outlookEmail) {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      await ElasticService.bulkIndexEmails(response.data.value, userId, outlookEmail);
      return response.data;
    } catch (error) {
      console.error('Error fetching folder messages:', error);
      throw error;
    }
  }
}

export { FolderService }; 