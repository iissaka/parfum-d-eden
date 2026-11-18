import { createHmac, timingSafeEqual } from 'node:crypto';

export const WEBHOOK_TOLERANCE_SECONDS = 300;

/**
 * Vérifie une notification signée : signature = sha256=HMAC(secret, "timestamp.corps").
 * Refuse les notifications trop anciennes (protection contre le rejeu).
 */
export function verifyPaymentSignature(params: {
  secret: string;
  timestamp: string;
  rawBody: string;
  signature: string;
  nowSeconds?: number;
}): boolean {
  const { secret, timestamp, rawBody, signature } = params;
  const nowSeconds = params.nowSeconds ?? Math.floor(Date.now() / 1000);

  const sentAt = Number(timestamp);
  if (!Number.isInteger(sentAt) || Math.abs(nowSeconds - sentAt) > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const givenBuffer = Buffer.from(signature);
  return expectedBuffer.length === givenBuffer.length && timingSafeEqual(expectedBuffer, givenBuffer);
}
