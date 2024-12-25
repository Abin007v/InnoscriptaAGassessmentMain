import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

export const validateMsalToken = async (token) => {
  try {
    // Try to make a simple Graph API call to validate the token
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });

    // Get user profile to verify token
    await client.api('/me').get();
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const createGraphClient = (token) => {
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    },
  });
}; 