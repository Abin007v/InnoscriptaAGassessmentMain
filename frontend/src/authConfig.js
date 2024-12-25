export const msalConfig = {
  auth: {
    clientId: "88ae7529-44dc-4b77-9773-a23cc03283c5",
    authority: "https://login.microsoftonline.com/d25e697e-9987-4146-87ba-800be6fd457c",
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
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