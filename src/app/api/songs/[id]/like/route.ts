export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { hashIP, checkLikeRateLimit } from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const songId = parseInt(idStr, 10);

    if (isNaN(songId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '无效的歌曲 ID' },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      '0.0.0.0';
    const ipHash = await hashIP(ip);

    const db = getDB();

    const allowed = await checkLikeRateLimit(db, songId, ipHash);
    if (!allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '已达到点赞上限' },
        { status: 429 }
      );
    }

    await db
      .prepare('INSERT INTO likes_log (song_id, ip_hash) VALUES (?, ?)')
      .bind(songId, ipHash)
      .run();

    await db
      .prepare('UPDATE songs SET likes = likes + 1 WHERE id = ?')
      .bind(songId)
      .run();

    const song = await db
      .prepare('SELECT likes FROM songs WHERE id = ?')
      .bind(songId)
      .first<{ likes: number }>();

    return NextResponse.json<ApiResponse<{ likes: number }>>({
      success: true,
      data: { likes: song?.likes ?? 0 },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const songId = parseInt(idStr, 10);

    if (isNaN(songId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '无效的歌曲 ID' },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      '0.0.0.0';
    const ipHash = await hashIP(ip);

    const db = getDB();

    // Remove one like record for this IP
    const existing = await db
      .prepare('SELECT id FROM likes_log WHERE song_id = ? AND ip_hash = ? LIMIT 1')
      .bind(songId, ipHash)
      .first<{ id: number }>();

    if (existing) {
      await db
        .prepare('DELETE FROM likes_log WHERE id = ?')
        .bind(existing.id)
        .run();

      await db
        .prepare('UPDATE songs SET likes = MAX(0, likes - 1) WHERE id = ?')
        .bind(songId)
        .run();
    }

    const song = await db
      .prepare('SELECT likes FROM songs WHERE id = ?')
      .bind(songId)
      .first<{ likes: number }>();

    return NextResponse.json<ApiResponse<{ likes: number }>>({
      success: true,
      data: { likes: song?.likes ?? 0 },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
