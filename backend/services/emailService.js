import axios from 'axios';
import { ElasticService } from './elasticService.js';

class EmailService {
  static async fetchEmails(accessToken, userId, outlookEmail) {
    try {
      const response = await axios.get(
        "https://graph.microsoft.com/v1.0/me/messages",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const emails = response.data.value;
      await ElasticService.bulkIndexEmails(emails, userId, outlookEmail);
      return { emails };
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }
  }

  static async fetchAttachments(emailId, accessToken) {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages/${emailId}/attachments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return { attachments: response.data.value };
    } catch (error) {
      console.error("Error fetching attachments:", error);
      throw error;
    }
  }
}

export { EmailService }; 