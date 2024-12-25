import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

class GraphClient {
  static init(options) {
    return Client.init(options);
  }

  static createClient(accessToken) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  // Helper method to handle Graph API requests with retries
  static async makeRequest(accessToken, endpoint, options = {}) {
    const client = this.createClient(accessToken);
    const maxRetries = 3;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await client.api(endpoint).get();
      } catch (error) {
        lastError = error;
        if (error.statusCode === 429) { // Rate limit exceeded
          const retryAfter = error.headers?.['retry-after'] || 1;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }
}

export default GraphClient; 