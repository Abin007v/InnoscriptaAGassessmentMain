import React, { useEffect, useState } from "react";
import { useMsal, MsalProvider } from "@azure/msal-react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { loginRequest } from "./auth-config";
import EmailList from "./components/EmailList";
import EmailView from "./components/EmailView";
import useStore from "./useStore";
import PrivateRoute from "./components/routing/PrivateRoute";
import ProfileMenu from "./components/ProfileMenu";
import AutomationRulesPage from "./components/AutomationRulesPage";
import { authService } from './services/authService';

const Icon = "/path-to-your-icon.svg";

const WrappedView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { instance } = useMsal();
  const setAccessToken = useStore((state) => state.setAccessToken);
  const navigate = useNavigate();

  const fetchAccessToken = async () => {
    try {
      const activeAccount = instance.getActiveAccount();
      if (!activeAccount) {
        console.error('No active account');
        return;
      }

      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });
      
      console.log("Access Token acquired");
      setAccessToken(response.accessToken);
      sessionStorage.setItem('accessToken', response.accessToken);
    } catch (error) {
      console.error("Token acquisition failed:", error);
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        setAccessToken(response.accessToken);
        sessionStorage.setItem('accessToken', response.accessToken);
      } catch (interactiveError) {
        console.error("Interactive token acquisition failed:", interactiveError);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await instance.initialize();
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: 'select_account'
      });
      
      if (response) {
        instance.setActiveAccount(response.account);
        await fetchAccessToken();
        sessionStorage.setItem('outlookEmail', response.account.username);
        navigate('/emails');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to login with Microsoft account. Please try again.');
    }
  };

  const handleLoginAccount = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        alert('Please enter both email and password');
        return;
      }

      const loginResult = await authService.login({ email, password });
      
      if (loginResult.success) {
        // Store user ID and email from local authentication
        sessionStorage.setItem('userId', loginResult.userId);
        sessionStorage.setItem('email', email);
        
        const confirmLink = window.confirm(
          "Account logged in successfully! Now you'll need to link a Microsoft account. Click OK to continue."
        );

        if (confirmLink) {
          await handleLogin();
        }
      }
    } catch (error) {
      alert(error.message);
      console.error('Login failed:', error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      // Validate empty fields
      if (!email.trim()) {
        alert('Please enter an email address');
        return;
      }
      if (!password.trim()) {
        alert('Please enter a password');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      // First, create the account
      const registerResult = await authService.register({ email, password });
      
      if (registerResult.success) {
        const confirmLink = window.confirm(
          "Account created successfully! Now you'll need to link a Microsoft account. Click OK to continue."
        );

        if (confirmLink) {
          await handleLogin();
        }
      }
    } catch (error) {
      alert(error.message);
      console.error('Account creation failed:', error);
    }
  };

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const fetchUserProfile = async () => {
    if (instance.getActiveAccount()) {
      const accessToken = useStore.getState().accessToken;
      try {
        const response = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setUserName(data.displayName);
        setUserEmail(data.mail || data.userPrincipalName);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [instance.getActiveAccount()]);

  if (instance.getActiveAccount()) {
    return <Navigate to="/emails" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {instance.getActiveAccount() && <ProfileMenu userName={userName} userEmail={userEmail} onSignOut={handleLogin} />}
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create new account'}
          </h2>
        </div>

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


const App = ({ instance }) => {
  useEffect(() => {
    instance.initialize().catch(error => {
      console.error('Error initializing MSAL:', error);
    });
  }, [instance]);

  return (
    <MsalProvider instance={instance}>
      <Router>
        <Routes>
          <Route path="/" element={<WrappedView />} />
          <Route element={<PrivateRoute />}>
            <Route path="/emails" element={<EmailList />} />
            <Route path="/email/:id" element={<EmailView />} />
          </Route>
          <Route path="/rules" element={<AutomationRulesPage/>}/>
        </Routes>
      </Router>
    </MsalProvider>
  );
};

export default App;