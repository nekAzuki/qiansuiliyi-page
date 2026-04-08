export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv, getDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import { computePinyin } from '@/lib/pinyin';
import { fetchCoverUrl } from '@/lib/cover-api';
import { MAX_VERSIONS } from '@/lib/constants';
import type { Song, BatchSaveRequest, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const env = getEnv();
    const authed = await authenticateRequest(request, env.JWT_SECRET);
    if (!authed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as BatchSaveRequest;
    const { added = [], updated = [], deleted = [] } = body;

    const db = getDB();

    // Snapshot current songs into song_versions
    const allSongs = await db.prepare('SELECT * FROM songs ORDER BY id').all<Song>();
    const snapshot = JSON.stringify(allSongs.results ?? []);

    // Build summary
    const parts: string[] = [];
    if (added.length > 0) parts.push(`新增 ${added.length} 首`);
    if (updated.length > 0) parts.push(`修改 ${updated.length} 首`);
    if (deleted.length > 0) parts.push(`删除 ${deleted.length} 首`);
    const summary = parts.join('，') || '无变更';

    await db
      .prepare('INSERT INTO song_versions (snapshot, summary) VALUES (?, ?)')
      .bind(snapshot, summary)
      .run();

    // Process added songs — fetch covers in parallel first
    const addedCovers = await Promise.all(
      added.map(async (song) => {
        if (song.cover_url) return song.cover_url;
        try {
          return await fetchCoverUrl(song.song_name, song.artist);
        } catch {
          return '';
        }
      })
    );

    for (let i = 0; i < added.length; i++) {
      const song = added[i];
      const { pinyin: pinyinName, initials: initialsName } = computePinyin(song.song_name);
      const { pinyin: pinyinArtist, initials: initialsArtist } = computePinyin(song.artist);
      const tagsJson = JSON.stringify(song.tags ?? []);

      await db
        .prepare(
          `INSERT INTO songs (song_name, artist, language, tags, cover_url, notes, sort_weight, pinyin_name, pinyin_artist, initials_name, initials_artist)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          song.song_name,
          song.artist,
          song.language,
          tagsJson,
          addedCovers[i],
          song.notes ?? '',
          song.sort_weight ?? 0,
          pinyinName,
          pinyinArtist,
          initialsName,
          initialsArtist
        )
        .run();
    }

    // Process updated songs
    for (const song of updated) {
      const { pinyin: pinyinName, initials: initialsName } = computePinyin(song.song_name);
      const { pinyin: pinyinArtist, initials: initialsArtist } = computePinyin(song.artist);

      const tagsJson = JSON.stringify(song.tags ?? []);

      await db
        .prepare(
          `UPDATE songs SET song_name = ?, artist = ?, language = ?, tags = ?, cover_url = ?, notes = ?, sort_weight = ?,
           pinyin_name = ?, pinyin_artist = ?, initials_name = ?, initials_artist = ?, updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(
          song.song_name,
          song.artist,
          song.language,
          tagsJson,
          song.cover_url ?? '',
          song.notes ?? '',
          song.sort_weight ?? 0,
          pinyinName,
          pinyinArtist,
          initialsName,
          initialsArtist,
          song.id
        )
        .run();
    }

    // Process deleted songs
    if (deleted.length > 0) {
      const placeholders = deleted.map(() => '?').join(',');
      await db
        .prepare(`DELETE FROM songs WHERE id IN (${placeholders})`)
        .bind(...deleted)
        .run();
    }

    // Prune old versions if count > MAX_VERSIONS
    const versionCount = await db
      .prepare('SELECT COUNT(*) as count FROM song_versions')
      .first<{ count: number }>();

    if (versionCount && versionCount.count > MAX_VERSIONS) {
      const excess = versionCount.count - MAX_VERSIONS;
      await db
        .prepare(
          `DELETE FROM song_versions WHERE id IN (SELECT id FROM song_versions ORDER BY created_at ASC LIMIT ?)`
        )
        .bind(excess)
        .run();
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { summary },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
