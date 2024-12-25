import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

const PrivateRoute = ({ children }) => {
  const { accounts } = useMsal();
  const isAuthenticated = accounts.length > 0 && sessionStorage.getItem('accessToken');

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute; 