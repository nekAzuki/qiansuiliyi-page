-- 歌曲表
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_name TEXT NOT NULL,
  artist TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT '国语',
  tags TEXT DEFAULT '[]',
  cover_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  sort_weight INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  likes INTEGER NOT NULL DEFAULT 0,
  pinyin_name TEXT DEFAULT '',
  pinyin_artist TEXT DEFAULT '',
  initials_name TEXT DEFAULT '',
  initials_artist TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_songs_pinyin_name ON songs(pinyin_name);
CREATE INDEX IF NOT EXISTS idx_songs_pinyin_artist ON songs(pinyin_artist);
CREATE INDEX IF NOT EXISTS idx_songs_initials_name ON songs(initials_name);
CREATE INDEX IF NOT EXISTS idx_songs_initials_artist ON songs(initials_artist);
CREATE INDEX IF NOT EXISTS idx_songs_language ON songs(language);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);

-- 点赞记录表
CREATE TABLE IF NOT EXISTS likes_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_likes_log_song_ip ON likes_log(song_id, ip_hash);

-- 版本快照表
CREATE TABLE IF NOT EXISTS song_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 登录尝试记录表
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_hash, created_at);
