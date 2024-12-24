import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import useStore from '../../useStore';

const PrivateRoute = () => {
  const { instance } = useMsal();
  const accessToken = useStore((state) => state.accessToken);
  
  if (!instance.getActiveAccount() || !accessToken) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute; 