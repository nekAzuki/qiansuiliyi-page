'use client';

import { useRef, useCallback } from 'react';

export default function BackgroundSwitcher({ children }: { children: React.ReactNode }) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const didDrag = useRef(false);

  const getEl = () => document.getElementById('bg-character');

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    const el = getEl();
    if (el) {
      el.style.animation = 'none';
      el.style.transform = '';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.animation = 'characterJump 400ms ease-out';
          setTimeout(() => {
            el.style.animation = 'idleBounce 3s ease-in-out infinite';
          }, 400);
        });
      });
    }
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    didDrag.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;

    const el = getEl();
    if (el) {
      el.style.animation = 'none';
      el.style.transition = 'none';
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDrag.current = true;
    }

    const el = getEl();
    if (el) {
      // Limit movement and add rotation based on horizontal drag
      const clampedDx = Math.max(-window.innerWidth, Math.min(window.innerWidth, dx));
      const clampedDy = Math.max(-window.innerHeight * 0.8, Math.min(window.innerHeight * 0.3, dy));
      const rotation = clampedDx * 0.15;
      el.style.transform = `translate(${clampedDx}px, ${clampedDy}px) rotate(${rotation}deg)`;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;

    const el = getEl();
    if (el) {
      // Spring back with elastic transition
      el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = 'translate(0, 0) rotate(0deg)';

      setTimeout(() => {
        el.style.transition = '';
        el.style.transform = '';
        el.style.animation = 'idleBounce 3s ease-in-out infinite';
      }, 600);
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background — z-0 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Character image — z-[5], between bg and content, clickable + draggable */}
      <div
        className="fixed right-0 z-[5] cursor-pointer select-none"
        style={{ bottom: '-22.5vh', height: '75vh', width: 'auto', clipPath: 'inset(-100vh -100vw 30% -100vw)' }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img
          id="bg-character"
          src="/bg-character.webp"
          alt=""
          className="object-contain object-top"
          draggable={false}
          style={{ height: '75vh', width: 'auto', animation: 'idleBounce 3s ease-in-out infinite', transformOrigin: 'bottom center' }}
        />
      </div>

      {/* Page content — z-10, pointer-events pass through to character */}
      <div className="relative z-10 pointer-events-none [&>*]:pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
