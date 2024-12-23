import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmailSidebar from './EmailSidebar'; 
import ProfileMenu from './ProfileMenu'; 
import useStore from '../useStore'; // Import Zustand store
import EmailTable from './EmailTable'; // Import the new EmailTable component
import { Inbox, Send, Archive, PencilOff, Trash2, History, FolderX, Notebook, FileBox } from 'lucide-react'; // Import all necessary icons 
import { API_BASE_URL } from '../api/config';

const EmailList = ({ view }) => {
  const { accessToken } = useStore((state) => state); // Get accessToken from Zustand store
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [folders, setFolders] = useState([]); 
  const [activeView, setActiveView] = useState('inbox'); 

  // Fetch emails based on the selected folder
  const fetchEmailsByFolder = async (folderId) => {
    console.log('Folder ID: ', folderId);
    try {
        const accessToken = sessionStorage.getItem('accessToken') || useStore.getState().accessToken;
        
        if (!accessToken) {
            console.error('No access token available');
            navigate('/');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch emails from the selected folder');
        }

        const data = await response.json();
        const formattedEmails = data.value.map(email => ({
            id: email.id,
            sender: {
                name: email.sender.emailAddress.name || 'Unknown Sender',
                address: email.sender.emailAddress.address || 'No Address Available',
            },
            subject: email.subject,
            preview: email.bodyPreview,
            body: email.body.content,
            time: new Date(email.sentDateTime).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
            starred: false,
            selected: false,
        }));

        setEmails(formattedEmails);
        console.log('Fetched emails from folder:', formattedEmails);
    } catch (error) {
        console.error('Error fetching emails by folder:', error);
    }
  };

  // Fetch emails from the backend
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken') || useStore.getState().accessToken;
        
        if (!accessToken) {
          console.error('No access token available');
          navigate('/');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }
        const data = await response.json();

        // Map the response to the expected format
        const formattedEmails = data.emails.map(email => ({
          id: email.id,
          sender: {
            name: email.sender.emailAddress.name || 'Unknown Sender',
            address: email.sender.emailAddress.address || 'No Address Available',
          },
          subject: email.subject,
          preview: email.bodyPreview, // Keep the preview for display
          body: email.body.content, // Use the full body content for summarization
          time: new Date(email.sentDateTime).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }), // Format the date as DD MMM YEAR
          starred: false, // Default value for starred
          selected: false, // Default value for selected
        }));

        setEmails(formattedEmails);
        console.log('Fetched emails:', formattedEmails);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    // Initial fetch
    fetchEmails();

    // Polling every 30 seconds
    const intervalId = setInterval(() => fetchEmails(), 30000); // 30 seconds
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [accessToken]); // Add accessToken as a dependency if it can change

  // Fetch folders from the backend
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken') || useStore.getState().accessToken;
        
        if (!accessToken) {
          console.error('No access token available');
          navigate('/');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/folders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch folders: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Map the response to include icons
        const folderIcons = {
          Inbox: Inbox,
          'Sent Items': Send,
          Archive: Archive,
          'Drafts': PencilOff,
          'Deleted Items': Trash2,
          'Conversation History': History,
          'Junk Email': FolderX,
          'Notes': Notebook,
          'Outbox': FileBox
          // Add other folder names and their corresponding icons here
        };

        const formattedFolders = data.value.map(folder => ({
          id: folder.id,
          displayName: folder.displayName,
          icon: folderIcons[folder.displayName] || null,
          color: 'gray', // Default color
        }));

        setFolders(formattedFolders);
        console.log('Fetched folders:', formattedFolders);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    // Initial fetch
    fetchFolders();
  }, [accessToken]); // Add accessToken as a dependency if it can change


 

  const handleFolderSelect = (folderId) => {
    // Define the function to handle folder selection
    fetchEmailsByFolder(folderId); // Example implementation
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out bg-white shadow-lg rounded-r-lg ">
        <EmailSidebar
          activeView={activeView}
          setActiveView={handleFolderSelect}
          folders={folders}
          onFolderSelect={handleFolderSelect}
        />
      </div>

      {/* Main content area with dynamic width */}
      <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out sm:pl-0 lg:pl-64">
        {/* Top Menu with Filter and Profile */}
        <div className="flex justify-end items-center p-4 border-b border-gray-200 bg-[#F2F8FE] shadow-sm sm:pl-[5rem]">
          <ProfileMenu />
        </div>
       <div className='sm:pl-[4rem] lg:pl-[1rem]'>
        {/* Use the EmailTable component */}
        <EmailTable
          emails={emails} 
        />
        </div>
      </div>
    </div>
  );
};

export default EmailList;