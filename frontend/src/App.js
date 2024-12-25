import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import Login from './components/Login';
import EmailList from './components/EmailList';
import FolderList from './components/FolderList';
import ProfileMenu from './components/ProfileMenu';
import PrivateRoute from './components/routing/PrivateRoute';
import useSyncStore from './stores/syncStore';

function App() {
  const { accounts } = useMsal();
  const { instance } = useMsal();
  const isAuthenticated = accounts.length > 0 && sessionStorage.getItem('accessToken');
  const setSelectedFolder = useSyncStore(state => state.setSelectedFolder);
  const selectedFolderId = useSyncStore(state => state.selectedFolderId);

  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      {instance.getActiveAccount() && 
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Email App</h1>
          <ProfileMenu />
        </div>
      </header>}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/emails/*"
            element={
              <PrivateRoute>
                <div className="h-full flex">
                  <FolderList onFolderSelect={handleFolderSelect} />
                  <div className="flex-1 overflow-hidden">
                    <EmailList folderId={selectedFolderId} />
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;