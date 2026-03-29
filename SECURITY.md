# 🛡️ Security & Abuse Prevention - Pocket Image Optimizer

Pocket was built with "Security-First" processing. We treat every image as untrusted data until it has been safely sanitized and re-encoded.

## 1. Binary Image Validation
We do not trust file extensions or MIME-type strings provided by the client. Every upload is decoded by `sharp` (using libvips). If the file is not a valid image binary, it is rejected immediately before any computation or storage occurs.

## 2. Infrastructure Protection (Anti-Abuse)
To protect our servers from resource exhaustion (CPU/RAM), we enforce strict hard-coded limits:
- **Max File Size**: 20MB (pre-calculates `Content-Length` for early rejection).
- **Max Dimensions**: 12,000px on either side. This prevents "Decompression Bomb" attacks that expand tiny files into Gigabytes of RAM.
- **Rate Limiting**: 10 requests per minute per IP, with spoof-proof detection of client identity.

## 3. Mandatory Metadata Stripping
All EXIF, IPTC, and XMP metadata (including GPS data, camera serial numbers, and creator names) are stripped by default during the re-encoding process. This ensures that privacy is maintained for all compressed exports.

## 4. Payloads & Polyglots
By re-encoding every image into a new buffer, we effectively neutralize polyglot attacks (where malicious code is hidden inside image bytes). Even if a file contains a hidden script or an XSS payload in a comment, it is destroyed when the pixels are re-mapped to a new file format.

## 5. Security Headers
The platform is protected by strict global security headers deployed via **[proxy.ts](file:///d:/pocket/proxy.ts)**:
- **X-Content-Type-Options: nosniff**
- **X-Frame-Options: DENY**
- **Strict-Transport-Security: HSTS**
- **Content-Security-Policy: Strict**
