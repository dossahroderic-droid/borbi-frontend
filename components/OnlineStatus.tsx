import { useEffect, useState } from 'react';

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-xs text-gray-600">
        {isOnline ? 'En ligne' : 'Hors ligne (données stockées localement)'}
      </span>
    </div>
  );
}
