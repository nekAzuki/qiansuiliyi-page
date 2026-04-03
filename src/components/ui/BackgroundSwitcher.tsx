'use client';

export default function BackgroundSwitcher({ children }: { children: React.ReactNode }) {
  const handleCharacterClick = () => {
    const el = document.getElementById('bg-character');
    if (el) {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'characterJump 400ms ease-out';
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background — z-0 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Character image — z-[5], between bg and content, clickable */}
      <div
        className="fixed bottom-0 right-0 z-[5] overflow-hidden cursor-pointer"
        style={{ height: '52.5vh', width: 'auto' }}
        onClick={handleCharacterClick}
      >
        <img
          id="bg-character"
          src="/bg-character.png"
          alt=""
          className="object-contain object-top"
          style={{ height: '75vh', width: 'auto' }}
        />
      </div>

      {/* Page content — z-10, centered, sides transparent for character clicks */}
      <div className="relative z-10 max-w-lg mx-auto">
        {children}
      </div>
    </div>
  );
}
