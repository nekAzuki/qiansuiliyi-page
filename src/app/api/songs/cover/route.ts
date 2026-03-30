export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { fetchCoverUrl } from '@/lib/cover-api';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name')?.trim() || '';
    const artist = searchParams.get('artist')?.trim() || '';

    if (!name && !artist) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '请提供歌曲名称或歌手' },
        { status: 400 }
      );
    }

    const url = await fetchCoverUrl(name, artist);

    return NextResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '获取封面失败' },
      { status: 500 }
    );
  }
}
