import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmailTable = ({ emails = [] }) => {
  const navigate = useNavigate();

  if (!emails || emails.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No emails to display</p>
      </div>
    );
  }

  const handleEmailClick = (email) => {
    navigate(`/email/${email.id}`, { state: { email } });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.map((email) => (
            <tr
              key={email.id}
              onClick={() => handleEmailClick(email)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {email.sender?.name || 'Unknown'}
                </div>
                <div className="text-sm text-gray-500">
                  {email.sender?.address || 'No email'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{email.subject}</div>
                <div className="text-sm text-gray-500">
                  {email.preview?.slice(0, 100)}...
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {email.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailTable;
