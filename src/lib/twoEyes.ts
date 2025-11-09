export function checkTwoEyes(req: Request) {
  const token = req.headers.get("x-two-eyes") || "";
  const expected = process.env.TWO_EYES_TOKEN || "";
  return expected && token === expected;
}

export function getIdem(req: Request) {
  return req.headers.get("x-idempotency-key") || "";
}

export function validateTwoEyesHeader(req: Request): { valid: boolean; error?: string } {
  if (!checkTwoEyes(req)) {
    return { valid: false, error: "two_eyes_required" };
  }
  return { valid: true };
}
