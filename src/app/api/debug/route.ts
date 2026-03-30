export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/db';

export async function GET() {
  const env = getEnv();
  return NextResponse.json({
    hasUsername: !!env.ADMIN_USERNAME,
    usernameLength: env.ADMIN_USERNAME?.length ?? 0,
    hasPasswordHash: !!env.ADMIN_PASSWORD_HASH,
    passwordHashLength: env.ADMIN_PASSWORD_HASH?.length ?? 0,
    hasJwtSecret: !!env.JWT_SECRET,
    hasDB: !!env.DB,
  });
}
