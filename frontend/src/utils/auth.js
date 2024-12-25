import { msalConfig } from '../authConfig';

export const refreshToken = async (msalInstance) => {
  try {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      throw new Error('No active account');
    }

    const response = await msalInstance.acquireTokenSilent({
      ...msalConfig.auth,
      account,
      scopes: ["User.Read", "Mail.Read"]
    });

    if (response.accessToken) {
      sessionStorage.setItem('accessToken', response.accessToken);
      return response.accessToken;
    }
    
    throw new Error('No token received');
  } catch (error) {
    console.error('Token refresh error:', error);
    // Force new login if refresh fails
    sessionStorage.clear();
    window.location.href = '/';
    throw error;
  }
};

export const getAccessToken = async (msalInstance) => {
  const currentToken = sessionStorage.getItem('accessToken');
  if (!currentToken) {
    return await refreshToken(msalInstance);
  }
  return currentToken;
}; 