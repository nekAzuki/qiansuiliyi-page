export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import { parseCSV, csvRowsToSongInputs } from '@/lib/csv';
import type { ApiResponse, SongInput } from '@/types';

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

    const text = await request.text();
    if (!text.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '内容为空' },
        { status: 400 }
      );
    }

    const { headers, rows } = parseCSV(text);
    const songs = csvRowsToSongInputs(headers, rows);

    return NextResponse.json<ApiResponse<SongInput[]>>({
      success: true,
      data: songs,
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '解析失败' },
      { status: 500 }
    );
  }
}
