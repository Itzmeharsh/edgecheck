import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const key = process.env.API_KEYS_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "API_KEYS_ENCRYPTION_KEY is not configured."
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      "API_KEYS_ENCRYPTION_KEY must be a 64-character hexadecimal string."
    );
  }

  return Buffer.from(key, "hex");
}

export function encryptApiKey(apiKey: string) {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptApiKey(encryptedValue: string) {
  const key = getEncryptionKey();

  const [ivHex, authTagHex, encryptedHex] =
    encryptedValue.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted API key.");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(
    encryptedHex,
    "hex"
  );

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}