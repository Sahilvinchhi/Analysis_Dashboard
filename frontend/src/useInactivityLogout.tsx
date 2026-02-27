import { useEffect, useRef } from 'react';

interface UseInactivityLogoutProps {
  timeout?: number; // in milliseconds
  onInactive: () => void;
  enabled?: boolean;
}

export const useInactivityLogout = ({ 
  timeout = 120000, // 2 minutes default
  onInactive,
  enabled = true 
}: UseInactivityLogoutProps) => {
  const timeoutIdRef = useRef<number | null>(null);

  const resetTimer = () => {
    // Clear existing timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set new timer
    if (enabled) {
      timeoutIdRef.current = setTimeout(() => {
        onInactive();
      }, timeout);
    }
  };

  useEffect(() => {
    if (!enabled) {
      // Clear timer if disabled
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      return;
    }

    // Events to track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Attach event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start the timer initially
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [timeout, onInactive, enabled]);

  return { resetTimer };
};
