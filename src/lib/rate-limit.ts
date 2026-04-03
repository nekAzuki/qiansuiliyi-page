import {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCKOUT_MINUTES,
  LIKE_MAX_PER_IP,
} from '@/lib/constants';

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

export async function checkLoginRateLimit(
  db: D1Database,
  ipHash: string
): Promise<boolean> {
  const cutoff = new Date(Date.now() - LOGIN_LOCKOUT_MINUTES * 60 * 1000).toISOString();

  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM login_attempts
       WHERE ip_hash = ? AND success = 0 AND created_at > ?`
    )
    .bind(ipHash, cutoff)
    .first<{ count: number }>();

  return (result?.count ?? 0) < LOGIN_MAX_ATTEMPTS;
}

export async function recordLoginAttempt(
  db: D1Database,
  ipHash: string,
  success: boolean
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO login_attempts (ip_hash, success, created_at) VALUES (?, ?, ?)`
    )
    .bind(ipHash, success ? 1 : 0, new Date().toISOString())
    .run();
}

export async function checkLikeRateLimit(
  db: D1Database,
  songId: number,
  ipHash: string
): Promise<boolean> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM likes_log
       WHERE song_id = ? AND ip_hash = ? AND created_at > ?`
    )
    .bind(songId, ipHash, cutoff)
    .first<{ count: number }>();

  return (result?.count ?? 0) < LIKE_MAX_PER_IP;
}
