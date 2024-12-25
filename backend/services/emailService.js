import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import esClient from '../config/database.js';
import { retryWithBackoff } from '../utils/rateLimiter.js';

class EmailService {
  static createGraphClient(accessToken) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  static async getChangesSinceLastSync(accessToken, lastSyncTime = null) {
    try {
      const graphClient = this.createGraphClient(accessToken);
      let endpoint = '/me/messages';
      
      // Add query parameters
      const params = new URLSearchParams({
        $select: 'id,subject,bodyPreview,body,from,receivedDateTime,isRead,isDraft,flag,parentFolderId',
        $top: '50',
        $orderby: 'receivedDateTime desc'
      });

      if (lastSyncTime) {
        params.append('$filter', `receivedDateTime gt ${lastSyncTime}`);
      }

      endpoint += `?${params.toString()}`;

      // Fetch emails with retry mechanism
      const response = await retryWithBackoff(async () => {
        return graphClient.api(endpoint).get();
      });

      // Transform the response to our format
      const emails = response.value.map(email => ({
        messageId: email.id,
        subject: email.subject,
        bodyPreview: email.bodyPreview,
        body: email.body?.content,
        sender: {
          name: email.from?.emailAddress?.name,
          address: email.from?.emailAddress?.address
        },
        receivedDateTime: email.receivedDateTime,
        isRead: email.isRead,
        isDraft: email.isDraft,
        flag: email.flag,
        folderId: email.parentFolderId
      }));

      // Store emails in Elasticsearch
      await this.storeEmails(emails);

      return emails;
    } catch (error) {
      console.error('Error fetching changes:', error);
      throw new Error('Failed to fetch email changes');
    }
  }

  static async storeEmails(emails) {
    try {
      if (!emails.length) return;

      const operations = emails.flatMap(email => [
        { index: { _index: 'email_messages', _id: email.messageId } },
        {
          ...email,
          lastSyncTime: new Date().toISOString()
        }
      ]);

      await esClient.bulk({ operations });
    } catch (error) {
      console.error('Error storing emails:', error);
      // Don't throw error here to prevent sync failure
    }
  }

  static async fetchEmails(accessToken, userId, outlookEmail) {
    try {
      const graphClient = this.createGraphClient(accessToken);
      const response = await graphClient.api('/me/messages').get();
      return response;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  static async fetchAttachments(emailId, accessToken) {
    try {
      const graphClient = this.createGraphClient(accessToken);
      const response = await graphClient.api(`/me/messages/${emailId}/attachments`).get();
      return response;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  }
}

export { EmailService }; 