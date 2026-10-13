export type Palette = { primary: string; secondary: string; glow: string; fromArtwork: boolean };
export const DEFAULT_PALETTE: Palette = {
  primary: "#bc87ff",
  secondary: "#f48eaf",
  glow: "#ffe4a3",
  fromArtwork: false,
};
export function extractPalette(image: HTMLImageElement): Palette {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 48;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_PALETTE;
  try {
    ctx.drawImage(image, 0, 0, 48, 48);
    const { data } = ctx.getImageData(0, 0, 48, 48);
    const bins = new Map<string, { n: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = data.slice(i, i + 4);
      if (a < 180 || Math.max(r, g, b) < 65 || Math.max(r, g, b) - Math.min(r, g, b) < 28) continue;
      const key = `${r >> 5},${g >> 5},${b >> 5}`;
      const bin = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      bin.n++;
      bin.r += r;
      bin.g += g;
      bin.b += b;
      bins.set(key, bin);
    }
    const colors = [...bins.values()]
      .sort((a, b) => b.n - a.n)
      .map((c) => [c.r / c.n, c.g / c.n, c.b / c.n]);
    const first = colors[0];
    if (!first) return DEFAULT_PALETTE;
    const second = colors.find((c) => Math.hypot(...c.map((v, i) => v - first[i])) > 85) ?? [
      130, 195, 225,
    ];
    const css = (c: number[]) => `rgb(${c.map((v) => Math.round(v * 0.6 + 100)).join(",")})`;
    return { primary: css(first), secondary: css(second), glow: "#ffe4a3", fromArtwork: true };
  } catch {
    return DEFAULT_PALETTE;
  }
}
/** Remove only a near-white background connected to the edges of the generated single hero. */
export function prepareHero(image: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = "naturalWidth" in image ? image.naturalWidth : image.width;
  const height = "naturalHeight" in image ? image.naturalHeight : image.height;
  const scale = Math.min(1, 512 / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  try {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const w = canvas.width,
      h = canvas.height,
      seen = new Uint8Array(w * h),
      queue: number[] = [];
    let transparentEdge = 0,
      edgeCount = 0;
    const inspectEdge = (p: number) => {
      edgeCount++;
      if (pixels.data[p * 4 + 3] < 10) transparentEdge++;
    };
    for (let x = 0; x < w; x++) {
      inspectEdge(x);
      inspectEdge((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      inspectEdge(y * w);
      inspectEdge(y * w + w - 1);
    }
    // Existing alpha is authoritative: white fur/costume must remain opaque.
    const nativeAlpha = transparentEdge / edgeCount > 0.8;
    const add = (p: number) => {
      if (seen[p]) return;
      seen[p] = 1;
      const i = p * 4;
      if (
        pixels.data[i + 3] < 10 ||
        (!nativeAlpha &&
          pixels.data[i] > 238 &&
          pixels.data[i + 1] > 238 &&
          pixels.data[i + 2] > 238)
      ) {
        queue.push(p);
        pixels.data[i + 3] = 0;
      }
    };
    for (let x = 0; x < w; x++) {
      add(x);
      add((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      add(y * w);
      add(y * w + w - 1);
    }
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i],
        x = p % w,
        y = Math.floor(p / w);
      if (x > 0) add(p - 1);
      if (x < w - 1) add(p + 1);
      if (y > 0) add(p - w);
      if (y < h - 1) add(p + w);
    }
    ctx.putImageData(pixels, 0, 0);
  } catch {
    /* Preserve the image when pixels cannot be read. */
  }
  // Trim transparent margin so every generated character has the same readable on-screen height.
  try {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let left = canvas.width,
      top = canvas.height,
      right = -1,
      bottom = -1;
    for (let y = 0; y < canvas.height; y++)
      for (let x = 0; x < canvas.width; x++) {
        if (data[(y * canvas.width + x) * 4 + 3] < 20) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    if (right >= left && bottom >= top) {
      const trimmed = document.createElement("canvas");
      trimmed.width = right - left + 1;
      trimmed.height = bottom - top + 1;
      trimmed
        .getContext("2d")
        ?.drawImage(
          canvas,
          left,
          top,
          trimmed.width,
          trimmed.height,
          0,
          0,
          trimmed.width,
          trimmed.height,
        );
      return trimmed;
    }
  } catch {
    /* Keep the full asset if trimming is unavailable. */
  }
  return canvas;
}
