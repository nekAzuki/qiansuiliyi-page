import { getRequestContext } from '@cloudflare/next-on-pages';
import type { Env } from '@/types';

export function getEnv(): Env {
  return getRequestContext().env as Env;
}

export function getDB(): D1Database {
  return getEnv().DB;
}
