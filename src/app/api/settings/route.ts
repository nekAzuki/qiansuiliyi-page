export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv, getDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const db = getDB();
    const result = await db
      .prepare('SELECT key, value FROM site_settings')
      .all<{ key: string; value: string }>();

    const settings: Record<string, string> = {};
    for (const row of result.results ?? []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json<ApiResponse<Record<string, string>>>({
      success: true,
      data: settings,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '获取设置失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const env = getEnv();
    const authed = await authenticateRequest(request, env.JWT_SECRET);
    if (!authed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as Record<string, string>;
    const db = getDB();

    for (const [key, value] of Object.entries(body)) {
      await db
        .prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?')
        .bind(key, value, value)
        .run();
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '保存设置失败' },
      { status: 500 }
    );
  }
}
