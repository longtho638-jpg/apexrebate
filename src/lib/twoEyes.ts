import crypto from "crypto";

export function validateTwoEyes(
  token: string,
  expectedToken: string
): boolean {
  if (!token || !expectedToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function verifyIdempotencyKey(key: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    key
  );
}
