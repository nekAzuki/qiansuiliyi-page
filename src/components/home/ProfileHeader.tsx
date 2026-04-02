interface ProfileHeaderProps {
  songCount: number;
}

export default function ProfileHeader({ songCount }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-primary-100/50">
      {/* Subtle purple accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300" />

      <div className="relative flex items-center gap-4 p-6 pt-5">
        {/* Avatar with link */}
        <a
          href="https://space.bilibili.com/279148275"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 relative rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <img
            src="/avatar.jpg"
            alt="千穗梨衣_lily"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-300/60 ring-offset-2 ring-offset-white/50"
          />
          <div className="absolute inset-0 rounded-full bg-gray-300/0 hover:bg-gray-300/30 transition-colors duration-200" />
        </a>

        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate text-primary-700">千穗梨衣_lily</h1>
          <p className="text-gray-500 text-sm mt-0.5">她的歌单</p>
          <p className="text-primary-400 text-xs mt-1">
            共 {songCount} 首歌曲
          </p>
        </div>
      </div>
    </div>
  );
}
