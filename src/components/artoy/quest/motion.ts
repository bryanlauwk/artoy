import { prepareHero } from "./artwork";
import { heroAction, type QuestState } from "./engine";

export type HeroMotion = { frames: HTMLCanvasElement[]; height: number; width: number };

/** Detached, aligned dark glyphs outside the body indicate a labelled concept sheet. */
function hasCaptionBand(pixels: Uint8ClampedArray, width: number, height: number): boolean {
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const glyphs: { left: number; right: number; top: number; bottom: number; height: number }[] = [];
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || pixels[start * 4 + 3] < 80) continue;
    let head = 0,
      tail = 1,
      left = width,
      right = 0,
      top = height,
      bottom = 0,
      count = 0,
      dark = 0;
    queue[0] = start;
    seen[start] = 1;
    while (head < tail) {
      const index = queue[head++],
        x = index % width,
        y = Math.floor(index / width),
        p = index * 4;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      count++;
      if (Math.max(pixels[p], pixels[p + 1], pixels[p + 2]) < 125) dark++;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (!seen[next] && pixels[next * 4 + 3] >= 80) {
            seen[next] = 1;
            queue[tail++] = next;
          }
        }
      }
    }
    const glyphHeight = bottom - top + 1,
      glyphWidth = right - left + 1;
    if (
      (top < height * 0.2 || bottom > height * 0.78) &&
      glyphHeight >= Math.max(3, height * 0.012) &&
      glyphHeight <= height * 0.14 &&
      glyphWidth <= width * 0.3 &&
      count >= 5 &&
      dark / count > 0.35
    )
      glyphs.push({ left, right, top, bottom, height: glyphHeight });
  }
  // A few detached details are normal; a row of at least five dark letter-sized
  // components is not a safe playable asset. Reject the whole sheet, preserving
  // the full-body hero fallback instead of cropping off possible body parts.
  return glyphs.some((glyph) => {
    const aligned = glyphs.filter(
      (other) => Math.abs(other.bottom - glyph.bottom) <= Math.max(3, glyph.height * 0.35),
    );
    return (
      aligned.length >= 5 &&
      Math.max(...aligned.map((part) => part.right)) -
        Math.min(...aligned.map((part) => part.left)) >
        width * 0.3
    );
  });
}

/** Contract: one 4-column × 2-row sheet: idle pair, run pair, dash pair, hit/recovery pair. */
export function prepareMotion(image: HTMLImageElement): HeroMotion | null {
  if (image.naturalWidth < 320 || image.naturalHeight < 160) return null;
  const frames: HTMLCanvasElement[] = [];
  const width = Math.floor(image.naturalWidth / 4),
    height = Math.floor(image.naturalHeight / 2);
  try {
    for (let i = 0; i < 8; i++) {
      const cell = document.createElement("canvas");
      cell.width = width;
      cell.height = height;
      const ctx = cell.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(
        image,
        (i % 4) * width,
        Math.floor(i / 4) * height,
        width,
        height,
        0,
        0,
        width,
        height,
      );
      const raw = ctx.getImageData(0, 0, width, height).data;
      let boundary = 0,
        touched = 0;
      const inspect = (pixel: number) => {
        boundary++;
        const p = pixel * 4;
        if (raw[p + 3] > 30 && !(raw[p] > 238 && raw[p + 1] > 238 && raw[p + 2] > 238)) touched++;
      };
      for (let x = 0; x < width; x++) {
        inspect(x);
        inspect((height - 1) * width + x);
      }
      for (let y = 0; y < height; y++) {
        inspect(y * width);
        inspect(y * width + width - 1);
      }
      // Validate the original cell before trimming can hide a clipped body or scene edge.
      if (touched / boundary > 0.16) return null;
      const clean = prepareHero(cell),
        pixels = clean.getContext("2d")?.getImageData(0, 0, clean.width, clean.height).data;
      if (!pixels || clean.width < 12 || clean.height < 24) return null;
      if (hasCaptionBand(pixels, clean.width, clean.height)) return null;
      let filled = 0,
        edge = 0;
      for (let p = 0; p < pixels.length; p += 4) if (pixels[p + 3] > 120) filled++;
      // prepareHero caps a cell's longest side at 512px; compare at the same resolution.
      const scale = Math.min(1, 512 / Math.max(width, height));
      const coverage = filled / (Math.round(width * scale) * Math.round(height * scale));
      // Reject empty cells, opaque scene panels and images that do not contain isolated poses.
      if (coverage < 0.018 || coverage > 0.8) return null;
      for (let x = 0; x < clean.width; x++) {
        if (pixels[x * 4 + 3] > 180) edge++;
        if (pixels[((clean.height - 1) * clean.width + x) * 4 + 3] > 180) edge++;
      }
      if (edge > clean.width * 1.65) return null;
      frames.push(clean);
    }
    const heights = frames.map((frame) => frame.height);
    if (Math.max(...heights) / Math.min(...heights) > 2.2) return null;
    return {
      frames,
      height: Math.max(...heights),
      width: Math.max(...frames.map((frame) => frame.width)),
    };
  } catch {
    return null;
  }
}

export function motionFrame(s: QuestState, reducedMotion = false): number {
  const action = heroAction(s);
  if (reducedMotion) return action === "run" ? 2 : action === "dash" ? 5 : action === "hit" ? 6 : 0;
  if (action === "hit") return s.hitLeft > 0.15 ? 6 : 7;
  if (action === "dash") return s.dashLeft > 0.12 ? 4 : 5;
  if (action === "run") return 2 + (Math.floor(s.motionTime * 8) % 2);
  return s.motionTime % 3.8 > 3.5 ? 1 : 0;
}
