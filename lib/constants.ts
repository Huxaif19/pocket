export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
]);

export const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".png",
  ".jpeg",
  ".webp",
  ".avif",
  ".gif",
  ".tiff",
]);

export const OUTPUT_FORMATS = new Set([
  "webp",
  "jpeg",
  "png",
  "avif",
]);


export const LIMITS = {
  MAX_FILE_SIZE_MB: 20,
  MAX_DIMENSION_PX: 12000,
  MIN_QUALITY: 1,
  MAX_QUALITY: 100,
  MIN_TARGET_SIZE_KB: 10,
  MAX_TARGET_SIZE_KB: 20 * 1024,
  TARGET_SIZE_MAX_ITERATIONS: 15, // Increased for hybrid search
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 10,
} as const;