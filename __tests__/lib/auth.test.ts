import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hashPassword, verifyPassword, createJWT, verifyJWT } from '@/lib/auth';

describe('hashPassword', () => {
  it('returns a hex string', async () => {
    const hash = await hashPassword('testpassword');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns consistent hash for same input', async () => {
    const hash1 = await hashPassword('mypassword');
    const hash2 = await hashPassword('mypassword');
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different inputs', async () => {
    const hash1 = await hashPassword('password1');
    const hash2 = await hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('returns true for correct password', async () => {
    const hash = await hashPassword('correctpassword');
    const result = await verifyPassword('correctpassword', hash);
    expect(result).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('correctpassword');
    const result = await verifyPassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  it('returns false for empty password against non-empty hash', async () => {
    const hash = await hashPassword('somepassword');
    const result = await verifyPassword('', hash);
    expect(result).toBe(false);
  });
});

describe('createJWT', () => {
  const secret = 'test-secret-key';

  it('returns a string with 3 dot-separated parts', async () => {
    const token = await createJWT({ sub: 'user1' }, secret);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
    expect(parts.every((p) => p.length > 0)).toBe(true);
  });

  it('encodes the payload in the token', async () => {
    const token = await createJWT({ sub: 'user1', role: 'admin' }, secret);
    const parts = token.split('.');
    // Decode the payload part (base64url)
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const payload = JSON.parse(atob(base64));
    expect(payload.sub).toBe('user1');
    expect(payload.role).toBe('admin');
    expect(payload.iat).toBeTypeOf('number');
    expect(payload.exp).toBeTypeOf('number');
  });

  it('sets expiry based on expiryHours parameter', async () => {
    const token = await createJWT({ sub: 'user1' }, secret, 2);
    const parts = token.split('.');
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const payload = JSON.parse(atob(base64));
    expect(payload.exp - payload.iat).toBe(2 * 3600);
  });
});

describe('verifyJWT', () => {
  const secret = 'test-secret-key';

  it('verifies a valid token created by createJWT', async () => {
    const token = await createJWT({ sub: 'user1' }, secret);
    const payload = await verifyJWT(token, secret);
    expect(payload).not.toBeNull();
    expect((payload as Record<string, unknown>).sub).toBe('user1');
  });

  it('returns null for a token signed with a different secret', async () => {
    const token = await createJWT({ sub: 'user1' }, secret);
    const payload = await verifyJWT(token, 'wrong-secret');
    expect(payload).toBeNull();
  });

  it('returns null for a tampered token', async () => {
    const token = await createJWT({ sub: 'user1' }, secret);
    // Tamper with the payload by changing a character
    const parts = token.split('.');
    const tampered = parts[0] + '.' + parts[1] + 'x' + '.' + parts[2];
    const payload = await verifyJWT(tampered, secret);
    expect(payload).toBeNull();
  });

  it('returns null for a malformed token (wrong number of parts)', async () => {
    const payload = await verifyJWT('only.two', secret);
    expect(payload).toBeNull();
  });

  it('returns null for an empty string', async () => {
    const payload = await verifyJWT('', secret);
    expect(payload).toBeNull();
  });

  it('returns null for expired tokens', async () => {
    // Create a token that expires in 1 second (1/3600 hours)
    const now = Date.now();
    // Mock Date.now to be in the past when creating, then future when verifying
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const token = await createJWT({ sub: 'user1' }, secret, 1 / 3600);

    // Advance time by 2 seconds (past the 1-second expiry)
    vi.spyOn(Date, 'now').mockReturnValue(now + 2000);
    const payload = await verifyJWT(token, secret);
    expect(payload).toBeNull();

    vi.restoreAllMocks();
  });

  it('returns the full payload including iat and exp', async () => {
    const token = await createJWT({ sub: 'admin', role: 'admin' }, secret);
    const payload = await verifyJWT(token, secret) as Record<string, unknown>;
    expect(payload).not.toBeNull();
    expect(payload.sub).toBe('admin');
    expect(payload.role).toBe('admin');
    expect(payload.iat).toBeTypeOf('number');
    expect(payload.exp).toBeTypeOf('number');
  });
});
