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
    // Use a fresh Request object to avoid Cloudflare-to-Cloudflare bot detection
    const req = new Request(`${BILIBILI_API}&_t=${Date.now()}`);
    req.headers.set('Accept', 'application/json');

    const res = await fetch(req);

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { success: true, data: OFFLINE, _debug: { step: 'fetch_failed', status: res.status, body: text.slice(0, 500) } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    let json: {
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

    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: true, data: OFFLINE, _debug: { step: 'json_parse_failed', body: text.slice(0, 500) } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (json.code !== 0) {
      return NextResponse.json(
        { success: true, data: OFFLINE, _debug: { step: 'api_error', code: json.code } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const room = json.data.by_room_ids[ROOM_ID];
    if (!room) {
      return NextResponse.json(
        { success: true, data: OFFLINE, _debug: { step: 'room_not_found', data: JSON.stringify(json.data).slice(0, 500) } },
        { headers: { 'Cache-Control': 'no-store' } }
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
  } catch (err) {
    return NextResponse.json(
      { success: true, data: OFFLINE, _debug: { step: 'exception', err: String(err) } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
