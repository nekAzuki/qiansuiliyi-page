export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Only allow proxying from known music CDN domains
  const allowed = [
    'p1.music.126.net',
    'p2.music.126.net',
    'p3.music.126.net',
    'p4.music.126.net',
  ];

  try {
    const parsed = new URL(url);
    if (!allowed.some((d) => parsed.hostname === d)) {
      return new NextResponse('Domain not allowed', { status: 403 });
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch image', { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = res.body;

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch {
    return new NextResponse('Proxy error', { status: 500 });
  }
}
