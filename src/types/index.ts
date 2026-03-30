export interface Song {
  id: number;
  song_name: string;
  artist: string;
  language: string;
  tags: string;
  cover_url: string;
  notes: string;
  sort_weight: number;
  created_at: string;
  updated_at: string;
  likes: number;
  pinyin_name: string;
  pinyin_artist: string;
  initials_name: string;
  initials_artist: string;
}

export interface SongInput {
  song_name: string;
  artist: string;
  language: string;
  tags?: string[];
  cover_url?: string;
  notes?: string;
  sort_weight?: number;
}

export interface SongUpdate extends SongInput {
  id: number;
}

export interface BatchSaveRequest {
  added: SongInput[];
  updated: SongUpdate[];
  deleted: number[];
}

export interface SongVersion {
  id: number;
  snapshot: string;
  summary: string;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SongListResponse {
  songs: Song[];
  hasMore: boolean;
  nextCursor?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Env {
  DB: D1Database;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
}
