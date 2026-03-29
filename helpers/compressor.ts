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
  let bestBufferPhase1: Buffer | null = null;
  let bestQualityPhase1: number = LIMITS.MIN_QUALITY;
  
  // We track the smallest quality that was too big, to refine it with scale in Phase 2
  let smallestTooBigQ: number | null = null;

  let iterations = 0;
  while (loQ <= hiQ && iterations < LIMITS.TARGET_SIZE_MAX_ITERATIONS) {
    const midQ = Math.round((loQ + hiQ) / 2);
    const candidate = await compressByQuality(buffer, format, midQ, 1.0);

    if (candidate.length <= targetBytes) {
      bestBufferPhase1 = candidate;
      bestQualityPhase1 = midQ;
      loQ = midQ + 1;
    } else {
      smallestTooBigQ = midQ;
      hiQ = midQ - 1;
    }
    iterations++;
  }

  // --- Phase 2: Refine the "Too Big" Quality with Scale ---
  // If we have a quality level that was just slightly too big at 100% scale,
  // we can usually get closer to the target by reducing its scale slightly.
  let bestBufferPhase2: Buffer | null = null;
  let bestQualityPhase2: number = bestQualityPhase1;
  let bestScalePhase2: number = 1.0;

  if (smallestTooBigQ !== null) {
    let loS = 10; // 10%
    let hiS = 99; // 99%
    
    let subIterations = 0;
    while (loS <= hiS && subIterations < 10) { // Hardcoded 10 sub-iterations is plenty for 10-100 range
      const midS = Math.round((loS + hiS) / 2);
      const scale = midS / 100;
      const candidate = await compressByQuality(buffer, format, smallestTooBigQ, scale);

      if (candidate.length <= targetBytes) {
        bestBufferPhase2 = candidate;
        bestQualityPhase2 = smallestTooBigQ;
        bestScalePhase2 = scale;
        loS = midS + 1; // fits — try larger scale
      } else {
        hiS = midS - 1; // too big — try smaller scale
      }
      subIterations++;
    }
  }

  // Determine which phase gave us the better (closer to target) result
  let finalBuffer = bestBufferPhase1;
  let finalQuality = bestQualityPhase1;
  let finalScale = 1.0;

  if (bestBufferPhase2 && (!finalBuffer || bestBufferPhase2.length > finalBuffer.length)) {
    finalBuffer = bestBufferPhase2;
    finalQuality = bestQualityPhase2;
    finalScale = bestScalePhase2;
  }

  // --- Phase 3: Fallback (Search Scale if everything else failed) ---
  if (!finalBuffer) {
    let loS = 10;
    let hiS = 99;
    
    let iterationsP3 = 0;
    while (loS <= hiS && iterationsP3 < LIMITS.TARGET_SIZE_MAX_ITERATIONS) {
      const midS = Math.round((loS + hiS) / 2);
      const scale = midS / 100;
      const candidate = await compressByQuality(buffer, format, LIMITS.MIN_QUALITY, scale);

      if (candidate.length <= targetBytes) {
        finalBuffer = candidate;
        finalQuality = LIMITS.MIN_QUALITY;
        finalScale = scale;
        loS = midS + 1;
      } else {
        hiS = midS - 1;
      }
      iterationsP3++;
    }
  }

  // --- Last Resort ---
  if (!finalBuffer) {
    finalBuffer = await compressByQuality(buffer, format, LIMITS.MIN_QUALITY, 0.1);
    finalQuality = LIMITS.MIN_QUALITY;
    finalScale = 0.1;
  }

  return { 
    buffer: finalBuffer, 
    appliedQuality: finalQuality, 
    appliedScale: finalScale 
  };
}