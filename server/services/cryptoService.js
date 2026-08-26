import crypto from "node:crypto";

/**
 * Secrets at rest (webhook secrets, GitHub tokens) are encrypted with
 * AES-256-GCM. The key is derived from APP_ENCRYPTION_KEY, falling back to a
 * SHA-256 hash of JWT_SECRET so local development works without extra setup.
 */
function getEncryptionKey() {
  const raw =
    process.env.APP_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "matrix-dev-insecure-key";
  return crypto.createHash("sha256").update(raw).digest(); // 32 bytes
}

const PREFIX = "v1";

export function encryptSecret(plaintext) {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: v1.<iv>.<authTag>.<ciphertext> (all base64url)
  return [
    PREFIX,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptSecret(payload) {
  if (!payload) return null;
  try {
    const [version, ivB64, tagB64, dataB64] = String(payload).split(".");
    if (version !== PREFIX || !ivB64 || !tagB64 || !dataB64) return null;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivB64, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64url")),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  } catch {
    // Wrong key or tampered payload.
    return null;
  }
}

/** Fresh per-repository webhook shared secret. */
export function generateWebhookSecret() {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Verify GitHub's X-Hub-Signature-256 header against the raw request body.
 * Uses timing-safe comparison; returns true only on exact match.
 */
export function verifyGithubSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret || !rawBody) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(String(signatureHeader));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
