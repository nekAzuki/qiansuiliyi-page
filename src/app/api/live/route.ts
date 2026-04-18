export const runtime = 'edge';

import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

const BILIBILI_LIVE_API = 'https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld';
const STREAMER_UID = '279148275';
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' };

export interface LiveStatus {
  isLive: boolean;
  title: string;
  cover: string;
  url: string;
  online: number;
}

const OFFLINE: LiveStatus = { isLive: false, title: '', cover: '', url: '', online: 0 };

export async function GET() {
  try {
    const res = await fetch(`${BILIBILI_LIVE_API}?mid=${STREAMER_UID}&_t=${Date.now()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://live.bilibili.com/',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: true, data: OFFLINE, debug: { error: 'fetch_failed', status: res.status } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const text = await res.text();
    let json: { code: number; data: { liveStatus: number; title: string; cover: string; url: string; online: number } };
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: true, data: OFFLINE, debug: { error: 'json_parse_failed', body: text.slice(0, 200) } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (json.code !== 0) {
      return NextResponse.json(
        { success: true, data: OFFLINE, debug: { error: 'api_error', code: json.code, body: text.slice(0, 200) } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json<ApiResponse<LiveStatus>>({
      success: true,
      data: {
        isLive: json.data.liveStatus === 1,
        title: json.data.title,
        cover: json.data.cover,
        url: json.data.url,
        online: json.data.online,
      },
    }, {
      headers: CACHE_HEADERS,
    });
  } catch (err) {
    return NextResponse.json(
      { success: true, data: OFFLINE, debug: { error: 'exception', message: String(err) } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
