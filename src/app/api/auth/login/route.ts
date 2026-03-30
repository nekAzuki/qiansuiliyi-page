export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getEnv, getDB } from '@/lib/db';
import { verifyPassword, createJWT } from '@/lib/auth';
import { hashIP, checkLoginRateLimit, recordLoginAttempt } from '@/lib/rate-limit';
import type { LoginRequest, ApiResponse, LoginResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest;
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      '0.0.0.0';
    const ipHash = await hashIP(ip);

    const db = getDB();

    const allowed = await checkLoginRateLimit(db, ipHash);
    if (!allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '登录尝试次数过多，请稍后再试' },
        { status: 429 }
      );
    }

    const env = getEnv();

    if (username !== env.ADMIN_USERNAME) {
      await recordLoginAttempt(db, ipHash, false);
      return NextResponse.json<ApiResponse>(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    if (!valid) {
      await recordLoginAttempt(db, ipHash, false);
      return NextResponse.json<ApiResponse>(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    await recordLoginAttempt(db, ipHash, true);

    const token = await createJWT({ sub: username }, env.JWT_SECRET);

    return NextResponse.json<ApiResponse<LoginResponse>>({
      success: true,
      data: { token },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
