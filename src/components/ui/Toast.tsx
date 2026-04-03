'use client';

import { useEffect, useState } from 'react';

const ICONS = ['2.png', '4.png', '5.png', '6.png', '7.png', '9.png', '10.png', '12.png', '16.png'];

interface ToastProps {
  message: string;
  highlight?: string;
  visible: boolean;
  onHide?: () => void;
}

export default function Toast({ message, highlight, visible, onHide }: ToastProps) {
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (visible) {
      setIcon(ICONS[Math.floor(Math.random() * ICONS.length)]);
      if (onHide) {
        const timer = setTimeout(onHide, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, onHide]);

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        bg-primary-600/90 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-xl shadow-lg
        transition-all duration-300 pointer-events-none max-w-[80vw]
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
    >
      <img src={`/song-copied-icon/${icon}`} alt="" className="absolute -left-16 top-1/2 -translate-y-1/2 w-14 h-14 object-cover rounded-full" />
      {message}
      {highlight && <span className="text-primary-300 font-medium">{highlight}</span>}
    </div>
  );
}
