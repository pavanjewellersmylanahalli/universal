// Storage abstraction layer
// Backend implementations (S3, R2, Supabase) are swapped here without changing call sites

export interface UploadResult {
  key: string;
  url: string;
  provider: string;
}

export interface StorageService {
  upload(
    buffer: Buffer,
    key: string,
    mimeType: string
  ): Promise<UploadResult>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
