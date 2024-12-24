// src/msalConfig.js
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '88ae7529-44dc-4b77-9773-a23cc03283c5',
    authority: 'https://login.microsoftonline.com/organizations',
    redirectUri: 'http://localhost:3000',
    postLogoutRedirectUri: '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: [
    'User.Read',
    'Mail.Read',
    'Mail.ReadWrite',
    'offline_access'
  ]
};

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Handle the redirect promise
msalInstance.initialize().then(() => {
  // Account selection logic is app dependent. Adjust as needed for your use case.
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }
}).catch((error) => {
  console.error("MSAL Initialization Error:", error);
});