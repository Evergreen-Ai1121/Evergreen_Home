import COS from "cos-nodejs-sdk-v5";
import crypto from "node:crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_IMAGES = 9;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function cosConfigured(): boolean {
  return Boolean(
    process.env.COS_BUCKET && process.env.COS_REGION && process.env.COS_SECRET_ID && process.env.COS_SECRET_KEY,
  );
}

function client(): COS {
  return new COS({
    SecretId: process.env.COS_SECRET_ID!,
    SecretKey: process.env.COS_SECRET_KEY!,
  });
}

/** 生成直传用的预签名 PUT URL（有效期 15 分钟），永久密钥不下发浏览器 */
export function presignPut(key: string, contentType: string): Promise<{ url: string; publicUrl: string }> {
  return new Promise((resolve, reject) => {
    client().getObjectUrl(
      {
        Bucket: process.env.COS_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Method: "PUT",
        Expires: 900,
        Headers: { "content-type": contentType },
      },
      (err, data) => {
        if (err) return reject(err);
        resolve({ url: data.Url, publicUrl: publicUrlOf(key) });
      },
    );
  });
}

export function publicUrlOf(key: string): string {
  const base = process.env.NEXT_PUBLIC_COS_BASE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  return `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${key}`;
}

export function validateImageType(contentType: string): string | null {
  return ALLOWED_TYPES[contentType] ?? null;
}

export function newImageKey(contentType: string): string {
  const ext = ALLOWED_TYPES[contentType] ?? "bin";
  const now = new Date();
  const ymd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `moments/${ymd}/${crypto.randomUUID()}.${ext}`;
}
