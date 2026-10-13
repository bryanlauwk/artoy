import {
  HEIGHT,
  WIDTH,
  LAND,
  ROCKS,
  SHRINES,
  SPARKS,
  PORTAL,
  PATROLS,
  patrolPosition,
  distance,
  type QuestState,
} from "./engine";
import { motionFrame, type HeroMotion } from "./motion";
import type { Palette } from "./artwork";
import { BACKDROP_RECT, resolveWorldIdentity, type WorldIdentity, type WorldRelics } from "./world";

type Assets = {
  original: HTMLImageElement | null;
  hero: HTMLCanvasElement | null;
  motion?: HeroMotion | null;
  backdrop?: HTMLImageElement | null;
  identity?: WorldIdentity;
  relics?: WorldRelics | null;
  palette: Palette;
  name: string;
  reducedMotion: boolean;
};
const TAU = Math.PI * 2;
function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
}
function landPath(ctx: CanvasRenderingContext2D, offset = 0) {
  ctx.beginPath();
  LAND.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y + offset) : ctx.lineTo(p.x, p.y + offset)));
  ctx.closePath();
}
function star(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  angle = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(2, -2, r, 0);
  ctx.quadraticCurveTo(2, 2, 0, r);
  ctx.quadraticCurveTo(-2, 2, -r, 0);
  ctx.quadraticCurveTo(-2, -2, 0, -r);
  ctx.fill();
  ctx.restore();
}
function crystal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.5, -size * 0.35);
  ctx.lineTo(size * 0.35, size * 0.5);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.45, size * 0.5);
  ctx.lineTo(-size * 0.5, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff66";
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.5, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function tree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ellipse(ctx, x + 4, y + 5, size * 0.6, size * 0.24, "#10273588");
  ctx.strokeStyle = "#6c6577";
  ctx.lineWidth = size * 0.14;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - size * 0.8);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4,
      xx = x + Math.cos(a) * size * 0.4,
      yy = y - size * 1.2 + Math.sin(a) * size * 0.4;
    ellipse(ctx, xx + 2, yy + 5, size * 0.43, size * 0.5, "#243e4a");
    const leaves = ctx.createRadialGradient(xx - 5, yy - 8, 2, xx, yy, size * 0.6);
    leaves.addColorStop(0, color);
    leaves.addColorStop(1, "#47685d");
    ctx.fillStyle = leaves;
    ctx.beginPath();
    ctx.ellipse(xx, yy, size * 0.44, size * 0.5, 0, 0, TAU);
    ctx.fill();
    ellipse(ctx, xx - size * 0.1, yy - size * 0.19, size * 0.12, size * 0.07, "#ffffff22");
  }
  star(ctx, x + size * 0.28, y - size * 1.42, 3, "#fff5d0");
}
function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = "#e4eef5",
  size = 11,
) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Inter, DejaVu Sans, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

function contain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const iw = "naturalWidth" in image ? image.naturalWidth : image.width;
  const ih = "naturalHeight" in image ? image.naturalHeight : image.height;
  const scale = Math.min(width / iw, height / ih);
  ctx.drawImage(image, x - (iw * scale) / 2, y - (ih * scale) / 2, iw * scale, ih * scale);
}

function sigil(
  ctx: CanvasRenderingContext2D,
  identity: WorldIdentity,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.3, size * 0.09);
  ctx.lineCap = "round";
  if (identity.motif === "signal") {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.65, Math.PI, 0);
    ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.roundRect(side * size * 0.6 - size * 0.12, -size * 0.06, size * 0.24, size * 0.6, 3);
      ctx.fill();
    }
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size * 0.23, -size * (i === 0 ? 0.2 : 0.05));
      ctx.lineTo(i * size * 0.23, size * (i === 0 ? 0.6 : 0.43));
      ctx.stroke();
    }
  } else if (identity.motif === "echo") {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.72, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6;
      const x = Math.cos(a) * size * 0.42;
      const y = Math.sin(a) * size * 0.42;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * size * 0.42, Math.sin(a) * size * 0.42);
      ctx.lineTo(Math.cos(a + 0.7) * size * 0.72, Math.sin(a + 0.7) * size * 0.72);
      ctx.stroke();
    }
  } else if (identity.motif === "spark") {
    ctx.beginPath();
    ctx.moveTo(-size * 0.68, size * 0.12);
    ctx.lineTo(-size * 0.7, -size * 0.66);
    ctx.lineTo(-size * 0.2, -size * 0.27);
    ctx.quadraticCurveTo(0, -size * 0.4, size * 0.2, -size * 0.27);
    ctx.lineTo(size * 0.7, -size * 0.66);
    ctx.lineTo(size * 0.68, size * 0.12);
    ctx.quadraticCurveTo(0, size * 1.1, -size * 0.68, size * 0.12);
    ctx.stroke();
    for (const side of [-1, 1])
      ellipse(ctx, side * size * 0.28, size * 0.02, size * 0.11, size * 0.18, color);
  } else {
    star(ctx, 0, 0, size * 0.8, color);
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function relic(
  ctx: CanvasRenderingContext2D,
  assets: Assets,
  identity: WorldIdentity,
  column: number,
  x: number,
  y: number,
  width: number,
  height = width,
) {
  const tile = assets.relics?.tiles[column];
  if (tile) contain(ctx, tile, x, y, width, height);
  else if (identity.id === "original" && assets.original) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x - width * 0.32, y - height * 0.32, width * 0.64, height * 0.64, 5);
    ctx.clip();
    contain(ctx, assets.original, x, y, width * 0.62, height * 0.62);
    ctx.restore();
  } else sigil(ctx, identity, x, y, width * 0.28, assets.palette.glow);
}

function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = alpha;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}
export function renderQuest(
  ctx: CanvasRenderingContext2D,
  s: QuestState,
  assets: Assets,
  clock: number,
) {
  const { palette: p, original, name } = assets;
  const identity = assets.identity ?? resolveWorldIdentity();
  const hero = assets.motion?.frames[motionFrame(s, assets.reducedMotion)] ?? assets.hero;
  const t = assets.reducedMotion ? 0 : clock;
  const active = s.phase === "playing";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#0d1025";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (assets.backdrop) {
    ctx.drawImage(
      assets.backdrop,
      BACKDROP_RECT.x,
      BACKDROP_RECT.y,
      BACKDROP_RECT.width,
      BACKDROP_RECT.height,
    );
    // Transfer the artwork's hue into the painting while preserving its authored lighting.
    ctx.save();
    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = identity.id === "lunarie" ? 0.25 : identity.id === "original" ? 0.48 : 0.65;
    ctx.fillStyle = identity.atmosphere ?? p.primary;
    ctx.fillRect(0, BACKDROP_RECT.y, WIDTH, HEIGHT);
    ctx.restore();
  } else {
    const sky = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    sky.addColorStop(0, "#090e25");
    sky.addColorStop(0.5, "#1d203e");
    sky.addColorStop(1, "#102b37");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // A luminous sky and distant floating islands establish depth before the playable plane.
    ctx.save();
    ctx.globalAlpha = 0.11;
    ellipse(ctx, 488, 160, 360, 210, p.primary);
    ctx.restore();
    ellipse(ctx, 813, 98, 32, 32, "#c7d9f2");
    ellipse(ctx, 824, 87, 28, 28, "#18213b");
    for (let i = 0; i < 52; i++) {
      const x = (i * 173 + 21) % WIDTH,
        y = (i * 97 + 13) % HEIGHT;
      ctx.globalAlpha = 0.25 + (Math.sin(t * 0.7 + i) + 1) * 0.15;
      star(ctx, x, y, i % 7 === 0 ? 3 : 1.3, "#e0e8ff");
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const x = [65, 904, 150, 850, 70, 840][i];
      const y = [137, 172, 592, 567, 510, 54][i] + Math.sin(t * 0.3 + i) * 4;
      ellipse(ctx, x, y + 13, 39, 15, "#142735");
      ellipse(ctx, x, y, 49, 15, "#395865");
      crystal(ctx, x - 7, y - 16, 17, i % 2 ? p.secondary : p.primary);
    }
    // Island side facets and a fine top rim; the polygon is also the exact movement boundary.
    landPath(ctx, 24);
    ctx.fillStyle = "#121e32";
    ctx.fill();
    for (let i = 0; i < LAND.length - 1; i++) {
      const a = LAND[i],
        b = LAND[i + 1];
      if (b.x >= a.x) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 24);
      ctx.lineTo(a.x, a.y + 24);
      ctx.fillStyle = i % 2 ? "#29414d" : "#1f3345";
      ctx.fill();
    }
    landPath(ctx);
    const ground = ctx.createLinearGradient(0, 110, 0, 600);
    ground.addColorStop(0, "#344456");
    ground.addColorStop(0.5, "#2f4a50");
    ground.addColorStop(1, "#233b49");
    ctx.fillStyle = ground;
    ctx.fill();
    ctx.strokeStyle = "#87bab066";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    landPath(ctx);
    ctx.clip();
    for (const [x, y, color] of [
      [205, 350, "#98b67a55"],
      [515, 207, "#b3b6bb44"],
      [762, 357, "#a38ab755"],
    ] as const) {
      const shade = ctx.createRadialGradient(x, y, 8, x, y, 150);
      shade.addColorStop(0, color);
      shade.addColorStop(1, "transparent");
      ctx.fillStyle = shade;
      ctx.fillRect(x - 150, y - 150, 300, 300);
    }
    // Three readable routes radiate from the home portal; paving is visual rather than a maze.
    for (const shrine of SHRINES) {
      ctx.strokeStyle = "#d6c8a630";
      ctx.lineWidth = 39;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(PORTAL.x, PORTAL.y - 20);
      ctx.quadraticCurveTo((PORTAL.x + shrine.x) / 2, shrine.y + 45, shrine.x, shrine.y);
      ctx.stroke();
      ctx.strokeStyle = "#e3d5b021";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 16]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    for (let i = 0; i < 120; i++) {
      const x = 95 + ((i * 73) % 790),
        y = 125 + ((i * 113) % 470);
      ctx.strokeStyle = i % 3 ? "#8eb29b44" : "#c0d1b555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2, y - 5);
      ctx.lineTo(x + 4, y);
      ctx.stroke();
      if (i % 9 === 0) {
        ellipse(ctx, x + 2, y - 5, 2, 2, p.secondary);
      }
    }
    ctx.restore();
    // Small authored environmental details give each landmark a different character.
    for (let i = 0; i < 15; i++) {
      const a = i * 2.4,
        x = 208 + Math.cos(a) * (60 + i * 2),
        y = 365 + Math.sin(a) * (45 + i);
      ctx.strokeStyle = "#8cb292";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 7);
      ctx.lineTo(x, y - 5);
      ctx.stroke();
      for (let j = 0; j < 5; j++)
        ellipse(
          ctx,
          x + Math.cos((j * TAU) / 5) * 4,
          y - 5 + Math.sin((j * TAU) / 5) * 4,
          3.5,
          3,
          p.secondary,
        );
      ellipse(ctx, x, y - 5, 2.5, 2.5, p.glow);
    }
    for (const x of [420, 603]) {
      ellipse(ctx, x, 168, 16, 7, "#10273566");
      ctx.fillStyle = "#536779";
      ctx.fillRect(x - 10, 123, 20, 39);
      ctx.fillStyle = "#9caaa8";
      ctx.fillRect(x - 15, 121, 30, 9);
      ctx.fillRect(x - 13, 158, 26, 8);
      ctx.fillStyle = "#ffffff22";
      ctx.fillRect(x - 8, 131, 4, 25);
      crystal(ctx, x, 109, 12, p.primary);
    }
    for (let i = 0; i < 8; i++) {
      const x = 404 + i * 30,
        y = 278 + Math.sin(i) * 8;
      ctx.fillStyle = "#b7b2a630";
      ctx.beginPath();
      ctx.roundRect(x, y, 18, 6, 2);
      ctx.fill();
    }
    for (const [x, y] of [
      [719, 272],
      [817, 324],
      [800, 459],
    ]) {
      ellipse(ctx, x, y + 7, 18, 7, "#10273577");
      ctx.fillStyle = "#554963";
      ctx.beginPath();
      ctx.roundRect(x - 12, y - 29, 24, 36, 5);
      ctx.fill();
      ctx.strokeStyle = p.primary;
      ctx.lineWidth = 1;
      ctx.stroke();
      star(ctx, x, y - 13, 6, p.secondary);
      ctx.strokeStyle = "#a7a1be";
      ctx.beginPath();
      ctx.moveTo(x, y - 29);
      ctx.lineTo(x, y - 43);
      ctx.stroke();
      ellipse(ctx, x, y - 43, 3, 3, p.glow);
    }
    for (const [x, y] of [
      [167, 523],
      [798, 502],
      [588, 589],
    ]) {
      ctx.strokeStyle = "#66967a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - 4, y + 15, x + 10, y + 33, x + 2, y + 43);
      ctx.stroke();
      for (let i = 0; i < 4; i++)
        ellipse(ctx, x + (i % 2 ? 5 : -4), y + i * 10 + 8, 5, 2.5, "#8aae89");
    }
    // Stationary props occupy the edge; only the four central rocks block the player.
    for (const [x, y, z] of [
      [139, 302, 32],
      [129, 419, 30],
      [258, 292, 36],
      [283, 516, 24],
      [839, 415, 31],
      [810, 286, 29],
      [580, 138, 25],
    ])
      tree(ctx, x, y, z, x < 300 ? "#93a790" : p.secondary);
  }
  const recovered = s.fragments.filter(Boolean).length;
  const open = recovered === 3;
  // Character marks are embedded in the paths and relics, while painted stone stays visible.
  ctx.save();
  landPath(ctx);
  ctx.clip();
  SHRINES.forEach((shrine, index) => {
    const restored = s.fragments[index];
    const radius = restored ? 156 : 94;
    glow(
      ctx,
      shrine.x,
      shrine.y - 15,
      radius,
      index === 1 ? p.secondary : p.primary,
      restored ? 0.34 : 0.11,
    );
    ctx.save();
    ctx.strokeStyle = restored ? p.glow : p.primary;
    ctx.globalAlpha = restored ? 0.55 : 0.12;
    ctx.shadowColor = p.primary;
    ctx.shadowBlur = restored ? 12 : 0;
    ctx.lineWidth = restored ? 2.3 : 1;
    ctx.beginPath();
    ctx.moveTo(PORTAL.x, PORTAL.y);
    const controlX = (PORTAL.x + shrine.x) / 2;
    const controlY = shrine.y + 45;
    ctx.quadraticCurveTo(controlX, controlY, shrine.x, shrine.y);
    ctx.stroke();
    if (restored && !assets.reducedMotion) {
      for (let i = 0; i < 3; i++) {
        const f = (t * 0.2 + i / 3) % 1;
        const x = (1 - f) ** 2 * shrine.x + 2 * (1 - f) * f * controlX + f ** 2 * PORTAL.x;
        const y = (1 - f) ** 2 * shrine.y + 2 * (1 - f) * f * controlY + f ** 2 * PORTAL.y;
        star(ctx, x, y, 3.5, p.glow);
      }
    }
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4 + 0.3;
      const x = shrine.x + Math.cos(a) * 75;
      const y = shrine.y + Math.sin(a) * 38;
      ctx.save();
      ctx.globalAlpha = restored ? 0.4 : 0.16;
      sigil(ctx, identity, x, y, 9, p.secondary);
      ctx.restore();
    }
  });
  if (s.beatLeft > 0 && recovered > 0) {
    // The recovery beat is short and bounded; reduced-motion uses only the steady shrine light.
    const progress = 1 - s.beatLeft / 2.6;
    if (!assets.reducedMotion) {
      ctx.globalAlpha = (1 - progress) * 0.44;
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 3 - progress * 2;
      ctx.beginPath();
      ctx.ellipse(s.player.x, s.player.y, 24 + progress * 285, 12 + progress * 160, 0, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Low luminous stone outlines reveal collision reach without covering the painted formations.
  for (const rock of ROCKS) {
    ctx.save();
    ellipse(ctx, rock.x, rock.y + 8, rock.r + 4, rock.r * 0.48, "#08162b44");
    if (!assets.backdrop) {
      const stone = ctx.createLinearGradient(
        rock.x - rock.r,
        rock.y - rock.r,
        rock.x + rock.r,
        rock.y + rock.r,
      );
      stone.addColorStop(0, "#8b87a5");
      stone.addColorStop(0.4, "#42405d");
      stone.addColorStop(1, "#17273c");
      ctx.fillStyle = stone;
      ctx.beginPath();
      ctx.moveTo(rock.x - rock.r, rock.y + 5);
      ctx.lineTo(rock.x - rock.r * 0.55, rock.y - rock.r * 0.9);
      ctx.lineTo(rock.x + rock.r * 0.18, rock.y - rock.r * 1.25);
      ctx.lineTo(rock.x + rock.r, rock.y + 2);
      ctx.lineTo(rock.x + rock.r * 0.42, rock.y + rock.r * 0.46);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = distance(s.player, rock) < rock.r + 76 ? 0.58 : 0.23;
    ctx.strokeStyle = p.secondary;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.ellipse(rock.x, rock.y + 2, rock.r + 7, rock.r + 7, 0, 0.08, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();
  }

  SHRINES.forEach((shrine, index) => {
    const lit = s.fragments[index];
    const bob = Math.sin(t * 1.8 + index) * 3;
    glow(ctx, shrine.x, shrine.y - 32, lit ? 66 : 42, p.primary, lit ? 0.5 : 0.3);
    ctx.save();
    ctx.shadowColor = p.primary;
    ctx.shadowBlur = lit ? 14 : 6;
    ctx.strokeStyle = lit ? p.glow : p.primary;
    ctx.lineWidth = lit ? 2.3 : 1.5;
    ctx.globalAlpha = lit ? 0.88 : 0.62;
    ctx.beginPath();
    ctx.ellipse(shrine.x, shrine.y + 5, 37, 17, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
    // Each painted relic is a small piece of architecture grounded on its shrine pad.
    ellipse(ctx, shrine.x, shrine.y + 12, 48, 13, "#050a2188");
    relic(ctx, assets, identity, 0, shrine.x, shrine.y - 35, 116, 106);
    if (!lit) {
      ctx.save();
      ctx.translate(shrine.x, shrine.y - 24 + bob);
      ctx.rotate(Math.sin(t + index) * 0.04);
      ctx.shadowColor = p.primary;
      ctx.shadowBlur = 16;
      const crystalFace = ctx.createLinearGradient(-17, -22, 17, 22);
      crystalFace.addColorStop(0, "#e4e8ff99");
      crystalFace.addColorStop(0.3, "#303955bb");
      crystalFace.addColorStop(1, "#b8a6e488");
      ctx.fillStyle = crystalFace;
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(20, -17);
      ctx.lineTo(17, 22);
      ctx.lineTo(0, 29);
      ctx.lineTo(-17, 22);
      ctx.lineTo(-20, -17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (original) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-13, -17, 26, 36, 4);
        ctx.clip();
        const slice = original.naturalWidth / 3;
        ctx.drawImage(original, index * slice, 0, slice, original.naturalHeight, -13, -17, 26, 36);
        ctx.restore();
      }
      ctx.restore();
    } else {
      sigil(ctx, identity, shrine.x, shrine.y - 23 + bob, 17, p.glow);
      for (let i = 0; i < 4; i++) {
        const a = t * 0.6 + (i * TAU) / 4;
        star(ctx, shrine.x + Math.cos(a) * 25, shrine.y - 22 + Math.sin(a) * 12, 2.8, p.glow);
      }
    }
    // Restrained backing keeps small labels readable over textured illustration.
    ctx.save();
    ctx.fillStyle = "#081329bf";
    ctx.beginPath();
    ctx.roundRect(shrine.x - 72, shrine.y + 30, 144, 32, 9);
    ctx.fill();
    label(
      ctx,
      identity.landmarks[index].toUpperCase(),
      shrine.x,
      shrine.y + 43,
      lit ? p.glow : "#e7e7f8",
      9,
    );
    label(
      ctx,
      lit ? "MEMORY RESTORED" : `FRAGMENT 0${index + 1}`,
      shrine.x,
      shrine.y + 55,
      "#c4c5db",
      7,
    );
    ctx.restore();
  });

  SPARKS.forEach((spark, index) => {
    if (s.sparks[index]) return;
    const y = spark.y + Math.sin(t * 3 + index) * 2;
    glow(ctx, spark.x, y, 16, p.glow, 0.25);
    star(ctx, spark.x, y, 5.5, p.glow, t * 0.4);
  });

  // An open ring sits on the painted portal pad. The recovered art rebuilds inside it.
  glow(ctx, PORTAL.x, PORTAL.y - 26, open ? 130 : 74, p.primary, open ? 0.6 : 0.22);
  ctx.save();
  ctx.strokeStyle = open ? p.glow : p.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = p.primary;
  ctx.shadowBlur = open ? 18 : 9;
  ctx.beginPath();
  ctx.ellipse(PORTAL.x, PORTAL.y + 2, 45, 21, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = open ? 0.75 : 0.38;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(PORTAL.x, PORTAL.y + 2, 53, 26, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
  ellipse(ctx, PORTAL.x, PORTAL.y + 15, 56, 15, "#050a2199");
  ctx.save();
  ctx.globalAlpha = open ? 1 : 0.72;
  relic(ctx, assets, identity, 2, PORTAL.x, PORTAL.y - 53, 150, 135);
  ctx.restore();
  if (original && recovered > 0) {
    const imageWidth = 68;
    const imageHeight = 58;
    const artScale = Math.min(
      imageWidth / original.naturalWidth,
      imageHeight / original.naturalHeight,
    );
    const dw = original.naturalWidth * artScale;
    const dh = original.naturalHeight * artScale;
    ctx.save();
    ctx.translate(PORTAL.x, PORTAL.y - 117);
    ctx.shadowColor = p.primary;
    ctx.shadowBlur = open ? 22 : 11;
    ctx.fillStyle = "#13223aaa";
    ctx.strokeStyle = open ? p.glow : p.primary;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-dw / 2 - 5, -dh / 2 - 5, dw + 10, dh + 10, 7);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {
      if (!s.fragments[i]) continue;
      ctx.drawImage(
        original,
        (i * original.naturalWidth) / 3,
        0,
        original.naturalWidth / 3,
        original.naturalHeight,
        -dw / 2 + (i * dw) / 3,
        -dh / 2,
        dw / 3,
        dh,
      );
    }
    ctx.restore();
  } else {
    if (!assets.relics) sigil(ctx, identity, PORTAL.x, PORTAL.y - 36, 20, p.primary);
  }
  for (let i = 0; i < 3; i++)
    star(ctx, PORTAL.x - 17 + i * 17, PORTAL.y + 12, 4, s.fragments[i] ? p.glow : "#666684");
  ctx.save();
  ctx.fillStyle = "#081329c9";
  ctx.beginPath();
  ctx.roundRect(PORTAL.x - 96, PORTAL.y + 34, 192, 22, 10);
  ctx.fill();
  label(
    ctx,
    open ? "PORTAL OPEN · COME HOME" : `THE ARCHIVE · ${recovered}/3 RESTORED`,
    PORTAL.x,
    PORTAL.y + 49,
    open ? p.glow : "#e2dff3",
    9,
  );
  ctx.restore();

  PATROLS.forEach((patrol, index) => {
    const enemy = patrolPosition(index, s.elapsed);
    const stunned = s.stunned[index] > 0;
    ctx.save();
    ctx.strokeStyle = "#e8a9df26";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 12]);
    ctx.beginPath();
    ctx.ellipse(patrol.x, patrol.y, patrol.rx, patrol.ry, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ellipse(ctx, enemy.x, enemy.y + 5, 26, 10, "#090d2688");
    ctx.translate(enemy.x, enemy.y - 9 + Math.sin(t * 3 + index) * 2);
    const body = ctx.createRadialGradient(-7, -13, 1, 0, 0, 33);
    body.addColorStop(0, stunned ? "#b6a5d0" : "#715a8e");
    body.addColorStop(0.55, "#2d294c");
    body.addColorStop(1, "#16182f33");
    ctx.fillStyle = body;
    ctx.strokeStyle = "#d1a1d479";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-16, 16);
    ctx.bezierCurveTo(-32, -28, 26, -42, 22, 4);
    ctx.quadraticCurveTo(20, 20, 9, 13);
    ctx.quadraticCurveTo(-2, 29, -6, 15);
    ctx.quadraticCurveTo(-13, 24, -16, 16);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = stunned ? p.glow : "#ffc5e6";
    ctx.shadowBlur = 8;
    ellipse(ctx, -6, -4, 2.6, 3.6, stunned ? p.glow : "#ffcfeb");
    ellipse(ctx, 6, -4, 2.6, 3.6, stunned ? p.glow : "#ffcfeb");
    if (stunned) star(ctx, 0, -31, 6, p.glow, t * 2);
    ctx.restore();
  });

  const guardian = s.guardian;
  if (guardian.active) {
    if (guardian.mode === "warning" || guardian.mode === "burst") {
      const { x, y } = guardian.target;
      const burst = guardian.mode === "burst";
      const charge = burst ? 1 : 1 - guardian.timer / 0.9;
      ctx.save();
      ellipse(ctx, x, y, 66, 66, burst ? "#ffa26475" : "#ff8d5524");
      ctx.strokeStyle = "#ffd6a2";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 66, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "#ffab6f";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 66, -Math.PI / 2, -Math.PI / 2 + TAU * charge);
      ctx.stroke();
      if (!assets.reducedMotion) {
        ctx.globalAlpha = 0.3 + charge * 0.3;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 66 * (1 - charge), 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      label(ctx, burst ? "ECHO STRIKE" : "DASH CLEAR", x, y - 78, "#ffe6c4", 10);
      ctx.restore();
    }
    const gx = guardian.position.x;
    const gy = guardian.position.y;
    const stunned = guardian.mode === "stunned";
    const float = Math.sin(t * 2) * 3;
    ellipse(ctx, gx, gy + 14, 32, 10, "#071225aa");
    glow(ctx, gx, gy - 28, 82, p.secondary, stunned ? 0.14 : 0.32);
    ctx.save();
    ctx.translate(gx, gy - 20 + float);
    const robe = ctx.createLinearGradient(-32, -48, 32, 35);
    robe.addColorStop(0, "#bbb1d4");
    robe.addColorStop(0.15, "#564766");
    robe.addColorStop(0.45, "#2b2a49");
    robe.addColorStop(1, "#0b153299");
    ctx.fillStyle = robe;
    ctx.strokeStyle = p.secondary;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.bezierCurveTo(28, -41, 36, -5, 22, 25);
    ctx.lineTo(8, 18);
    ctx.lineTo(0, 39);
    ctx.lineTo(-11, 22);
    ctx.lineTo(-26, 28);
    ctx.bezierCurveTo(-20, 8, -34, -29, 0, -44);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = p.primary;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 8, -25);
      ctx.quadraticCurveTo(side * 3, 2, side * 18, 24);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = stunned ? p.glow : p.secondary;
    ctx.shadowBlur = 10;
    ellipse(ctx, -8, -9, 3.8, 5, stunned ? p.glow : "#ffe5ad");
    ellipse(ctx, 8, -9, 3.8, 5, stunned ? p.glow : "#ffe5ad");
    ctx.shadowBlur = 0;
    sigil(ctx, identity, 0, 13, 9, p.primary);
    ctx.restore();
    relic(ctx, assets, identity, 1, gx, gy - 53 + float, 90, 76);
    if (stunned) star(ctx, gx, gy - 107, 7, p.glow, t);
  }

  const x = s.player.x;
  const y = s.player.y;
  const spriteScale = hero
    ? Math.min(
        90 / (assets.motion?.height ?? hero.height),
        88 / (assets.motion?.width ?? hero.width),
      )
    : 1;
  const spriteWidth = hero ? hero.width * spriteScale : 0;
  const spriteHeight = hero ? hero.height * spriteScale : 0;
  const direction = s.facing.x < -0.08 ? -1 : 1;
  const bounce = assets.reducedMotion
    ? 0
    : active && s.moving
      ? Math.sin(t * 13) * 1.4
      : Math.sin(t * 2.4) * 1.1;
  // Sparse silhouette afterimages make the dash read as movement by this particular character.
  if (!assets.reducedMotion) {
    s.trail.forEach((point, index) => {
      if (index % 3 !== 0) return;
      ctx.save();
      ctx.globalAlpha = point.life * 0.65;
      if (hero) {
        ctx.translate(point.x, point.y + 9);
        ctx.scale(direction, 1);
        ctx.drawImage(hero, -spriteWidth / 2, -spriteHeight, spriteWidth, spriteHeight);
      } else {
        sigil(ctx, identity, point.x, point.y - 15, 14, p.primary);
      }
      ctx.restore();
    });
  }
  ellipse(ctx, x, y + 9, hero ? 19 : 22, 6.5, "#050d23b3");
  glow(ctx, x, y + 7, 36, p.primary, s.dashLeft > 0 ? 0.65 : 0.22);
  if (s.invulnerable === 0 || assets.reducedMotion || Math.floor(t * 12) % 2 === 0) {
    ctx.save();
    ctx.translate(x, y + 9 + bounce);
    ctx.rotate(s.dashLeft > 0 ? s.facing.x * 0.09 : 0);
    if (hero) {
      ctx.scale(direction, 1);
      ctx.shadowColor = p.primary;
      ctx.shadowBlur = s.dashLeft > 0 ? 14 : 5;
      ctx.drawImage(hero, -spriteWidth / 2, -spriteHeight, spriteWidth, spriteHeight);
    } else {
      ctx.shadowColor = p.primary;
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#14213de8";
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-27, -72, 54, 66, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (original) contain(ctx, original, 0, -39, 46, 56);
      else sigil(ctx, identity, 0, -39, 18, p.primary);
    }
    ctx.restore();
    ctx.strokeStyle = p.primary;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(x, y + 9, 24, 9, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.save();
  ctx.fillStyle = "#071329b3";
  const nameWidth = Math.min(154, Math.max(48, name.slice(0, 24).length * 6.3 + 16));
  ctx.beginPath();
  ctx.roundRect(x - nameWidth / 2, y + 19, nameWidth, 18, 7);
  ctx.fill();
  label(ctx, name.slice(0, 24), x, y + 32, "#fff3e8", 10);
  ctx.restore();
  if (s.target && active) {
    ctx.strokeStyle = "#fff0c9aa";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(s.target.x, s.target.y, 10, 4, 0, 0, TAU);
    ctx.stroke();
  }
  if (active) {
    const destinations = open ? [PORTAL] : SHRINES.filter((_, i) => !s.fragments[i]);
    const goal = [...destinations].sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
    if (goal && distance(goal, s.player) > 65) {
      const angle = Math.atan2(goal.y - y, goal.x - x);
      ctx.save();
      ctx.translate(x + Math.cos(angle) * 43, y + Math.sin(angle) * 43);
      ctx.rotate(angle);
      ctx.fillStyle = p.glow;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  // The chapter's atmosphere changes with the recovered art; keep the play plane readable.
  for (let i = 0; i < 3; i++) {
    const fogX = 160 + i * 320 + Math.sin(t * 0.12 + i) * 18;
    glow(ctx, fogX, 581, 150, i % 2 ? p.primary : p.secondary, 0.055 + recovered * 0.01);
  }
  const vignette = ctx.createRadialGradient(480, 350, 260, 480, 350, 650);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, open ? "#190d3299" : "#070d2177");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.fillStyle = "#081020b3";
  ctx.fillRect(0, 0, WIDTH, 28);
  label(ctx, identity.title.toUpperCase(), WIDTH / 2, 18, "#e4ddf5", 10);
  ctx.restore();
}
