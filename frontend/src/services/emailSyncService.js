import { API_BASE_URL } from '../config';

class EmailSyncService {
  constructor() {
    this.syncInterval = 30000;
    this.syncTimer = null;
  }

  async fetchEmails(lastSyncTime = null) {
    // Get Microsoft access token from session storage
    const msalToken = sessionStorage.getItem('accessToken');
    if (!msalToken) {
      throw new Error('No access token found');
    }

    const endpoint = `${API_BASE_URL}/api/emails/sync`;
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${msalToken}`,
          'Content-Type': 'application/json',
          'Last-Sync-Time': lastSyncTime?.toString() || ''
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sync Response Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(errorText);
      }

      const data = await response.json();
      console.debug('Sync Response:', {
        emailCount: data?.data?.length || 0,
        lastSyncTime: data?.lastSyncTime
      });

      return data;
    } catch (error) {
      console.error('Sync Error:', error);
      throw error;
    }
  }

  async startSync(syncStore) {
    try {
      syncStore.setLoading(true);
      const { data, lastSyncTime } = await this.fetchEmails();
      syncStore.setEmails(data?.emails || []);
      syncStore.setLastSyncTime(lastSyncTime);
    } catch (error) {
      syncStore.setError(error.message);
      // If token is invalid, redirect to login
      if (error.message.includes('Invalid token')) {
        window.location.href = '/';
      }
    } finally {
      syncStore.setLoading(false);
    }

    this.syncTimer = setInterval(async () => {
      try {
        const { changes, lastSyncTime } = await this.fetchEmails(syncStore.lastSyncTime);
        
        if (changes) {
          changes.forEach(change => {
            if (change.type === 'delete') {
              syncStore.deleteEmail(change.messageId);
            } else if (change.type === 'update') {
              syncStore.updateEmail(change.messageId, change.data);
            } else if (change.type === 'add') {
              syncStore.addEmail(change.data);
            }
          });
        }

        syncStore.setLastSyncTime(lastSyncTime);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, this.syncInterval);
  }

  stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

const emailSyncService = new EmailSyncService();
export default emailSyncService; 