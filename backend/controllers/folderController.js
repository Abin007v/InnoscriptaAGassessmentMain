import { FolderService } from '../services/folderService.js';

export class FolderController {
  static async getFolders(req, res) {
    try {
      const { accessToken, userId, outlookEmail } = req.body;
      
      if (!accessToken || !userId || !outlookEmail) {
        return res.status(400).json({ 
          message: "Missing required parameters" 
        });
      }

      const folders = await FolderService.fetchFolders(accessToken, userId, outlookEmail);
      res.status(200).json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  }

  static async getFolderMessages(req, res) {
    try {
      const { folderId } = req.params;
      const { accessToken, userId, outlookEmail } = req.body;
      
      if (!accessToken || !userId || !outlookEmail || !folderId) {
        return res.status(400).json({ 
          message: "Missing required parameters" 
        });
      }

      const messages = await FolderService.fetchFolderMessages(
        folderId, 
        accessToken, 
        userId, 
        outlookEmail
      );
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching folder messages:', error);
      res.status(500).json({ error: 'Failed to fetch folder messages' });
    }
  }
} 