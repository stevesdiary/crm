import React, { useState, useEffect } from 'react';
import { setupOfflineDetection } from '../utils/pwa';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const cleanup = setupOfflineDetection(setIsOnline);
    return cleanup;
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <span>⚠️</span>
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    </div>
  );
};