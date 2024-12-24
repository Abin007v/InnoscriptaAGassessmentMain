import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmailSidebar from './EmailSidebar';
import ProfileMenu from './ProfileMenu';
import useStore from '../useStore';
import EmailTable from './EmailTable';
import { API_BASE_URL } from '../api/config';

const EmailList = ({ view }) => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeView, setActiveView] = useState('inbox');
  const { accessToken } = useStore((state) => state);
  const userId = sessionStorage.getItem('userId');
  const outlookEmail = sessionStorage.getItem('outlookEmail');

  const formatEmailData = (email) => ({
    id: email.id,
    sender: {
      name: email.from?.emailAddress?.name || 
            email.sender?.name ||
            'Unknown Sender',
      address: email.from?.emailAddress?.address || 
               email.sender?.address ||
               'No Address'
    },
    subject: email.subject || 'No Subject',
    preview: email.bodyPreview || email.body?.content || '',
    body: email.body?.content || '',
    time: new Date(email.receivedDateTime || email.sentDateTime || Date.now()).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  });

  const formatEmails = (rawEmails) => {
    if (!Array.isArray(rawEmails)) {
      console.error('Expected array of emails, got:', typeof rawEmails);
      return [];
    }
    return rawEmails.map(formatEmailData);
  };

  const fetchEmails = async () => {
    try {
      if (!accessToken || !userId || !outlookEmail) {
        console.error('Missing required credentials');
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          userId,
          outlookEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(formatEmails(data.emails));
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      if (!accessToken || !userId || !outlookEmail) {
        console.error('Missing required credentials');
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          userId,
          outlookEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data.value);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchEmailsByFolder = async (folderId) => {
    try {
      if (!accessToken || !userId || !outlookEmail) {
        console.error('Missing required credentials');
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          userId,
          outlookEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folder messages');
      }

      const data = await response.json();
      const emailsToFormat = data.value || data.emails || [];
      setEmails(formatEmails(emailsToFormat));
    } catch (error) {
      console.error('Error fetching folder messages:', error);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }
    fetchEmails();
    fetchFolders();
  }, [accessToken, userId, outlookEmail]);

  const handleFolderSelect = (folderId) => {
    fetchEmailsByFolder(folderId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <EmailSidebar 
        folders={folders}
        activeView={activeView}
        setActiveView={setActiveView}
        onFolderSelect={fetchEmailsByFolder}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end items-center p-4 border-b border-gray-200 bg-[#F2F8FE] shadow-sm sm:pl-[5rem]">
          <ProfileMenu />
        </div>
        <div className='sm:pl-[4rem] lg:pl-[1rem]'>
          <EmailTable emails={emails} />
        </div>
      </div>
    </div>
  );
};

export default EmailList;