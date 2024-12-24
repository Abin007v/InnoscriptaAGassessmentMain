import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import useStore from '../useStore';
import { Menu, Transition } from '@headlessui/react';
import { LogOut, User, Mail } from 'lucide-react';
import { Fragment } from 'react';

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const clearAccessToken = useStore((state) => state.clearAccessToken);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    outlookEmail: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const localEmail = sessionStorage.getItem('email');
        const outlookEmail = sessionStorage.getItem('outlookEmail');

        // Fetch Microsoft profile if connected
        if (accessToken) {
          const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserProfile({
              name: data.displayName || 'No Name',
              email: localEmail || 'No Email',
              outlookEmail: outlookEmail || data.mail || data.userPrincipalName
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({
          name: 'User',
          email: sessionStorage.getItem('email') || 'No Email',
          outlookEmail: sessionStorage.getItem('outlookEmail') || 'No Outlook Email'
        });
      }
    };

    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear Zustand store
      clearAccessToken();
      
      // Sign out from Microsoft
      await instance.logoutRedirect({
        postLogoutRedirectUri: '/',
      });

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force navigation to home page even if logout fails
      navigate('/');
    }
  };

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
            <User className="h-6 w-6 text-gray-600" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-72 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              {/* Profile Header */}
              <div className="px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <User className="h-10 w-10 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                    <p className="text-sm text-gray-500">{userProfile.email}</p>
                  </div>
                </div>
              </div>

              {/* Microsoft Account */}
              <div className="px-4 py-2 border-b">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Microsoft Account</p>
                    <p className="text-sm text-gray-700">{userProfile.outlookEmail}</p>
                  </div>
                </div>
              </div>

              {/* Sign Out Option */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default ProfileMenu; 