import { createHmac, timingSafeEqual } from 'node:crypto';
import { isRole, type Role } from './permissions';

export interface SessionPayload {
  sub: string;
  role: Role;
  /** Expiration en millisecondes depuis l'époque. */
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET absent ou inférieur à 32 caractères');
  }
  return secret;
}

function sign(data: string, key: string): string {
  return createHmac('sha256', key).update(data).digest('base64url');
}

/** Jeton signé HMAC-SHA256 : « corps.signature ». */
export function signSession(payload: SessionPayload, key: string = getSecret()): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body, key)}`;
}

export function verifySession(
  token: string,
  key: string = getSecret(),
  now: number = Date.now(),
): SessionPayload | null {
  const segments = token.split('.');
  if (segments.length !== 2) {
    return null;
  }
  const [body, signature] = segments;
  const expected = Buffer.from(sign(body, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<SessionPayload>;
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }
    if (!isRole(payload.role) || payload.exp <= now) {
      return null;
    }
    return { sub: payload.sub, role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}
