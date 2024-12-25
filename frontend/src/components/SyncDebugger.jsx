import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const SyncDebugger = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkSyncStatus = async () => {
    try {
      setLoading(true);
      const accessToken = sessionStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/debug/sync-status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Last-Sync-Time': sessionStorage.getItem('lastSyncTime') || ''
        },
        credentials: 'include'
      });

      if (response.status === 403) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch sync status');
      }

      const data = await response.json();
      setSyncStatus(data.data);
    } catch (err) {
      console.error('Sync status error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check sync status every minute
    const interval = setInterval(checkSyncStatus, 60000);
    checkSyncStatus(); // Initial check

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <div className="text-sm text-gray-600">Checking sync status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <div className="text-sm text-red-600">Error: {error}</div>
        <button
          onClick={checkSyncStatus}
          className="text-xs text-blue-600 hover:underline mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!syncStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">Sync Status</h3>
      <div className="space-y-2 text-sm">
        <div>
          Last Sync: {new Date(syncStatus.lastSyncTime || Date.now()).toLocaleString()}
        </div>
        <div>
          In Sync: {' '}
          <span className={syncStatus.inSync ? 'text-green-600' : 'text-red-600'}>
            {syncStatus.inSync ? '✓' : '✗'}
          </span>
        </div>
        {!syncStatus.inSync && (
          <div className="text-xs text-gray-500">
            <div>Graph Latest: {syncStatus.graphLatestEmail?.receivedDateTime}</div>
            <div>Local Latest: {syncStatus.localLatestEmail?.receivedDateTime}</div>
          </div>
        )}
        <button
          onClick={checkSyncStatus}
          className="text-xs text-blue-600 hover:underline"
        >
          Check Now
        </button>
      </div>
    </div>
  );
};

export default SyncDebugger; 