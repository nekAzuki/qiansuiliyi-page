export const runtime = 'edge';

import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

const ROOM_ID = '27619512';
const BILIBILI_API = `https://api.live.bilibili.com/xlive/web-room/v1/index/getRoomBaseInfo?room_ids=${ROOM_ID}&req_biz=link-center`;
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' };

export interface LiveStatus {
  isLive: boolean;
  title: string;
  cover: string;
  url: string;
  online: number;
}

const OFFLINE: LiveStatus = { isLive: false, title: '', cover: '', url: `https://live.bilibili.com/${ROOM_ID}`, online: 0 };

export async function GET() {
  try {
    const req = new Request(`${BILIBILI_API}&_t=${Date.now()}`);
    req.headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    req.headers.set('Referer', 'https://live.bilibili.com/');
    req.headers.set('Accept', 'application/json');

    const res = await fetch(req);

    if (!res.ok) {
      return NextResponse.json<ApiResponse<LiveStatus>>(
        { success: true, data: OFFLINE },
        { headers: CACHE_HEADERS }
      );
    }

    const json = await res.json() as {
      code: number;
      data: {
        by_room_ids: Record<string, {
          live_status: number;
          title: string;
          cover: string;
          room_id: number;
          online: number;
        }>;
      };
    };

    if (json.code !== 0) {
      return NextResponse.json<ApiResponse<LiveStatus>>(
        { success: true, data: OFFLINE },
        { headers: CACHE_HEADERS }
      );
    }

    const room = json.data.by_room_ids[ROOM_ID];
    if (!room) {
      return NextResponse.json<ApiResponse<LiveStatus>>(
        { success: true, data: OFFLINE },
        { headers: CACHE_HEADERS }
      );
    }

    return NextResponse.json<ApiResponse<LiveStatus>>({
      success: true,
      data: {
        isLive: room.live_status === 1,
        title: room.title || '',
        cover: room.cover || '',
        url: `https://live.bilibili.com/${ROOM_ID}`,
        online: room.online || 0,
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
