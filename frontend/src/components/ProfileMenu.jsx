import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = () => {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  const handleLogout = () => {
    instance.logoutPopup().then(() => {
      sessionStorage.clear();
      navigate('/');
    });
  };

  if (!accounts[0]) return null;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">{accounts[0].username}</span>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Sign Out
      </button>
    </div>
  );
};

export default ProfileMenu; 