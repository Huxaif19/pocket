import { NextRequest, NextResponse } from "next/server";
import { LIMITS } from "@/lib/constants";
import { errorResponse, validationError } from "@/lib/errors";
import type { CompressOptions } from "@/lib/types";
import {
  isAllowedExtension,
  isAllowedMimeType,
  isAllowedOutputFormat,
  isFileSizeAllowed,
  isValidFilename,
} from "./validators";

type ParseSuccess = { ok: true; file: File; options: CompressOptions };
type ParseFailure = { ok: false; response: NextResponse };
export type ParseResult = ParseSuccess | ParseFailure;

export async function parseCompressRequest(
  req: NextRequest
): Promise<ParseResult> {
  // ── form data ─────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return { ok: false, response: errorResponse("Invalid multipart form data", 400) };
  }

  // ── file ──────────────────────────────────────
  const file = formData.get("image");
  if (!file || !(file instanceof File)) {
    return {
      ok: false,
      response: validationError("Missing required field: image", "image"),
    };
  }

  if (!isValidFilename(file.name)) {
    return {
      ok: false,
      response: validationError("Invalid filename", "image"),
    };
  }

  if (!isAllowedExtension(file.name)) {
    return {
      ok: false,
      response: validationError(
        `Unsupported file extension. Allowed: .jpg .jpeg .png .webp .avif .gif .tiff`,
        "image"
      ),
    };
  }

  if (!isAllowedMimeType(file.type)) {
    return {
      ok: false,
      response: validationError(
        `Unsupported MIME type "${file.type}"`,
        "image"
      ),
    };
  }

  if (!isFileSizeAllowed(file.size)) {
    return {
      ok: false,
      response: validationError(
        `File too large. Maximum: ${LIMITS.MAX_FILE_SIZE_MB} MB`,
        "image"
      ),
    };
  }

  // ── output format ─────────────────────────────
  const rawFormat = (formData.get("outputFormat") as string | null) ?? "webp";
  if (!isAllowedOutputFormat(rawFormat)) {
    return {
      ok: false,
      response: validationError(
        `Invalid outputFormat. Allowed: webp, jpeg, png, avif`,
        "outputFormat"
      ),
    };
  }

  // ── compression mode ──────────────────────────
  const rawMode = (formData.get("mode") as string | null) ?? "quality";

  if (rawMode === "quality") {
    const rawQuality = formData.get("quality");
    const quality = rawQuality !== null ? Number(rawQuality) : 80;

    if (
      !Number.isInteger(quality) ||
      quality < LIMITS.MIN_QUALITY ||
      quality > LIMITS.MAX_QUALITY
    ) {
      return {
        ok: false,
        response: validationError(
          `quality must be an integer between ${LIMITS.MIN_QUALITY} and ${LIMITS.MAX_QUALITY}`,
          "quality"
        ),
      };
    }

    return {
      ok: true,
      file,
      options: { mode: "quality", quality, outputFormat: rawFormat },
    };
  }

  if (rawMode === "targetSize") {
    const rawTarget = formData.get("targetSizeKb");
    const targetSizeKb = rawTarget !== null ? Number(rawTarget) : null;

    if (
      targetSizeKb === null ||
      isNaN(targetSizeKb) ||
      targetSizeKb < LIMITS.MIN_TARGET_SIZE_KB ||
      targetSizeKb > LIMITS.MAX_TARGET_SIZE_KB
    ) {
      return {
        ok: false,
        response: validationError(
          `targetSizeKb must be between ${LIMITS.MIN_TARGET_SIZE_KB} and ${LIMITS.MAX_TARGET_SIZE_KB}`,
          "targetSizeKb"
        ),
      };
    }

    return {
      ok: true,
      file,
      options: { mode: "targetSize", targetSizeKb, outputFormat: rawFormat },
    };
  }

  return {
    ok: false,
    response: validationError('mode must be "quality" or "targetSize"', "mode"),
  };
}