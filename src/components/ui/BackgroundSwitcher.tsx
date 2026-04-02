'use client';

export default function BackgroundSwitcher({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Character image - bottom right */}
      <div
        className="fixed bottom-0 right-0 z-[5] overflow-hidden pointer-events-none"
        style={{ height: '52.5vh', width: 'auto' }}
      >
        <img
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
