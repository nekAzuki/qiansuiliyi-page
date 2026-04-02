'use client';

import { useState, useEffect } from 'react';

const BACKGROUNDS = ['/bg.jpg', '/bg-grid.jpg'];

export default function BackgroundSwitcher({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Persist selection
  useEffect(() => {
    const saved = localStorage.getItem('bg_index');
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < BACKGROUNDS.length) {
        setCurrentIndex(idx);
      }
    }
  }, []);

  const switchTo = (direction: 'prev' | 'next') => {
    if (transitioning) return;
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % BACKGROUNDS.length
        : (currentIndex - 1 + BACKGROUNDS.length) % BACKGROUNDS.length;

    setNextIndex(newIndex);
    setTransitioning(true);

    setTimeout(() => {
      setCurrentIndex(newIndex);
      setNextIndex(null);
      setTransitioning(false);
      localStorage.setItem('bg_index', String(newIndex));
    }, 600);
  };

  return (
    <div className="relative min-h-screen">
      {/* Current background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity"
        style={{
          backgroundImage: `url('${BACKGROUNDS[currentIndex]}')`,
          opacity: nextIndex !== null ? 0 : 1,
          transitionDuration: '600ms',
        }}
      />

      {/* Next background (fades in) */}
      {nextIndex !== null && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${BACKGROUNDS[nextIndex]}')`,
            animation: 'fadeIn 600ms ease-in-out forwards',
          }}
        />
      )}

      {/* Left arrow zone */}
      <div className="fixed left-0 top-0 bottom-0 w-12 z-40 group cursor-pointer flex items-center justify-center"
        onClick={() => switchTo('prev')}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm rounded-r-xl p-2 hover:bg-black/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      </div>

      {/* Right arrow zone */}
      <div className="fixed right-0 top-0 bottom-0 w-12 z-40 group cursor-pointer flex items-center justify-center"
        onClick={() => switchTo('next')}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm rounded-l-xl p-2 hover:bg-black/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* Character image - bottom right */}
      <div
        className="fixed bottom-0 right-0 z-20 overflow-hidden cursor-pointer"
        style={{ height: '52.5vh', width: 'auto' }}
        onClick={() => {
          const el = document.getElementById('bg-character');
          if (el) {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = 'characterJump 400ms ease-out';
          }
        }}
      >
        <img
          id="bg-character"
          src="/bg-character.png"
          alt=""
          className="object-contain object-top"
          style={{ height: '75vh', width: 'auto' }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}
