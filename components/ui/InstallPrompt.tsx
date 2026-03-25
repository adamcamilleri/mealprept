'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('install-dismissed')) {
      setDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true);
      return;
    }

    // Only show on mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isiOS);

    // Listen for the browser's install prompt (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDismissed(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('install-dismissed', '1');
  };

  if (dismissed) return null;

  // Show nothing if no install prompt available and not iOS
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-[0_4px_24px_rgba(50,48,47,0.12)] p-4 z-50 animate-fadeInScale">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warmgray-800">Add NoChef to your home screen</p>
            <p className="text-xs text-warmgray-400 mt-0.5">Quick access from your phone, no app store needed.</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-warmgray-300 hover:text-warmgray-500 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-3">
          {deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full py-2 px-4 bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium rounded-full transition-colors"
            >
              Add to home screen
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(!showIOSGuide)}
              className="w-full py-2 px-4 bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium rounded-full transition-colors"
            >
              How to add
            </button>
          ) : null}
        </div>
        {showIOSGuide && (
          <div className="mt-3 bg-warmgray-50 rounded-xl p-3 text-xs text-warmgray-600 space-y-1.5">
            <p>1. Tap the <strong>Share</strong> button (square with arrow)</p>
            <p>2. Scroll down and tap <strong>Add to Home Screen</strong></p>
            <p>3. Tap <strong>Add</strong></p>
          </div>
        )}
      </div>
    </>
  );
}
