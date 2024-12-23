import React from 'react';
import { Star as StarFilled, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmailTable = ({ emails }) => {
  const navigate = useNavigate();

  const handleItemClick = (e, email) => {
    if (e.target.closest('button')) {
      e.stopPropagation(); // Prevent the click from propagating if a button is clicked
      return;
    }
    navigate(`/email/${email.id}`, { state: { email } }); // Navigate to the email view page
  };

  
  return (
    <div>


      {/* Email List Items */}
      <div>
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-center p-3 border-b border-gray-200 hover:bg-blue-100 cursor-pointer transition duration-200 ${email.selected ? 'bg-blue-100' : ''}`}
            onClick={(e) => handleItemClick(e, email)}
          > 
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">{email.sender.name}</span>
                  <span className="text-sm text-gray-600">{email.sender.address}</span>
                </div>
                <span className="text-sm text-gray-500">{email.time}</span>
              </div>
              <p className="text-gray-700 text-base">{email.subject}</p>
              <p className="text-gray-500 text-xs">{email.preview.slice(0, 50) + (email.preview.length > 50 ? '...' : '')}</p>
            </div>
            <button 
              className={`ml-4 flex items-center space-x-2 text-sm cursor-pointer`}
            >
              <StarFilled
                className={`h-4 w-4 ${email.starred ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailTable;
