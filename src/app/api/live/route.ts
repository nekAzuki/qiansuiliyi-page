export const runtime = 'edge';

import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

const BILIBILI_LIVE_API = 'https://api.live.bilibili.com/room/v1/Room/get_info';
const ROOM_ID = '27619512';
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
    const res = await fetch(`${BILIBILI_LIVE_API}?room_id=${ROOM_ID}&_t=${Date.now()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://live.bilibili.com/',
      },
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
        live_status: number;
        title: string;
        user_cover: string;
        room_id: number;
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
        isLive: json.data.live_status === 1,
        title: json.data.title,
        cover: json.data.user_cover,
        url: `https://live.bilibili.com/${json.data.room_id}`,
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
