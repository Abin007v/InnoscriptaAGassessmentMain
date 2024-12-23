import axios from 'axios';
import { ElasticService } from './elasticService.js';

class EmailService {
  static async fetchEmails(accessToken) {
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

      // Store emails in Elasticsearch
      await ElasticService.bulkIndexEmails(emails);

      // Return the raw emails as the frontend expects
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

      // Return attachments in the same format as before
      return { attachments: response.data.value };
    } catch (error) {
      console.error("Error fetching attachments:", error);
      throw error;
    }
  }

  static async searchEmails(query, accessToken) {
    try {
      // Search in Elasticsearch first
      const searchResult = await ElasticService.searchEmails(query);
      
      if (searchResult.hits.total.value > 0) {
        return searchResult.hits.hits.map(hit => ({
          id: hit._source.messageId,
          subject: hit._source.subject,
          body: hit._source.body,
          sender: hit._source.sender,
          time: new Date(hit._source.receivedDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        }));
      }

      // If no results in Elasticsearch, fetch from Graph API
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages?$search="${query}"`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ConsistencyLevel: 'eventual'
          }
        }
      );

      return response.data.value.map(email => ({
        id: email.id,
        subject: email.subject,
        body: email.body.content,
        sender: {
          name: email.from.emailAddress.name,
          address: email.from.emailAddress.address
        },
        time: new Date(email.sentDateTime).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      }));
    } catch (error) {
      console.error("Error searching emails:", error);
      throw error;
    }
  }

  // Add method to update Elasticsearch index
  static async updateEmailIndex(emailId, updates, accessToken) {
    try {
      // Update in Graph API if needed
      if (updates.read !== undefined || updates.starred !== undefined) {
        await axios.patch(
          `https://graph.microsoft.com/v1.0/me/messages/${emailId}`,
          {
            isRead: updates.read,
            flag: updates.starred ? { flagStatus: 'flagged' } : { flagStatus: 'notFlagged' }
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Update in Elasticsearch
      await ElasticService.updateEmail(emailId, updates);

      return { success: true };
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  }
}

export { EmailService }; 