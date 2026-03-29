import type { FormatEnum } from "sharp";

export type OutputFormat = keyof FormatEnum;

export type CompressMode = "quality" | "targetSize";

export interface CompressOptions {
  mode: CompressMode;
  quality?: number;       // 1–100, used when mode = "quality"
  targetSizeKb?: number;  // used when mode = "targetSize"
  outputFormat: OutputFormat;
}

export interface CompressionResult {
  buffer: Buffer;
  appliedQuality: number;
  appliedScale: number;
}