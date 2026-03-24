'use client';

import { useState, useEffect } from 'react';

const messages = [
  'Chopping ingredients...',
  'Taste-testing your plan...',
  'Marinating the good stuff...',
  'Firing up the stove...',
  'Plating your recipes...',
  'Almost ready to serve...',
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-warmgray-200 rounded-full" />
        <div className="w-16 h-16 border-4 border-coral-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
      </div>
      <p className="text-warmgray-600 text-lg font-medium animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
