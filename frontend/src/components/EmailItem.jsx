import React from 'react';
import { format } from 'date-fns';

const EmailItem = ({ email }) => {
  // Add logging to see what data we're receiving
  // console.log('Email item data:', email);

  // Safely access nested properties
  const senderName = email?.from?.emailAddress?.name || 'Unknown Sender';
  const senderEmail = email?.from?.emailAddress?.address || 'no-email';
  const subject = email?.subject || 'No Subject';
  const preview = email?.bodyPreview || '';
  const date = email?.receivedDateTime || new Date().toISOString();
  const isRead = email?.isRead || false;

  return (
    <div 
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
        !isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0"> {/* Add min-w-0 to prevent text overflow */}
          <div className="flex items-center space-x-2">
            <p className={`font-medium ${!isRead ? 'text-black' : 'text-gray-900'}`}>
              {senderName}
            </p>
            <span className="text-sm text-gray-500 truncate">
              {`<${senderEmail}>`}
            </span>
          </div>
          <h3 className={`text-sm mt-1 ${!isRead ? 'font-semibold' : 'font-medium'}`}>
            {subject}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {preview}
          </p>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
          {format(new Date(date), 'MMM d, yyyy')}
        </div>
      </div>
    </div>
  );
};

export default EmailItem; 