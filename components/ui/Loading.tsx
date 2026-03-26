'use client';

import { useState, useEffect } from 'react';

const messages = [
  { text: 'Chopping ingredients...', emoji: '🔪' },
  { text: 'Taste-testing your plan...', emoji: '👅' },
  { text: 'Marinating the good stuff...', emoji: '🥘' },
  { text: 'Firing up the stove...', emoji: '🔥' },
  { text: 'Plating your recipes...', emoji: '🍽️' },
  { text: 'Almost ready to serve...', emoji: '🧑‍🍳' },
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
      {/* Spinner ring */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-[2px] border-warmgray-100" />
        <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-navy-500 animate-spin-ring" />
      </div>

      <div
        className={`flex items-center gap-2.5 transition-all duration-300 ${
          fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'
        }`}
      >
        <span className="text-lg">{messages[messageIndex].emoji}</span>
        <p className="text-warmgray-400 text-sm font-medium">
          {messages[messageIndex].text}
        </p>
      </div>
    </div>
  );
}
