import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../authConfig';
import ProfileMenu from './ProfileMenu';
import { authService } from '../services/authService';

const Login = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showMicrosoftPrompt, setShowMicrosoftPrompt] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const activeAccount = instance.getActiveAccount();
  const userName = activeAccount?.name || '';
  const userEmail = activeAccount?.username || '';

  const handleLoginAccount = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const result = await authService.login({ email, password });
      if (result.success) {
        setShowMicrosoftPrompt(true);
        setAccountCreated(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setError('');

      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      const result = await authService.register({ email, password });
      if (result.success) {
        setAccountCreated(true);
        setShowMicrosoftPrompt(true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      setError(''); // Clear any existing errors
      
      // Request login with specific scopes for Outlook
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: 'select_account',
        scopes: [
          'User.Read',
          'Mail.Read',
          'Mail.ReadWrite',
          'offline_access'
        ]
      });

      if (response) {
        try {
          // Set the active account
          instance.setActiveAccount(response.account);
          const accessToken = response.accessToken;
          const outlookEmail = response.account.username;
          const name = response.account.name;
          
          // Store the access token
          sessionStorage.setItem('accessToken', accessToken);

          // Store Outlook data
          const storeResult = await authService.storeOutlookData(
            userId,
            accessToken,
            outlookEmail,
            name
          );

          if (storeResult.success) {
            if (storeResult.syncError) {
              console.warn('⚠️ Sync warning:', storeResult.syncError);
            }
            // Navigate to emails page even if sync had issues
            navigate('/emails');
          } else {
            throw new Error('Failed to store outlook data');
          }
        } catch (error) {
          console.error('Microsoft data storage error:', error);
          setError('Failed to connect Microsoft account: ' + error.message);
        }
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      setError(error.message || 'Microsoft login failed. Please try again.');
    }
  };

  // Show Microsoft account prompt
  if (showMicrosoftPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {accountCreated ? 'Account Created Successfully!' : 'Login Successful!'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please connect your Microsoft account to continue
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue with Microsoft
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main login/register form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* {instance.getActiveAccount() && (
        <div className="absolute top-0 right-0 mt-4 mr-4">
          <ProfileMenu userName={userName} userEmail={userEmail} onSignOut={() => {}} />
        </div>
      )} */}
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create new account'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {isLogin ? (
            <>
              <button
                onClick={handleLoginAccount}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Login
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLogin(false)}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create new account
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCreateAccount}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Create Account
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLogin(true)}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in instead
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 