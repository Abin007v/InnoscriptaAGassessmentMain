import axios from 'axios';
import { ElasticService } from './elasticService.js';

class FolderService {
  static async fetchFolders(accessToken) {
    try {
      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/mailFolders',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return {
        '@odata.context': response.data['@odata.context'],
        value: response.data.value.map(folder => ({
          id: folder.id,
          displayName: folder.displayName,
          parentFolderId: folder.parentFolderId,
          childFolderCount: folder.childFolderCount,
          unreadItemCount: folder.unreadItemCount,
          totalItemCount: folder.totalItemCount,
          sizeInBytes: folder.sizeInBytes,
          isHidden: folder.isHidden
        }))
      };
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  static async fetchFolderMessages(folderId, accessToken) {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      await ElasticService.bulkIndexEmails(response.data.value);

      return response.data;
    } catch (error) {
      console.error('Error fetching folder messages:', error);
      throw error;
    }
  }
}

export { FolderService }; 