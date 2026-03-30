'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
}

export default function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (visible && onHide) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        bg-gray-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg
        transition-all duration-300 pointer-events-none
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {message}
    </div>
  );
}
