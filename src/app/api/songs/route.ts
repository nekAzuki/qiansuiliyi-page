export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { PAGE_SIZE } from '@/lib/constants';
import type { Song, ApiResponse, SongListResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const language = searchParams.get('language')?.trim() || '';
    const tagsParam = searchParams.get('tags')?.trim() || '';
    const cursor = searchParams.get('cursor');
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10) || PAGE_SIZE, 1),
      100
    );

    const db = getDB();

    const conditions: string[] = [];
    const bindings: unknown[] = [];

    // Search
    if (q) {
      const hasChinese = /[\u4e00-\u9fff]/.test(q);
      const likeQ = `%${q}%`;

      if (hasChinese) {
        conditions.push('(song_name LIKE ? OR artist LIKE ?)');
        bindings.push(likeQ, likeQ);
      } else {
        conditions.push(
          '(pinyin_name LIKE ? OR pinyin_artist LIKE ? OR initials_name LIKE ? OR initials_artist LIKE ?)'
        );
        bindings.push(likeQ, likeQ, likeQ, likeQ);
      }
    }

    // Language filter
    if (language) {
      if (language === '外语') {
        conditions.push("language != ? AND language != ''");
        bindings.push('国语');
      } else {
        conditions.push('language = ?');
        bindings.push(language);
      }
    }

    // Tags filter
    if (tagsParam) {
      const tags = tagsParam.split(',').map((t) => t.trim()).filter(Boolean);
      for (const tag of tags) {
        conditions.push('tags LIKE ?');
        bindings.push(`%${tag}%`);
      }
    }

    // Cursor pagination
    if (cursor) {
      const cursorId = parseInt(cursor, 10);
      if (!isNaN(cursorId)) {
        conditions.push('id < ?');
        bindings.push(cursorId);
      }
    }

    // Build where clause without cursor for total count
    const filterConditions = conditions.filter((_, i) => {
      // Remove cursor condition (last one if cursor was set)
      return !(cursor && i === conditions.length - 1);
    });
    const filterBindings = cursor ? bindings.slice(0, -1) : [...bindings];

    const filterWhere = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

    // Get total count matching filters (excluding cursor pagination)
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM songs ${filterWhere}`)
      .bind(...filterBindings)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch limit + 1 to determine hasMore
    const sql = `SELECT * FROM songs ${whereClause} ORDER BY created_at DESC, id DESC LIMIT ?`;
    bindings.push(limit + 1);

    const result = await db
      .prepare(sql)
      .bind(...bindings)
      .all<Song>();

    const songs = result.results ?? [];
    const hasMore = songs.length > limit;

    if (hasMore) {
      songs.pop();
    }

    const nextCursor = hasMore && songs.length > 0 ? songs[songs.length - 1].id : undefined;

    return NextResponse.json<ApiResponse<SongListResponse>>({
      success: true,
      data: { songs, hasMore, nextCursor, total },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
