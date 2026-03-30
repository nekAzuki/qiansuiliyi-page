import { verifyJWT } from '@/lib/auth';

export async function authenticateRequest(
  request: Request,
  jwtSecret: string
): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, jwtSecret);
  return payload !== null;
}

export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ success: false, error: 'Unauthorized' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
