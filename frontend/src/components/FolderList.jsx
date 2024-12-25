import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { Folder, Inbox, Send, Archive, Trash, Loader2 } from 'lucide-react';
import useSyncStore from '../stores/syncStore';

const FolderList = ({ onFolderSelect }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedFolderId = useSyncStore(state => state.selectedFolderId);
  const setSelectedFolder = useSyncStore(state => state.setSelectedFolder);
  const isLoading = useSyncStore(state => state.isLoading);

  const handleFolderSelect = useCallback((folderId) => {
    if (folderId === selectedFolderId || isLoading) return;
    setSelectedFolder(folderId);
    sessionStorage.setItem('selectedFolderId', folderId);
    onFolderSelect(folderId);
  }, [setSelectedFolder, onFolderSelect, selectedFolderId, isLoading]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        console.log('📂 [Frontend] Fetching folders...');
        const accessToken = sessionStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/api/folders`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }

        const data = await response.json();
        console.log('📂 [Frontend] Received folders:', data.data.length);
        setFolders(data.data);

        const storedFolderId = sessionStorage.getItem('selectedFolderId');
        if (storedFolderId) {
          handleFolderSelect(storedFolderId);
        } else if (!selectedFolderId) {
          const inboxFolder = data.data.find(
            folder => folder.name.toLowerCase() === 'inbox'
          );
          if (inboxFolder) {
            console.log('📥 [Frontend] Auto-selecting inbox folder:', inboxFolder.id);
            handleFolderSelect(inboxFolder.id);
          }
        }
      } catch (error) {
        console.error('❌ [Frontend] Folder fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [handleFolderSelect, selectedFolderId]);

  if (loading) {
    return <div className="p-4">Loading folders...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const getFolderIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'inbox': return <Inbox className="w-5 h-5" />;
      case 'sent items': return <Send className="w-5 h-5" />;
      case 'archive': return <Archive className="w-5 h-5" />;
      case 'deleted items': return <Trash className="w-5 h-5" />;
      default: return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-r h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Folders</h2>
        <nav>
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => handleFolderSelect(folder.id)}
              className={`flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg ${
                selectedFolderId === folder.id ? 'bg-gray-100' : ''
              }`}
              disabled={isLoading && selectedFolderId === folder.id}
            >
              {getFolderIcon(folder.name)}
              <span>{folder.name}</span>
              {folder.unreadCount > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {folder.unreadCount}
                </span>
              )}
              {isLoading && selectedFolderId === folder.id && (
                <Loader2 className="w-4 h-4 ml-auto animate-spin" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default FolderList; 