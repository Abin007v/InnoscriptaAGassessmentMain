import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

class ProfileService {
  static createGraphClient(accessToken) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  static async getUserProfile(accessToken) {
    try {
      const graphClient = this.createGraphClient(accessToken);
      
      const response = await graphClient.api('/me')
        .select('displayName,mail,userPrincipalName')
        .get();

      return {
        name: response.displayName,
        email: response.mail || response.userPrincipalName,
        username: response.userPrincipalName
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }
}

export { ProfileService }; 