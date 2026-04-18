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
    const res = await fetch(`${BILIBILI_LIVE_API}?mid=${STREAMER_UID}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      // Don't use Cloudflare's fetch cache — always hit Bilibili
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json<ApiResponse<LiveStatus>>(
        { success: true, data: OFFLINE },
        { headers: CACHE_HEADERS }
      );
    }

    const json = await res.json() as {
      code: number;
      data: {
        liveStatus: number;
        title: string;
        cover: string;
        url: string;
        online: number;
      };
    };

    if (json.code !== 0) {
      return NextResponse.json<ApiResponse<LiveStatus>>(
        { success: true, data: OFFLINE },
        { headers: CACHE_HEADERS }
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
  } catch {
    return NextResponse.json<ApiResponse<LiveStatus>>(
      { success: true, data: OFFLINE },
      { headers: CACHE_HEADERS }
    );
  }
}
