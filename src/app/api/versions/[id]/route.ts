export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv, getDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import { computePinyin } from '@/lib/pinyin';
import type { Song, ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = getEnv();
    const authed = await authenticateRequest(request, env.JWT_SECRET);
    if (!authed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: idStr } = await params;
    const versionId = parseInt(idStr, 10);

    if (isNaN(versionId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '无效的版本 ID' },
        { status: 400 }
      );
    }

    const db = getDB();

    // Fetch the target version's snapshot
    const version = await db
      .prepare('SELECT snapshot FROM song_versions WHERE id = ?')
      .bind(versionId)
      .first<{ snapshot: string }>();

    if (!version) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '版本不存在' },
        { status: 404 }
      );
    }

    const snapshotSongs = JSON.parse(version.snapshot) as Song[];

    // Snapshot current state before rollback
    const currentSongs = await db.prepare('SELECT * FROM songs ORDER BY id').all<Song>();
    const currentSnapshot = JSON.stringify(currentSongs.results ?? []);

    await db
      .prepare('INSERT INTO song_versions (snapshot, summary) VALUES (?, ?)')
      .bind(currentSnapshot, `回滚到版本 #${versionId}`)
      .run();

    // Delete all current songs
    await db.prepare('DELETE FROM songs').run();

    // Insert snapshot songs with fresh pinyin
    for (const song of snapshotSongs) {
      const { pinyin: pinyinName, initials: initialsName } = computePinyin(song.song_name);
      const { pinyin: pinyinArtist, initials: initialsArtist } = computePinyin(song.artist);

      await db
        .prepare(
          `INSERT INTO songs (id, song_name, artist, language, tags, cover_url, notes, sort_weight, created_at, updated_at, likes, pinyin_name, pinyin_artist, initials_name, initials_artist)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          song.id,
          song.song_name,
          song.artist,
          song.language,
          song.tags,
          song.cover_url,
          song.notes,
          song.sort_weight,
          song.created_at,
          song.updated_at,
          song.likes,
          pinyinName,
          pinyinArtist,
          initialsName,
          initialsArtist
        )
        .run();
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { summary: `回滚到版本 #${versionId}` },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
