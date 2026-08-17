import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX = 4 * 1024 * 1024;

function s3Enabled() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

function getS3() {
  return new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  });
}

export function validateUpload(file: File) {
  if (!ALLOWED.has(file.type)) throw new Error("Solo JPG, PNG o WEBP.");
  if (file.size > MAX) throw new Error("Máximo 4 MB por foto.");
}

export async function storeUpload(file: File, userId: string): Promise<string> {
  validateUpload(file);
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${userId.slice(0, 8)}-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (s3Enabled()) {
    const key = `uploads/${name}`;
    await getS3().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType: file.type,
      }),
    );
    const publicBase = process.env.S3_PUBLIC_URL ?? process.env.S3_ENDPOINT;
    return `${publicBase?.replace(/\/$/, "")}/${key}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

export function storageMode(): "s3" | "local" {
  return s3Enabled() ? "s3" : "local";
}
