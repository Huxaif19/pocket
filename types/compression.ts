export type CompressionMode = "quality" | "targetSize";
export type OutputFormat = "webp" | "jpeg" | "png" | "avif";

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: string;
  appliedQuality: number;
  appliedScale: number;
  format: string;
}
