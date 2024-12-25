import { FolderService } from '../services/folderService.js';

class FolderController {
  static async getFolders(req, res) {
    try {
      const token = req.token;
      const folders = await FolderService.getFolders(token);
      
      res.status(200).json({
        success: true,
        data: folders
      });
    } catch (error) {
      console.error('Folder fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getEmailsByFolder(req, res) {
    try {
      const token = req.token;
      const { folderId } = req.params;
      
      if (!token || !folderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      console.log('Fetching emails for folder:', folderId);
      const emails = await FolderService.getEmailsByFolder(token, folderId);
      
      console.log('Found emails:', emails?.length);
      res.status(200).json({
        success: true,
        data: emails
      });
    } catch (error) {
      console.error('Folder emails fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default FolderController; 