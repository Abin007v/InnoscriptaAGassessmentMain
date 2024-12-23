import { EmailService } from '../services/emailService.js';

class EmailController {
  static async getEmails(req, res) {
    try {
      const { accessToken } = req.body;
      const result = await EmailService.fetchEmails(accessToken);
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
      const result = await EmailService.fetchAttachments(emailId, accessToken);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ message: 'Error fetching attachments' });
    }
  }
}

export { EmailController }; 