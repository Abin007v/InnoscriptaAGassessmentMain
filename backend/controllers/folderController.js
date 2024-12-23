import { FolderService } from '../services/folderService.js';

export class FolderController {
  static async getFolders(req, res) {
    try {
      const { accessToken } = req.body;
      const folders = await FolderService.fetchFolders(accessToken);
      res.status(200).json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  }

  static async getFolderMessages(req, res) {
    try {
      const { folderId } = req.params;
      const { accessToken } = req.body;
      const messages = await FolderService.fetchFolderMessages(folderId, accessToken);
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching folder messages:', error);
      res.status(500).json({ 
        error: 'Failed to fetch folder messages',
        details: error.response?.data || error.message 
      });
    }
  }
} 