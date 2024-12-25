import React from 'react';
import { RefreshCw } from 'lucide-react';
import useSyncStore from '../stores/syncStore';

const SyncStatus = ({ onSync }) => {
  const lastSyncTime = useSyncStore(state => state.lastSyncTime);
  const isLoading = useSyncStore(state => state.isLoading);

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const date = new Date(lastSyncTime);
    return date.toLocaleTimeString();
  };

  const handleSyncClick = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onSync();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
      <div className="text-sm text-gray-600">
        Last synced: {formatLastSync()}
      </div>
      <button
        onClick={handleSyncClick}
        disabled={isLoading}
        className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md 
          ${isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Syncing...' : 'Sync Now'}</span>
      </button>
    </div>
  );
};

export default SyncStatus; 