import sharp from "sharp";
import { LIMITS } from "@/lib/constants";
import type { CompressionResult, OutputFormat } from "@/lib/types";

// ── quality-based compression ─────────────────────────────────────────────

export async function compressByQuality(
  buffer: Buffer,
  format: OutputFormat,
  quality: number,
  scale: number = 1.0
): Promise<Buffer> {
  // .rotate() auto-corrects orientation from EXIF before re-encoding.
  let pipeline = sharp(buffer, { failOn: "error" }).rotate();

  // Apply downscaling if needed
  if (scale < 1.0) {
    const metadata = await pipeline.metadata();
    if (metadata.width && metadata.height) {
      pipeline = pipeline.resize({
        width: Math.round(metadata.width * scale),
        height: Math.round(metadata.height * scale),
        fit: "inside",
      });
    }
  }

  // Apply downscaling if needed

  switch (format) {
    case "webp":
      return pipeline.webp({ quality, effort: 6 }).toBuffer();

    case "avif":
      return pipeline.avif({ quality, effort: 6 }).toBuffer();

    case "jpeg":
      return pipeline
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();

    case "png":
      // Professional PNG optimization using palette-based quantization
      // This is dynamic based on quality (100 = lossless, <100 = indexed colors)
      return pipeline
        .png({
          palette: quality < 100,
          quality: quality,
          compressionLevel: 9,
          effort: 10,
        })
        .toBuffer();

    default:
      return pipeline.webp({ quality }).toBuffer();
  }
}

// ── target-size compression (two-phase search) ──────────────────────────────
//
// Phase 1: Binary search on Quality [MIN, MAX] at 100% scale.
// Phase 2: If target is not met at MIN_QUALITY, binary search on Scale [100%, 10%].

export async function compressByTargetSize(
  buffer: Buffer,
  format: OutputFormat,
  targetBytes: number
): Promise<CompressionResult> {
  // --- Phase 1: Search Quality at 100% Scale ---
  let loQ = LIMITS.MIN_QUALITY;
  let hiQ = LIMITS.MAX_QUALITY;
  let bestBuffer: Buffer | null = null;
  let bestQuality: number = LIMITS.MIN_QUALITY;
  let bestScale: number = 1.0;

  let iterations = 0;
  while (loQ <= hiQ && iterations < LIMITS.TARGET_SIZE_MAX_ITERATIONS) {
    const midQ = Math.round((loQ + hiQ) / 2);
    const candidate = await compressByQuality(buffer, format, midQ, 1.0);

    if (candidate.length <= targetBytes) {
      bestBuffer = candidate;
      bestQuality = midQ;
      loQ = midQ + 1; // fits — try higher quality (bigger file)
    } else {
      hiQ = midQ - 1; // too big — try lower quality (smaller file)
    }
    iterations++;
  }

  // --- Phase 2: Search Scale if target still not met ---
  if (!bestBuffer) {
    let loS = 10; // 10% 
    let hiS = 99; // 99%
    bestQuality = LIMITS.MIN_QUALITY;
    
    // We already know 100% scale at MIN_QUALITY doesn't fit
    iterations = 0;
    while (loS <= hiS && iterations < LIMITS.TARGET_SIZE_MAX_ITERATIONS) {
      const midS = Math.round((loS + hiS) / 2);
      const scale = midS / 100;
      const candidate = await compressByQuality(buffer, format, LIMITS.MIN_QUALITY, scale);

      if (candidate.length <= targetBytes) {
        bestBuffer = candidate;
        bestScale = scale;
        loS = midS + 1; // fits — try larger scale
      } else {
        hiS = midS - 1; // too big — try smaller scale
      }
      iterations++;
    }
  }

  // --- Last Resort ---
  if (!bestBuffer) {
    bestBuffer = await compressByQuality(buffer, format, LIMITS.MIN_QUALITY, 0.1);
    bestQuality = LIMITS.MIN_QUALITY;
    bestScale = 0.1;
  }

  return { 
    buffer: bestBuffer, 
    appliedQuality: bestQuality, 
    appliedScale: bestScale 
  };
}