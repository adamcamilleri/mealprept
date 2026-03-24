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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
      {/* Animated dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-coral-400"
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </div>

      <p className="text-warmgray-500 text-base font-medium transition-opacity duration-300">
        {messages[messageIndex]}
      </p>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
