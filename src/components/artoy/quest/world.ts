import { prepareHero } from "./artwork";

export type WorldId = "lunarie" | "booboi" | "jaygyii" | "original";
export type WorldIdentity = {
  id: WorldId;
  title: string;
  motif: "signal" | "echo" | "spark" | "original";
  landmarks: readonly [string, string, string];
  relicRow: number | null;
  atmosphere?: string;
};
export type WorldRelics = { tiles: HTMLCanvasElement[] };
export type RelicLayout = "atlas-3x3" | "strip-3x1";

const WORLDS: Record<WorldId, WorldIdentity> = {
  lunarie: {
    id: "lunarie",
    title: "The Midnight Frequency",
    motif: "signal",
    landmarks: ["Echo garden", "Moonwave ruins", "Midnight vault"],
    relicRow: 0,
    atmosphere: "#df54b4",
  },
  booboi: {
    id: "booboi",
    title: "The Lantern Archive",
    motif: "echo",
    landmarks: ["Firefly grove", "Lens observatory", "Lantern hollow"],
    relicRow: 1,
    atmosphere: "#d19938",
  },
  jaygyii: {
    id: "jaygyii",
    title: "The Neon Afterworld",
    motif: "spark",
    landmarks: ["Ember garden", "Spectral spire", "Neon sanctuary"],
    relicRow: 2,
    atmosphere: "#32b6bf",
  },
  original: {
    id: "original",
    title: "The Living Archive",
    motif: "original",
    landmarks: ["Memory grove", "Prism ruins", "Whisper vault"],
    relicRow: null,
  },
};

/** Identity is selected from an explicit sample ID, never inferred from an uploaded filename. */
export function resolveWorldIdentity(id?: string | null, name?: string): WorldIdentity {
  if (id && Object.prototype.hasOwnProperty.call(WORLDS, id)) return WORLDS[id as WorldId];
  return name ? { ...WORLDS.original, title: `${name}’s Living Archive` } : WORLDS.original;
}

/**
 * This registration aligns the illustration's three stone pads with SHRINES.
 * All dynamic props continue to use engine coordinates; do not independently crop the painting.
 */
export const BACKDROP_RECT = { x: 0, y: 29, width: 960, height: 720 } as const;

/** Reject scene strips and malformed sheets; failed relics use the original-art sigil. */
export function prepareRelics(
  image: HTMLImageElement,
  layout: RelicLayout,
  identity: WorldIdentity,
): WorldRelics | null {
  const aspect = image.naturalWidth / image.naturalHeight;
  // Three columns on the gateway's 3:2 canvas; older wide strips remain compatible.
  if (
    layout === "strip-3x1" &&
    !((aspect >= 1.4 && aspect <= 1.6) || (aspect >= 2.5 && aspect <= 4.3))
  )
    return null;
  if (layout === "atlas-3x3" && (aspect < 0.85 || aspect > 1.15 || identity.relicRow === null))
    return null;
  const row = layout === "atlas-3x3" ? identity.relicRow! : 0;
  // The authored atlas has optically centered, uneven rows. These alpha-gap cuts preserve
  // Jaygyii's flame tips and avoid pulling a neighboring relic into a tile.
  const xs = layout === "atlas-3x3" ? [0, 426 / 1254, 828 / 1254, 1] : [0, 1 / 3, 2 / 3, 1];
  const ys = layout === "atlas-3x3" ? [0, 421 / 1254, 808 / 1254, 1] : [0, 1];
  const top = Math.round(ys[row] * image.naturalHeight);
  const height = Math.round(ys[row + 1] * image.naturalHeight) - top;
  if (image.naturalWidth / 3 < 72 || height < 72) return null;
  try {
    const tiles = Array.from({ length: 3 }, (_, column) => {
      const left = Math.round(xs[column] * image.naturalWidth);
      const width = Math.round(xs[column + 1] * image.naturalWidth) - left;
      const cell = document.createElement("canvas");
      cell.width = width;
      cell.height = height;
      const ctx = cell.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(image, left, top, width, height, 0, 0, width, height);
      const raw = ctx.getImageData(0, 0, width, height).data;
      let touched = 0;
      let boundary = 0;
      const check = (pixel: number) => {
        boundary++;
        const offset = pixel * 4;
        if (
          raw[offset + 3] > 30 &&
          !(raw[offset] > 238 && raw[offset + 1] > 238 && raw[offset + 2] > 238)
        )
          touched++;
      };
      for (let x = 0; x < width; x++) {
        check(x);
        check((height - 1) * width + x);
      }
      for (let y = 0; y < height; y++) {
        check(y * width);
        check(y * width + width - 1);
      }
      if (touched / boundary > 0.16) throw new Error("Clipped or opaque relic panel");
      const tile = prepareHero(cell);
      const pixels = tile.getContext("2d")?.getImageData(0, 0, tile.width, tile.height).data;
      if (!pixels) throw new Error("Unreadable relic");
      let opaque = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 30) opaque++;
      const scale = Math.min(1, 512 / Math.max(width, height));
      const coverage = opaque / (width * height * scale * scale);
      if (coverage < 0.015 || coverage > 0.78 || tile.width < 12 || tile.height < 12)
        throw new Error("Empty or full-bleed relic panel");
      return tile;
    });
    return { tiles };
  } catch {
    return null;
  }
}
