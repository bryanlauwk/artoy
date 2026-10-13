import { prepareHero } from "./artwork";
import { heroAction, type QuestState } from "./engine";

export type HeroMotion = { frames: HTMLCanvasElement[]; height: number; width: number };
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
      const clean = prepareHero(cell),
        pixels = clean.getContext("2d")?.getImageData(0, 0, clean.width, clean.height).data;
      if (!pixels || clean.width < 12 || clean.height < 24) return null;
      let filled = 0,
        edge = 0;
      for (let p = 0; p < pixels.length; p += 4) if (pixels[p + 3] > 120) filled++;
      const coverage = filled / (width * height);
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
