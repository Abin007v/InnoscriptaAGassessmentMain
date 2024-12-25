import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <div className="text-sm text-gray-600">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 