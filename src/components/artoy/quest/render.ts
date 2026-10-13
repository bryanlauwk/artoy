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
import type { Palette } from "./artwork";

type Assets = {
  original: HTMLImageElement | null;
  hero: HTMLCanvasElement | null;
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
function portrait(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  radius: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.clip();
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  ctx.drawImage(
    image,
    (image.naturalWidth - side) / 2,
    (image.naturalHeight - side) / 2,
    side,
    side,
    x - radius,
    y - radius,
    radius * 2,
    radius * 2,
  );
  ctx.restore();
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
export function renderQuest(
  ctx: CanvasRenderingContext2D,
  s: QuestState,
  assets: Assets,
  clock: number,
) {
  const { palette: p, original, hero, name } = assets;
  const t = assets.reducedMotion ? 0 : clock;
  const active = s.phase === "playing";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
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
  for (const rock of ROCKS) {
    ellipse(ctx, rock.x + 5, rock.y + 9, rock.r + 4, rock.r * 0.6, "#0b253855");
    ctx.beginPath();
    ctx.moveTo(rock.x - rock.r, rock.y + 3);
    ctx.lineTo(rock.x - rock.r * 0.65, rock.y - rock.r * 0.65);
    ctx.lineTo(rock.x + rock.r * 0.3, rock.y - rock.r);
    ctx.lineTo(rock.x + rock.r, rock.y - 2);
    ctx.lineTo(rock.x + rock.r * 0.65, rock.y + rock.r * 0.55);
    ctx.closePath();
    ctx.fillStyle = "#748b94";
    ctx.fill();
    ctx.strokeStyle = "#b7c6c155";
    ctx.lineWidth = 2;
    ctx.stroke();
    crystal(ctx, rock.x, rock.y - 20, rock.r * 0.48, p.primary);
  }
  // Original art lives in each monument, connecting exploration to the creator's universe.
  SHRINES.forEach((shrine, i) => {
    const lit = s.fragments[i];
    ellipse(ctx, shrine.x, shrine.y + 13, 44, 21, "#192e40");
    ellipse(ctx, shrine.x, shrine.y + 5, 44, 21, lit ? "#677d75" : "#64727f");
    ctx.strokeStyle = lit ? p.glow : "#a8c3c15c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(shrine.x, shrine.y + 4, 36, 16, 0, 0, TAU);
    ctx.stroke();
    if (lit) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 9]);
      ctx.beginPath();
      ctx.moveTo(shrine.x, shrine.y);
      ctx.lineTo(PORTAL.x, PORTAL.y);
      ctx.stroke();
      ctx.restore();
      star(ctx, shrine.x, shrine.y - 21, 13, p.glow);
    } else {
      const bob = Math.sin(t * 2 + i) * 4;
      ctx.save();
      ctx.translate(shrine.x, shrine.y - 25 + bob);
      ctx.rotate(Math.sin(t + i) * 0.06);
      ctx.shadowColor = p.primary;
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#17263c";
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-19, -24, 38, 47, 9);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (original) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-15, -20, 30, 33, 5);
        ctx.clip();
        const slice = original.naturalWidth / 3;
        ctx.drawImage(original, i * slice, 0, slice, original.naturalHeight, -15, -20, 30, 33);
        ctx.restore();
      }
      star(ctx, 0, 17, 5, p.glow);
      ctx.restore();
    }
    label(ctx, shrine.name.toUpperCase(), shrine.x, shrine.y + 48, lit ? p.glow : "#d8e8e0", 10);
    label(ctx, lit ? "RESTORED" : `FRAGMENT 0${i + 1}`, shrine.x, shrine.y + 63, "#c1d0cf99", 8);
  });
  SPARKS.forEach((spark, i) => {
    if (s.sparks[i]) return;
    const y = spark.y + Math.sin(t * 3 + i) * 2;
    ellipse(ctx, spark.x, spark.y + 8, 7, 3, "#0a203c55");
    star(ctx, spark.x, y, 7, p.glow, t * 0.4);
  });
  // Portal is the start and the explicit finish; each recovered fragment fills one socket.
  const open = s.fragments.every(Boolean);
  ellipse(ctx, PORTAL.x, PORTAL.y + 20, 66, 24, "#17293b");
  ellipse(ctx, PORTAL.x, PORTAL.y + 13, 57, 22, "#718386");
  ctx.save();
  ctx.translate(PORTAL.x, PORTAL.y - 13);
  ctx.strokeStyle = "#a6a8ac";
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.ellipse(0, -20, 35, 46, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = open ? p.glow : p.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = p.primary;
  ctx.shadowBlur = open ? 22 : 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
  const gate = ctx.createRadialGradient(0, -20, 3, 0, -20, 48);
  gate.addColorStop(0, open ? "#fff4db" : "#485570");
  gate.addColorStop(1, open ? p.primary : "#1f2b40");
  ctx.fillStyle = gate;
  ctx.beginPath();
  ctx.ellipse(0, -20, 30, 42, 0, 0, TAU);
  ctx.fill();
  if (original) {
    ctx.globalAlpha = open ? 0.5 : 0.15;
    portrait(ctx, original, 0, -21, 25);
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 3; i++) star(ctx, -22 + i * 22, 38, 6, s.fragments[i] ? p.glow : "#34424f");
  ctx.restore();
  label(
    ctx,
    open ? "PORTAL OPEN · COME HOME" : "THE PORTAL",
    PORTAL.x,
    PORTAL.y + 55,
    open ? p.glow : "#dde7e1",
    10,
  );
  // Telegraph patrol reach and draw enemies separately from the hero artwork.
  PATROLS.forEach((patrol, i) => {
    const enemy = patrolPosition(i, s.elapsed);
    const stunned = s.stunned[i] > 0;
    ctx.strokeStyle = "#e693bc22";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 9]);
    ctx.beginPath();
    ctx.ellipse(patrol.x, patrol.y, patrol.rx, patrol.ry, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ellipse(ctx, enemy.x, enemy.y + 5, 34, 17, stunned ? "#ffe4a326" : "#dc6f962b");
    ellipse(ctx, enemy.x, enemy.y + 10, 20, 8, "#13223e70");
    ctx.save();
    ctx.translate(enemy.x, enemy.y - 6 + Math.sin(t * 3 + i) * 2);
    ctx.fillStyle = stunned ? "#655878" : "#24253e";
    ctx.strokeStyle = "#bc91c880";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, 13);
    ctx.bezierCurveTo(-29, -33, 29, -33, 18, 13);
    ctx.lineTo(8, 8);
    ctx.lineTo(0, 15);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, -7, -3, 3, 4, stunned ? p.glow : "#f3bdd9");
    ellipse(ctx, 7, -3, 3, 4, stunned ? p.glow : "#f3bdd9");
    if (stunned) star(ctx, 0, -28, 7, p.glow, t * 2);
    ctx.restore();
  });
  // Keep the complete generated hero; raw artwork becomes an intentional floating art token.
  s.trail.forEach((point) => {
    ctx.globalAlpha = point.life * 0.8;
    ellipse(ctx, point.x, point.y, 21, 15, p.primary);
  });
  ctx.globalAlpha = 1;
  const x = s.player.x,
    y = s.player.y;
  const bounce = active && s.target ? Math.sin(t * 12) * 2 : Math.sin(t * 2.5) * 1.5;
  ellipse(ctx, x, y + 10, hero ? 19 : 24, 8, "#0b203a77");
  if (s.invulnerable === 0 || Math.floor(t * 12) % 2 === 0) {
    if (hero) {
      const height = Math.min(75, (65 * hero.height) / hero.width),
        width = height * (hero.width / hero.height);
      ctx.save();
      ctx.translate(x, y + 10 + bounce);
      ctx.rotate(s.dashLeft > 0 ? s.facing.x * 0.13 : 0);
      ctx.shadowColor = p.primary;
      ctx.shadowBlur = 9;
      ctx.drawImage(hero, -width / 2, -height, width, height);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(x, y - 13 + bounce);
      ctx.rotate(s.dashLeft > 0 ? s.facing.x * 0.17 : 0);
      ctx.shadowColor = p.primary;
      ctx.shadowBlur = 15;
      ellipse(ctx, 0, 0, 25, 25, "#132940");
      ctx.shadowBlur = 0;
      if (original) portrait(ctx, original, 0, 0, 22);
      else star(ctx, 0, 0, 17, p.primary);
      ctx.strokeStyle = p.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, TAU);
      ctx.stroke();
      star(ctx, 0, 30, 5, p.glow);
      ctx.restore();
    }
    ctx.strokeStyle = p.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 9, 27, 11, 0, 0, TAU);
    ctx.stroke();
  }
  label(ctx, name.slice(0, 24), x, y + 35, "#fff3dc", 10);
  if (s.target && active) {
    ctx.strokeStyle = "#fff0c988";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(s.target.x, s.target.y, 11, 5, 0, 0, TAU);
    ctx.stroke();
  }
  // A compass helps a newcomer choose a route, then points back to the unlocked portal.
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
  // A subtle vignette keeps the edges quiet without obscuring navigation.
  // Mist stays over the lower island edges; paths, patrols and fragments remain legible.
  for (let i = 0; i < 3; i++) {
    const fogX = 180 + i * 310 + Math.sin(t * 0.12 + i) * 22;
    const fog = ctx.createRadialGradient(fogX, 568, 5, fogX, 568, 155);
    fog.addColorStop(0, "#9ab4dc13");
    fog.addColorStop(1, "transparent");
    ctx.fillStyle = fog;
    ctx.fillRect(fogX - 155, 430, 310, 210);
  }
  const vignette = ctx.createRadialGradient(480, 350, 250, 480, 350, 650);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "#070d2188");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}
