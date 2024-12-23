import React from 'react';
import { 
  Mail, 
  Inbox, 
  Send, 
  Archive, 
  Trash2,
  PenSquare
} from 'lucide-react';
import Icon from '../EI-Logo.png'

const EmailSidebar = ({ activeView, setActiveView, folders, onFolderSelect }) => {
  // Define the desired order of primary folders
  const folderOrder = ['Inbox', 'Sent Items', 'Drafts'];

  // Sort primary folders based on the defined order
  const sortedPrimaryFolders = folderOrder
    .map(folderName => folders.find(folder => folder.displayName === folderName))
    .filter(folder => folder !== undefined);

  // Get the remaining folders that are not in the primary folder order
  const otherFolders = folders.filter(folder => 
    !folderOrder.includes(folder.displayName)
  );

  // Combine sorted primary folders with other folders
  const allFolders = [...sortedPrimaryFolders, ...otherFolders];

  return (
    <div className="relative z-10 flex-shrink-0 bg-[#F2F8FE] h-full w-16 lg:w-64 transition-all duration-300">
      <div className="h-full p-3 lg:p-4 flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-center lg:justify-start mb-6">
          <div className="w-8 h-8 lg:w-12 lg:h-12">
            <img 
              src={Icon}
              alt="Mail Icon" 
              className="w-full h-full object-contain"
            />
          </div>
          {/* <span className="hidden lg:block ml-3 font-medium text-gray-900">Mail</span> */}
        </div>


        {/* Navigation Items */}
        <nav className="flex-grow space-y-1">
          {allFolders.map((folder) => (
            <button
              key={folder.displayName}
              onClick={() => {
                setActiveView(folder.id);
                onFolderSelect(folder.id);
              }}
              className={`flex items-center justify-center lg:justify-start w-full p-2 rounded-lg transition-colors text-sm
                ${activeView === folder.id 
                  ? 'bg-black text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {folder.icon && (
                <folder.icon 
                  className="w-5 h-5 flex-shrink-0" 
                  style={{ 
                    color: activeView === folder.id ? 'white' : folder.color 
                  }}
                />
              )}
              <span className={`hidden lg:inline ml-3 ${
                activeView === folder.id ? 'text-white' : 'text-gray-900'
              }`}>
                {folder.displayName}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default EmailSidebar;