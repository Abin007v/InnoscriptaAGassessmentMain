import { EmailService } from '../services/emailService.js';
import { FolderService } from '../services/folderService.js';

class EmailController {
  static async getEmails(req, res) {
    try {
      const { accessToken, userId, outlookEmail } = req.body;
      
      if (!accessToken || !userId || !outlookEmail) {
        return res.status(400).json({ 
          message: "Missing required parameters" 
        });
      }

      const result = await EmailService.fetchEmails(accessToken, userId, outlookEmail);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error handling emails:", error);
      res.status(500).json({ message: "Error fetching emails" });
    }
  }

  static async getAttachments(req, res) {
    try {
      const { emailId } = req.params;
      const { accessToken } = req.body;
      
      if (!accessToken || !emailId) {
        return res.status(400).json({ 
          message: "Missing required parameters" 
        });
      }

      const result = await EmailService.fetchAttachments(emailId, accessToken);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ message: 'Error fetching attachments' });
    }
  }

  static async syncEmails(req, res) {
    try {
      const token = req.token; // Token from middleware
      const lastSyncTime = req.headers['last-sync-time'];

      // Get changes since last sync
      const changes = await EmailService.getChangesSinceLastSync(token, lastSyncTime);
      
      // Get current server time for next sync
      const currentTime = new Date().toISOString();

      res.status(200).json({
        success: true,
        data: {
          emails: changes,
          lastSyncTime: currentTime
        }
      });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getEmailsByFolder(req, res) {
    try {
      const { folderId } = req.params;
      const token = req.token;
      const forceSync = req.headers['force-sync'] === 'true';
      
      console.log('📨 [Backend Controller] Fetching emails for folder:', folderId, 'force:', forceSync);
      
      const emails = await FolderService.getEmailsByFolder(token, folderId, forceSync);
      
      console.log(`✅ [Backend Controller] Successfully retrieved ${emails.length} emails`);
      res.json({ success: true, data: emails });
    } catch (error) {
      console.error('❌ [Backend Controller] Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default EmailController; 