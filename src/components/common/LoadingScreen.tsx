import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'در حال بارگذاری...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="toyota-logo text-3xl md:text-4xl mb-6">TOYOTA AHMADI</div>
        
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;