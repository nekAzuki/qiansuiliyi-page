export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv, getDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import type { ApiResponse } from '@/types';

interface VersionListItem {
  id: number;
  summary: string;
  created_at: string;
}

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
    const result = await db
      .prepare('SELECT id, summary, created_at FROM song_versions ORDER BY created_at DESC')
      .all<VersionListItem>();

    return NextResponse.json<ApiResponse<VersionListItem[]>>({
      success: true,
      data: result.results ?? [],
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
