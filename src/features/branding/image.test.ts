// Actual raster decoding is tested in the Node runtime, not simulated browser codecs.
// @vitest-environment node
import { expect, it } from "vitest";
import sharp from "sharp";
import { optimizeBackground, limitedRequestBody } from "./image";
async function png(width = 1280, height = 720) {
  return sharp({
    create: { width, height, channels: 3, background: "#087c57" },
  })
    .png()
    .toBuffer();
}
it("decodes and normalizes an allowed raster to metadata-free WebP", async () => {
  const out = await optimizeBackground(await png(2048, 1152), "image/png");
  const meta = await sharp(out).metadata();
  expect(meta.format).toBe("webp");
  expect(meta.width).toBe(1920);
  expect(meta.height).toBe(1080);
  expect(meta.exif).toBeUndefined();
});
it("rejects MIME spoofing and active image formats", async () => {
  await expect(optimizeBackground(await png(), "image/jpeg")).rejects.toThrow(
    "Invalid",
  );
  await expect(
    optimizeBackground(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"></svg>',
      ),
      "image/png",
    ),
  ).rejects.toThrow("Invalid");
});
it("rejects undersized dimensions, oversized bytes and invalid crops", async () => {
  await expect(
    optimizeBackground(await png(1000, 720), "image/png"),
  ).rejects.toThrow("dimensions");
  await expect(
    optimizeBackground(new Uint8Array(5 * 1024 * 1024 + 1), "image/png"),
  ).rejects.toThrow("5 MB");
  await expect(
    optimizeBackground(await png(), "image/png", {
      x: 0,
      y: 0,
      width: 0.5,
      height: 1,
    }),
  ).rejects.toThrow("retain");
});
it("bounds streamed multipart data even without a content-length", async () => {
  await expect(
    limitedRequestBody(
      new Request("https://example.test", {
        method: "POST",
        body: new Uint8Array(101),
      }),
      100,
    ),
  ).rejects.toThrow("limit");
});
