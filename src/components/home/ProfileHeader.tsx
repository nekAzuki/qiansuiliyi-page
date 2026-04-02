interface ProfileHeaderProps {
  songCount: number;
}

export default function ProfileHeader({ songCount }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative flex items-center gap-4 p-6">
        {/* Avatar */}
        <img
          src="/avatar.jpg"
          alt="千穗梨衣_lily"
          className="flex-shrink-0 w-16 h-16 rounded-full object-cover border-2 border-white/30"
        />

        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">千穗梨衣_lily</h1>
          <p className="text-primary-100 text-sm mt-0.5">她的歌单</p>
          <p className="text-primary-200 text-xs mt-1">
            共 {songCount} 首歌曲
          </p>
        </div>
      </div>
    </div>
  );
}
