import path from "path";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  LIMITS,
  OUTPUT_FORMATS,
} from "@/lib/constants";
import type { OutputFormat } from "@/lib/types";

export function isValidFilename(filename: string): boolean {
  return (
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\") &&
    !filename.includes("\0") &&
    filename.length > 0 &&
    filename.length <= 255
  );
}

export function isAllowedExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function isAllowedOutputFormat(format: string): format is OutputFormat {
  return OUTPUT_FORMATS.has(format);
}

export function isFileSizeAllowed(bytes: number): boolean {
  return bytes <= LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024;
}

export function areDimensionsSafe(
  width: number | undefined,
  height: number | undefined
): boolean {
  return (
    (width ?? 0) <= LIMITS.MAX_DIMENSION_PX &&
    (height ?? 0) <= LIMITS.MAX_DIMENSION_PX
  );
}