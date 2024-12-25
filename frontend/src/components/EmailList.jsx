import React, { useEffect, useCallback, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import useSyncStore from '../stores/syncStore';
import EmailItem from './EmailItem';
import SyncStatus from './SyncStatus';
import { API_BASE_URL } from '../config';
import { Loader2 } from 'lucide-react';
import { getAccessToken } from '../utils/auth';

const EmailList = () => {
  const { instance } = useMsal();
  const { emails, isLoading, error, selectedFolderId } = useSyncStore();
  const abortControllerRef = useRef(null);

  const fetchEmails = useCallback(async (force = false) => {
    if (!selectedFolderId) return;

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 [Frontend] Syncing emails for folder:', selectedFolderId, force ? '(force)' : '');
      useSyncStore.getState().setLoading(true);
      useSyncStore.getState().setError(null);
      
      const accessToken = await getAccessToken(instance);
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const endpoint = `${API_BASE_URL}/api/folders/${selectedFolderId}/emails`;
      console.log('📡 [Frontend] Fetching from:', endpoint);

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      if (force) {
        headers['Force-Sync'] = 'true';
      }

      const response = await fetch(endpoint, {
        headers,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const { data } = await response.json();
      console.log('📥 [Frontend] Received emails for folder:', selectedFolderId, 'count:', data?.length || 0);
      
      // Only update if this is still the current folder
      if (selectedFolderId === useSyncStore.getState().selectedFolderId) {
        useSyncStore.getState().setEmails(Array.isArray(data) ? data : []);
        useSyncStore.getState().setLoading(false);
        useSyncStore.getState().setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🛑 [Frontend] Request cancelled for folder:', selectedFolderId);
        return;
      }

      console.error('❌ [Frontend] Sync error:', error);
      if (selectedFolderId === useSyncStore.getState().selectedFolderId) {
        useSyncStore.getState().setError(error.message);
        useSyncStore.getState().setLoading(false);
      }
    }
  }, [selectedFolderId, instance]);

  // Handle manual sync
  const handleSync = useCallback(() => {
    console.log('🔄 [Frontend] Manual sync triggered');
    fetchEmails(true);
  }, [fetchEmails]);

  // Fetch emails when folder changes
  useEffect(() => {
    if (selectedFolderId) {
      console.log('📂 [Frontend] Folder changed, fetching emails for:', selectedFolderId);
      fetchEmails();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedFolderId, fetchEmails]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading emails...</p>
        </div>
      </div>
    );
  }

  // No folder selected
  if (!selectedFolderId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Select a folder to view emails</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={fetchEmails}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!emails || emails.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No emails found in this folder</p>
          <button 
            onClick={fetchEmails}
            className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Email list
  return (
    <div className="h-full flex flex-col">
      <SyncStatus onSync={handleSync} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="bg-white shadow rounded-lg divide-y">
            {emails.map(email => (
              <EmailItem 
                key={email.id || email.messageId} 
                email={email} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailList;