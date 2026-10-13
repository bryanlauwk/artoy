export type SampleId = "nova" | "mochi" | "hexx";
export type Vec = { x: number; y: number };
export type Phase = "ready" | "playing" | "paused" | "won" | "lost";
export const WIDTH = 960;
export const HEIGHT = 640;
export const DURATION = 90;
export const ESCAPE_SECONDS = 20;
export type Act = "search" | "awakening" | "guardian" | "escape";
export type HeroAction = "idle" | "run" | "dash" | "hit";
export type Guardian = {
  active: boolean;
  position: Vec;
  target: Vec;
  mode: "waking" | "stalk" | "warning" | "burst" | "stunned";
  timer: number;
};
export const PORTAL = { x: 480, y: 520 };
export const SPAWN = { x: 480, y: 465 };
export const LAND: Vec[] = [
  { x: 390, y: 104 },
  { x: 645, y: 104 },
  { x: 716, y: 198 },
  { x: 815, y: 216 },
  { x: 878, y: 295 },
  { x: 888, y: 428 },
  { x: 796, y: 502 },
  { x: 626, y: 507 },
  { x: 587, y: 588 },
  { x: 365, y: 588 },
  { x: 310, y: 520 },
  { x: 162, y: 523 },
  { x: 78, y: 431 },
  { x: 87, y: 303 },
  { x: 163, y: 233 },
  { x: 320, y: 232 },
];
export const SHRINES = [
  { x: 208, y: 362, name: "Shadow grove", subtitle: "Find your first fragment" },
  { x: 514, y: 206, name: "Prism ruins", subtitle: "Watch the roaming inkling" },
  { x: 764, y: 358, name: "Whisper vault", subtitle: "Dash through the patrol" },
];
export const ROCKS = [
  { x: 344, y: 323, r: 28 },
  { x: 614, y: 318, r: 29 },
  { x: 347, y: 437, r: 22 },
  { x: 622, y: 440, r: 23 },
];
export const SPARKS: Vec[] = [
  { x: 400, y: 475 },
  { x: 297, y: 464 },
  { x: 238, y: 436 },
  { x: 363, y: 259 },
  { x: 430, y: 213 },
  { x: 650, y: 241 },
  { x: 743, y: 448 },
  { x: 659, y: 484 },
];
export const PATROLS = [
  { x: 490, y: 231, rx: 86, ry: 44, speed: 0.85, phase: 0.6 },
  { x: 747, y: 356, rx: 74, ry: 62, speed: -1.05, phase: 1.8 },
  { x: 499, y: 389, rx: 101, ry: 37, speed: 0.7, phase: 3.2 },
];
export type QuestEvent =
  | "dash"
  | "spark"
  | "fragment"
  | "hit"
  | "won"
  | "lost"
  | "awaken"
  | "guardian"
  | "warning"
  | "escape"
  | "stun";
export type QuestState = {
  phase: Phase;
  player: Vec;
  facing: Vec;
  elapsed: number;
  hearts: number;
  fragments: boolean[];
  sparks: boolean[];
  dashLeft: number;
  cooldown: number;
  invulnerable: number;
  stunned: number[];
  target: Vec | null;
  trail: (Vec & { life: number })[];
  events: QuestEvent[];
  moving: boolean;
  motionTime: number;
  hitLeft: number;
  beatLeft: number;
  escapeDeadline: number | null;
  guardian: Guardian;
};
export function createQuest(): QuestState {
  return {
    phase: "ready",
    player: { ...SPAWN },
    facing: { x: 0, y: -1 },
    elapsed: 0,
    hearts: 3,
    fragments: [false, false, false],
    sparks: SPARKS.map(() => false),
    dashLeft: 0,
    cooldown: 0,
    invulnerable: 0,
    stunned: PATROLS.map(() => 0),
    target: null,
    trail: [],
    events: [],
    moving: false,
    motionTime: 0,
    hitLeft: 0,
    beatLeft: 0,
    escapeDeadline: null,
    guardian: {
      active: false,
      position: { x: 480, y: 320 },
      target: { ...SPAWN },
      mode: "waking",
      timer: 1.3,
    },
  };
}
export const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export function onLand(p: Vec): boolean {
  let inside = false;
  for (let i = 0, j = LAND.length - 1; i < LAND.length; j = i++) {
    const a = LAND[i],
      b = LAND[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside && ROCKS.every((rock) => distance(p, rock) > rock.r + 14);
}
export function patrolPosition(index: number, elapsed: number): Vec {
  const p = PATROLS[index];
  const angle = elapsed * p.speed + p.phase;
  return { x: p.x + Math.cos(angle) * p.rx, y: p.y + Math.sin(angle) * p.ry };
}
export function questScore(s: QuestState): number {
  return (
    s.fragments.filter(Boolean).length * 300 +
    s.sparks.filter(Boolean).length * 50 +
    (s.phase === "won"
      ? s.hearts * 150 + Math.floor(Math.max(0, DURATION - s.elapsed)) * 10 + 500
      : 0)
  );
}
export function questAct(s: QuestState): Act {
  return (["search", "awakening", "guardian", "escape"] as const)[
    s.fragments.filter(Boolean).length
  ];
}
export function timeRemaining(s: QuestState): number {
  return Math.max(0, Math.min(DURATION, s.escapeDeadline ?? DURATION) - s.elapsed);
}
export function heroAction(s: QuestState): HeroAction {
  if (s.hitLeft > 0) return "hit";
  if (s.dashLeft > 0) return "dash";
  return s.moving ? "run" : "idle";
}
function damage(s: QuestState): void {
  if (s.invulnerable > 0 || s.dashLeft > 0) return;
  s.hearts -= 1;
  s.invulnerable = 1.8;
  s.hitLeft = 0.3;
  s.events.push("hit");
}
function stepGuardian(s: QuestState, dt: number, dashing: boolean): void {
  const g = s.guardian;
  if (!g.active) return;
  g.timer = Math.max(0, g.timer - dt);
  if (g.mode === "waking" || g.mode === "stunned" || g.mode === "burst") {
    if (g.timer > 0) return;
    g.mode = "stalk";
    g.timer = questAct(s) === "escape" ? 1.2 : 2.1;
  }
  if (dashing && distance(s.player, g.position) < 53 && g.mode !== "warning") {
    g.mode = "stunned";
    g.timer = 2.2;
    s.events.push("stun");
    return;
  }
  if (g.mode === "warning") {
    if (g.timer === 0) {
      g.mode = "burst";
      g.timer = 0.35;
      if (distance(s.player, g.target) < 66 && !dashing) damage(s);
    }
    return;
  }
  const dist = distance(g.position, s.player);
  if (dist > 50) {
    const speed = questAct(s) === "escape" ? 125 : 85;
    g.position.x += ((s.player.x - g.position.x) / dist) * speed * dt;
    g.position.y += ((s.player.y - g.position.y) / dist) * speed * dt;
  }
  if (g.timer === 0) {
    g.target = { ...s.player };
    g.mode = "warning";
    g.timer = 0.9;
    s.events.push("warning");
  }
}
/** Fixed, curated rules: only the visual theme changes with the character. */
export function stepQuest(s: QuestState, seconds: number, move: Vec, dash: boolean): void {
  s.events = [];
  if (s.phase !== "playing") return;
  const dt = Math.min(Math.max(seconds, 0), 1 / 30);
  s.elapsed += dt;
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.invulnerable = Math.max(0, s.invulnerable - dt);
  s.hitLeft = Math.max(0, s.hitLeft - dt);
  s.beatLeft = Math.max(0, s.beatLeft - dt);
  s.motionTime += dt;
  s.stunned = s.stunned.map((t) => Math.max(0, t - dt));
  s.trail = s.trail.map((p) => ({ ...p, life: p.life - dt })).filter((p) => p.life > 0);
  let direction = { ...move };
  if (direction.x || direction.y) s.target = null;
  else if (s.target) {
    const d = distance(s.target, s.player);
    if (d < 7) s.target = null;
    else direction = { x: (s.target.x - s.player.x) / d, y: (s.target.y - s.player.y) / d };
  }
  const magnitude = Math.hypot(direction.x, direction.y);
  if (magnitude > 0) {
    direction.x /= magnitude;
    direction.y /= magnitude;
    if (!s.dashLeft) s.facing = { ...direction };
  }
  if (dash && s.cooldown === 0) {
    s.dashLeft = 0.22;
    s.cooldown = 1.25;
    s.events.push("dash");
  }
  const dashing = s.dashLeft > 0;
  const velocity = dashing ? s.facing : direction;
  const speed = dashing ? 650 : 185;
  const previousPosition = { ...s.player };
  // Small movement substeps prevent dash tunnelling through solid props.
  const steps = Math.max(1, Math.ceil((speed * dt) / 5));
  for (let i = 0; i < steps; i++) {
    const nx = s.player.x + (velocity.x * speed * dt) / steps;
    const ny = s.player.y + (velocity.y * speed * dt) / steps;
    if (onLand({ x: nx, y: s.player.y })) s.player.x = nx;
    if (onLand({ x: s.player.x, y: ny })) s.player.y = ny;
  }
  s.moving = distance(previousPosition, s.player) > 0.01;
  if (dashing) s.trail.push({ ...s.player, life: 0.3 });
  s.dashLeft = Math.max(0, s.dashLeft - dt);
  SPARKS.forEach((p, i) => {
    if (!s.sparks[i] && distance(s.player, p) < 24) {
      s.sparks[i] = true;
      s.events.push("spark");
    }
  });
  const previousFragments = s.fragments.filter(Boolean).length;
  SHRINES.forEach((p, i) => {
    if (!s.fragments[i] && distance(s.player, p) < 35) {
      s.fragments[i] = true;
      s.events.push("fragment");
    }
  });
  const recovered = s.fragments.filter(Boolean).length;
  if (recovered > previousFragments) {
    s.beatLeft = 2.6;
    if (previousFragments < 1) s.events.push("awaken");
    if (previousFragments < 2 && recovered >= 2) {
      s.guardian.active = true;
      s.events.push("guardian");
    }
    if (recovered === 3) {
      s.escapeDeadline = Math.min(DURATION, s.elapsed + ESCAPE_SECONDS);
      s.invulnerable = Math.max(s.invulnerable, 0.8);
      s.events.push("escape");
    }
  }
  PATROLS.forEach((_, i) => {
    if (s.stunned[i] > 0 || distance(s.player, patrolPosition(i, s.elapsed)) > 34) return;
    if (dashing) s.stunned[i] = 2.5;
    else if (s.invulnerable === 0) {
      damage(s);
    }
  });
  stepGuardian(s, dt, dashing);
  if (s.hearts <= 0 || timeRemaining(s) === 0) {
    s.phase = "lost";
    s.target = null;
    s.events.push("lost");
  } else if (s.fragments.every(Boolean) && distance(s.player, PORTAL) < 39) {
    s.phase = "won";
    s.target = null;
    s.events.push("won");
  }
}
