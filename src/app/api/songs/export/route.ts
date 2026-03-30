export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv, getDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import { songsToCsvRows, serializeCSV } from '@/lib/csv';
import type { Song, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const env = getEnv();
    const authed = await authenticateRequest(request, env.JWT_SECRET);
    if (!authed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDB();
    const result = await db.prepare('SELECT * FROM songs ORDER BY id').all<Song>();
    const songs = result.results ?? [];

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const isTsv = format === 'tsv';
    const delimiter = isTsv ? '\t' : ',';

    const { headers, rows } = songsToCsvRows(songs);
    const content = serializeCSV(headers, rows, delimiter);

    const contentType = isTsv ? 'text/tab-separated-values' : 'text/csv';
    const extension = isTsv ? 'tsv' : 'csv';
    const filename = `songs_export.${extension}`;

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
