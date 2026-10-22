import sharp from "sharp";
import { cropSchema, MAX_BACKGROUND_BYTES } from "./model";
const formats = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
export async function optimizeBackground(
  bytes: Uint8Array,
  mime: string,
  cropInput?: unknown,
) {
  if (!bytes.length || bytes.length > MAX_BACKGROUND_BYTES)
    throw new Error("Background must be at most 5 MB");
  if (!Object.hasOwn(formats, mime))
    throw new Error("Only JPG, PNG and WebP are supported");
  // Reject active/vector/container formats before invoking any decoder.
  const magic =
    mime === "image/png"
      ? bytes.length >= 8 &&
        [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
      : mime === "image/jpeg"
        ? bytes.length >= 3 &&
          bytes[0] === 255 &&
          bytes[1] === 216 &&
          bytes[2] === 255
        : bytes.length >= 12 &&
          String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
          String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!magic) throw new Error("Invalid raster signature");
  const decoder = sharp(bytes, {
    failOn: "error",
    limitInputPixels: 4096 * 4096,
    animated: false,
  });
  const meta = await decoder.metadata();
  if (
    meta.format !== formats[mime as keyof typeof formats] ||
    (meta.pages ?? 1) !== 1
  )
    throw new Error("Invalid or animated image");
  const swap = meta.orientation !== undefined && meta.orientation >= 5;
  const width = (swap ? meta.height : meta.width) ?? 0,
    height = (swap ? meta.width : meta.height) ?? 0;
  if (width < 1280 || height < 720 || width > 4096 || height > 4096)
    throw new Error(
      "Image dimensions must be 1280×720 through 4096×4096 pixels",
    );
  let pipeline = decoder.rotate();
  if (cropInput !== undefined) {
    const crop = cropSchema.parse(cropInput);
    const region = {
      left: Math.floor(crop.x * width),
      top: Math.floor(crop.y * height),
      width: Math.floor(crop.width * width),
      height: Math.floor(crop.height * height),
    };
    if (region.width < 1280 || region.height < 720)
      throw new Error("Cropped image must retain at least 1280×720 pixels");
    pipeline = pipeline.extract(region);
  }
  // A full decode and re-encode strips metadata and rejects malformed raster payloads.
  const output = await pipeline
    .resize({
      width: 1920,
      height: 1080,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
  if (output.length > MAX_BACKGROUND_BYTES)
    throw new Error("Optimized image exceeds the storage limit");
  return output;
}
export async function limitedRequestBody(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing upload body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Upload exceeds request limit");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of chunks) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
