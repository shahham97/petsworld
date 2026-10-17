import sharp from "sharp";
import crypto from "crypto";
import { ProcessedAsset, ProcessedVariant, MediaVariantName, MediaVisibility } from "./types";

/**
 * Validates file signature (magic bytes) to prevent extension spoofing.
 */
export function validateFileSignature(
  buffer: Buffer,
  allowedTypes: ("jpeg" | "png" | "webp" | "avif")[]
): "jpeg" | "png" | "webp" | "avif" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return allowedTypes.includes("jpeg") ? "jpeg" : null;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return allowedTypes.includes("png") ? "png" : null;
  }

  // WebP: RIFF ... WEBP (0-3: 'RIFF', 8-11: 'WEBP')
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return allowedTypes.includes("webp") ? "webp" : null;
  }

  // AVIF: ftypavif or ftypavis at index 4-12
  if (
    buffer.length >= 16 &&
    buffer.toString("ascii", 4, 8) === "ftyp" &&
    (buffer.toString("ascii", 8, 12) === "avif" || buffer.toString("ascii", 8, 12) === "avis")
  ) {
    return allowedTypes.includes("avif") ? "avif" : null;
  }

  return null;
}

/**
 * Image processing pipeline using Sharp:
 * - Strips EXIF metadata
 * - Converts to optimized WebP
 * - Generates thumb, md, lg, and og variants
 * - Generates tiny blurDataUrl placeholder
 */
export async function processImageBuffer(
  rawBuffer: Buffer,
  visibility: MediaVisibility
): Promise<ProcessedAsset> {
  // Validate signature
  const allowedTypes =
    visibility === "PRIVATE"
      ? (["jpeg", "png", "webp"] as const)
      : (["jpeg", "png", "webp", "avif"] as const);

  const detectedFormat = validateFileSignature(rawBuffer, [...allowedTypes]);
  if (!detectedFormat) {
    throw new Error(
      `Unsupported or corrupted image file format. Allowed: ${allowedTypes.join(", ")}`
    );
  }

  // Calculate SHA-256
  const sha256 = crypto.createHash("sha256").update(rawBuffer).digest("hex");

  // Load image with sharp, auto-orient according to EXIF and strip metadata
  const baseImage = sharp(rawBuffer).rotate();
  const metadata = await baseImage.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read image dimensions.");
  }

  // If receipt (PRIVATE), enforce min 300px on the short side
  if (visibility === "PRIVATE") {
    const minDim = Math.min(metadata.width, metadata.height);
    if (minDim < 300) {
      throw new Error("Receipt image must be at least 300 px on its shortest side.");
    }
  }

  // Generate tiny blurDataUrl (approx 20px wide)
  const blurBuffer = await sharp(rawBuffer)
    .rotate()
    .resize(20, undefined, { withoutEnlargement: true })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const variants: ProcessedVariant[] = [];

  if (visibility === "PRIVATE") {
    // Receipts only need 'thumb' (320px) and 'lg' (1600px max)
    const thumbBuf = await sharp(rawBuffer)
      .rotate()
      .resize({ width: 320, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    const thumbMeta = await sharp(thumbBuf).metadata();
    variants.push({
      variantName: "thumb",
      width: thumbMeta.width || 320,
      height: thumbMeta.height || 320,
      byteSize: thumbBuf.length,
      data: thumbBuf,
    });

    const lgBuf = await sharp(rawBuffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();
    const lgMeta = await sharp(lgBuf).metadata();
    variants.push({
      variantName: "lg",
      width: lgMeta.width || metadata.width,
      height: lgMeta.height || metadata.height,
      byteSize: lgBuf.length,
      data: lgBuf,
    });
  } else {
    // PUBLIC images: thumb (320), md (800), lg (1600), og (1200x630 crop)
    const variantConfigs: { name: MediaVariantName; width: number; height?: number; crop?: boolean }[] = [
      { name: "thumb", width: 320 },
      { name: "md", width: 800 },
      { name: "lg", width: 1600 },
      { name: "og", width: 1200, height: 630, crop: true },
    ];

    for (const config of variantConfigs) {
      let transformer = sharp(rawBuffer).rotate();

      if (config.crop && config.height) {
        transformer = transformer.resize(config.width, config.height, {
          fit: "cover",
          position: "center",
        });
      } else {
        transformer = transformer.resize({
          width: config.width,
          withoutEnlargement: true,
        });
      }

      const variantBuffer = await transformer
        .webp({ quality: config.name === "og" ? 80 : 82, effort: 4 })
        .toBuffer();

      const varMeta = await sharp(variantBuffer).metadata();

      variants.push({
        variantName: config.name,
        width: varMeta.width || config.width,
        height: varMeta.height || 0,
        byteSize: variantBuffer.length,
        data: variantBuffer,
      });
    }
  }

  return {
    sha256,
    mimeType: "image/webp",
    width: metadata.width,
    height: metadata.height,
    byteSize: rawBuffer.length,
    blurDataUrl,
    variants,
  };
}
