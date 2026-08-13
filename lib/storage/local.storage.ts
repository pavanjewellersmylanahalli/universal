import fs from "fs/promises";
import path from "path";
import type { StorageService, UploadResult } from "./storage.interface";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Local disk storage — for development only.
 * Replace with S3/R2 implementation in production via STORAGE_PROVIDER env.
 */
export class LocalStorageService implements StorageService {
  async upload(buffer: Buffer, key: string, _mimeType: string): Promise<UploadResult> {
    const fullPath = path.join(UPLOAD_DIR, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return {
      key,
      url: `/api/files/${key}`,
      provider: "local",
    };
  }

  async getSignedUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    return `/api/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, key);
    await fs.unlink(fullPath).catch(() => {});
  }
}

// Singleton
let _storage: StorageService | null = null;

export function getStorage(): StorageService {
  if (!_storage) {
    // TODO Phase 14: swap to S3StorageService when STORAGE_PROVIDER=s3
    _storage = new LocalStorageService();
  }
  return _storage;
}
