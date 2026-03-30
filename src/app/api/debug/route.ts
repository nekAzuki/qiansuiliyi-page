export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET() {
  const { env } = getRequestContext();
  const keys = Object.keys(env as Record<string, unknown>);
  const info: Record<string, string> = {};
  for (const key of keys) {
    const val = (env as Record<string, unknown>)[key];
    if (typeof val === 'string') {
      info[key] = `string(${val.length})`;
    } else if (typeof val === 'object' && val !== null) {
      info[key] = `object(${val.constructor?.name ?? 'unknown'})`;
    } else {
      info[key] = typeof val;
    }
  }
  return NextResponse.json({ envKeys: keys, envInfo: info });
}
