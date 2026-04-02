export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { searchSongs, SongSearchResult } from '@/lib/cover-api';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const keyword = new URL(request.url).searchParams.get('keyword')?.trim();

    if (!keyword) {
      return NextResponse.json<ApiResponse<SongSearchResult[]>>({
        success: true,
        data: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const results = await searchSongs(keyword, offset, Math.min(limit, 20));

    return NextResponse.json<ApiResponse<SongSearchResult[]>>({
      success: true,
      data: results,
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '搜索失败' },
      { status: 500 }
    );
  }
}
