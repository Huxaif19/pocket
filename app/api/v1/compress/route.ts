/**
 * POST /api/compress
 *
 * Accepts a multipart/form-data upload and returns the compressed
 * image as a binary response with stats in headers.
 *
 * Fields:
 *   image         File     — the image to compress (required)
 *   outputFormat  string   — "webp" | "jpeg" | "png" | "avif"  (default: "webp")
 *   mode          string   — "quality" | "targetSize"           (default: "quality")
 *   quality       number   — 1–100, used when mode="quality"    (default: 80)
 *   targetSizeKb  number   — target KB, used when mode="targetSize"
 *
 * Response headers (on success):
 *   Content-Type            image/{format}
 *   Content-Disposition     attachment; filename="compressed.{format}"
 *   X-Original-Size         bytes
 *   X-Compressed-Size       bytes
 *   X-Saved-Bytes           bytes
 *   X-Saved-Percent         e.g. "72.4"
 *   X-Applied-Quality       1–100
 *   X-Original-Width        px
 *   X-Original-Height       px
 *   X-Original-Format       e.g. "jpeg"
 *   X-RateLimit-Remaining   requests left in window
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { compressByQuality, compressByTargetSize } from "@/helpers/compressor";
import { errorResponse, validationError } from "@/lib/errors";
import { parseCompressRequest } from "@/helpers/parseRequest";
import { checkRateLimit, getClientIp } from "@/helpers/rateLimit";
import { areDimensionsSafe } from "@/helpers/validators";

export async function POST(req: NextRequest) {
  // ── 1. rate limit ──────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);

  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── 2. parse & validate request fields ────────────────────────────────
  const parsed = await parseCompressRequest(req);
  if (!parsed.ok) return parsed.response;
  const { file, options } = parsed;

  // ── 3. read raw bytes — never write to disk before validation ─────────
  let rawBuffer: Buffer;
  try {
    rawBuffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return errorResponse("Failed to read uploaded file", 500);
  }

  // ── 4. deep image validation via sharp ────────────────────────────────
  // Sharp decodes the actual binary — catches files that fake their MIME type
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(rawBuffer, { failOn: "error" }).metadata();
  } catch {
    return validationError("File is not a valid image or is corrupted", "image");
  }

  if (!metadata.format) {
    return validationError("Could not determine image format", "image");
  }

  // ── 5. decompression bomb guard ───────────────────────────────────────
  if (!areDimensionsSafe(metadata.width, metadata.height)) {
    return validationError(
      "Image dimensions are too large. Max 12000px on either side.",
      "image"
    );
  }

  // ── 6. compress ───────────────────────────────────────────────────────
  let compressedBuffer: Buffer;
  let appliedQuality: number;
  let appliedScale: number = 1.0;

  try {
    if (options.mode === "quality") {
      compressedBuffer = await compressByQuality(
        rawBuffer,
        options.outputFormat,
        options.quality!,
        1.0
      );
      appliedQuality = options.quality!;
      appliedScale = 1.0;
    } else {
      const result = await compressByTargetSize(
        rawBuffer,
        options.outputFormat,
        options.targetSizeKb! * 1024
      );
      compressedBuffer = result.buffer;
      appliedQuality = result.appliedQuality;
      appliedScale = result.appliedScale;
    }
  } catch (e) {
    console.error("[compress] Sharp error:", e);
    return errorResponse("Image processing failed", 500);
  }

  // ── 6.5. size enforcer — ensure result <= original ───────────────────
  let finalBuffer = compressedBuffer;
  let finalQuality = appliedQuality;

  const originalBytes = file.size;
  if (finalBuffer.length > originalBytes) {
    // If output format is same as original, just return original buffer
    const isSameFormat = metadata.format === options.outputFormat || 
                         (metadata.format === "jpeg" && options.outputFormat === "jpeg") ||
                         (metadata.format === "png" && options.outputFormat === "png");
    
    if (isSameFormat) {
      finalBuffer = rawBuffer;
      finalQuality = 100; // Original quality is effectively "maximum"
    } else {
      // If formats differ, try one last time at a very low quality (30) 
      // to ensure we at least try to meet the "smaller" requirement.
      try {
        const fallbackBuffer = await compressByQuality(rawBuffer, options.outputFormat, 30);
        if (fallbackBuffer.length < originalBytes) {
          finalBuffer = fallbackBuffer;
          finalQuality = 30;
        }
      } catch {
        // Fallback failed, keep the larger converted one as a last resort 
        // or notify user? Request said "should not be above". 
      }
    }
  }

  // ── 7. stream back directly — no disk write needed ────────────────────
  const compressedBytes = finalBuffer.length;
  const savedBytes = originalBytes - compressedBytes;
  const savedPercent = ((savedBytes / originalBytes) * 100).toFixed(1);

  return new NextResponse(new Uint8Array(finalBuffer), {
    status: 200,
    headers: {
      "Content-Type":        `image/${options.outputFormat}`,
      "Content-Length":      String(compressedBytes),
      "Content-Disposition": `attachment; filename="${file.name.substring(0, file.name.lastIndexOf('.')) || "image"}-compression.${options.outputFormat}"`,
      // Stats the frontend can read without parsing a JSON body
      "X-Original-Size":     String(originalBytes),
      "X-Compressed-Size":   String(compressedBytes),
      "X-Saved-Bytes":       String(savedBytes),
      "X-Saved-Percent":     savedPercent,
      "X-Applied-Quality":   String(finalQuality),
      "X-Applied-Scale":     String(appliedScale),
      "X-Original-Width":    String(metadata.width ?? 0),
      "X-Original-Height":   String(metadata.height ?? 0),
      "X-Original-Format":   metadata.format,
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  });
}

export async function GET() {
  return errorResponse("Method not allowed", 405);
}