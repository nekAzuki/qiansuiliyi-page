export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const db = getDB();
    const result = await db
      .prepare('SELECT tags FROM songs')
      .all<{ tags: string }>();

    const rows = result.results ?? [];
    const tagSet = new Set<string>();

    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.tags);
        if (Array.isArray(parsed)) {
          for (const tag of parsed) {
            if (typeof tag === 'string' && tag.trim()) {
              tagSet.add(tag.trim());
            }
          }
        }
      } catch {
        // skip malformed tags
      }
    }

    const tags = Array.from(tagSet).sort();

    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: tags,
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
