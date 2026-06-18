import { useEffect, useRef, useState } from "react";
import {
  Heart, Gem, Pause, Play, RotateCcw, Paintbrush, Eye, Timer,
  ChevronRight, Gamepad2, Volume2, VolumeX, Trophy, Sparkles, Zap, Lock,
} from "lucide-react";
import { STAGES, W, H, type SampleId, type Rect, type Stage } from "./meccha/stages";
import { loadBests, recordRun, resetBests, isUnlocked, prevStage, type BestsBlob } from "./meccha/storage";
import { computeScore, formatMs } from "./meccha/scoring";

export type { SampleId } from "./meccha/stages";

type Props = { avatarSrc: string | null; sampleId?: SampleId | null };

type RGB = [number, number, number];
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r?: number };
type GemState = { x: number; y: number; taken: boolean; bob: number; perfect: boolean };

const ROUND_SECONDS = 60;
const PLAYER_RADIUS = 16;
const GEM_PICKUP_RADIUS = 26;
const GEM_PROX_RADIUS = 95;
const BLEND_PICKUP = 0.72;
const BLEND_SAFE = 0.78;
const BLEND_PERFECT = 0.85;
const STAMINA_MAX = 1.0;
const STAMINA_DRAIN = 0.2 / 60;   // 5s of continuous paint
const STAMINA_REFILL = 0.4 / 60;  // 2.5s back to full

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function colorDistance(a: RGB, b: RGB): number {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rgbCss(c: RGB) { return `rgb(${c[0]|0}, ${c[1]|0}, ${c[2]|0})`; }

function rectsContain(rects: Rect[], x: number, y: number): boolean {
  for (const r of rects) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
  }
  return false;
}

/** Push a circle out of an AABB (simple shallowest-axis resolution). */
function resolveObstacleCollisions(px: number, py: number, r: number, rects: Rect[]): { x: number; y: number } {
  let x = px, y = py;
  for (const rc of rects) {
    const cx = clamp(x, rc.x, rc.x + rc.w);
    const cy = clamp(y, rc.y, rc.y + rc.h);
    const dx = x - cx, dy = y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      const d = Math.sqrt(d2) || 0.001;
      x += (dx / d) * (r - d);
      y += (dy / d) * (r - d);
    }
  }
  return { x, y };
}

/** Segment (a→b) vs AABB intersection — slab method. */
function segIntersectsRect(ax: number, ay: number, bx: number, by: number, rc: Rect): boolean {
  const dx = bx - ax, dy = by - ay;
  let tmin = 0, tmax = 1;
  for (const [p, q, rmin, rmax] of [
    [ax, dx, rc.x, rc.x + rc.w],
    [ay, dy, rc.y, rc.y + rc.h],
  ] as const) {
    if (Math.abs(q) < 1e-6) {
      if (p < rmin || p > rmax) return false;
    } else {
      const t1 = (rmin - p) / q;
      const t2 = (rmax - p) / q;
      const lo = Math.min(t1, t2), hi = Math.max(t1, t2);
      tmin = Math.max(tmin, lo);
      tmax = Math.min(tmax, hi);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

function pointInTriangle(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

const TUTORIAL_STEPS = [
  { title: "Welcome, chameleon!", body: "Use WASD / Arrows (or tap) to move. You start as your character's color." },
  { title: "Paint to blend", body: "HOLD SPACE (or the Paint button) on a colored patch to soak its color. Watch your Stamina bar — short bursts work best." },
  { title: "Match the meter", body: "Pass 72% blend to grab gems. Pass 78% to be invisible inside the Seeker's beam." },
  { title: "Grab 3 gems or survive 60s", body: "Each stage has 3 paint gems. Perfect blend (85%+) at pickup earns bonus score!" },
];

// ---------- Audio ----------
function useGameSfx(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = () => {
    if (!enabled) return null;
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
    }
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  };
  const tone = (freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08, slideTo?: number) => {
    const ctx = ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  };
  return {
    spotted: () => { tone(440, 0.18, "sawtooth", 0.12, 90); setTimeout(() => tone(180, 0.22, "square", 0.10, 70), 60); },
    gem: () => { tone(880, 0.09, "triangle", 0.10); setTimeout(() => tone(1320, 0.12, "triangle", 0.10), 70); setTimeout(() => tone(1760, 0.16, "triangle", 0.09), 150); },
    perfect: () => { tone(1320, 0.08, "sine", 0.08); setTimeout(() => tone(1980, 0.14, "sine", 0.08), 60); setTimeout(() => tone(2640, 0.2, "sine", 0.07), 140); },
    danger: () => { tone(660, 0.07, "square", 0.05); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, "triangle", 0.09), i * 110)); },
    lose: () => { [330, 247, 175].forEach((f, i) => setTimeout(() => tone(f, 0.22, "sawtooth", 0.10), i * 140)); },
    tap: () => { tone(720, 0.04, "sine", 0.04); },
    resume: () => { ensure(); },
  };
}

export function PixelSocialSim({ avatarSrc, sampleId }: Props) {
  if (!sampleId) {
    return (
      <div className="rounded-2xl border border-border bg-white/[0.03] p-8 text-center">
        <Gamepad2 className="mx-auto size-7 text-foreground/40" />
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/70">
          Pick a character above to load the playable mini-game
        </p>
      </div>
    );
  }

  const stage: Stage = STAGES[sampleId];

  // Bests / unlock state
  const [bests, setBests] = useState<BestsBlob>(() => loadBests());
  const unlocked = isUnlocked(sampleId, bests);
  const myBest = bests[sampleId];

  if (!unlocked) {
    const need = prevStage(sampleId);
    const needName = need ? STAGES[need].name : "previous stage";
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/[0.03] p-8 text-center">
        <Lock className="mx-auto size-7" style={{ color: stage.accent }} />
        <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.18em]" style={{ color: stage.accent }}>
          {stage.name} stage locked
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Clear <span className="font-black">{needName}</span> first to unlock {stage.name}'s arena.
        </p>
      </div>
    );
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const seekerImgRef = useRef<HTMLImageElement | null>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);
  const avatarPaletteRef = useRef<RGB[]>([]);
  const samplerRef = useRef<HTMLCanvasElement | null>(null);
  const samplerCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const keysRef = useRef<Record<string, boolean>>({});
  const paintHoldRef = useRef(false);
  const moveTargetRef = useRef<{ x: number; y: number } | null>(null);

  const [audioOn, setAudioOn] = useState(true);
  const sfx = useGameSfx(audioOn);
  const sfxRef = useRef(sfx);
  sfxRef.current = sfx;

  // Seeker runtime: live x/y/dir per stage seeker
  type SeekerRT = { x: number; y: number; dir: number; angle: number; phase: number };

  const stateRef = useRef({
    px: stage.spawn.x, py: stage.spawn.y,
    vx: 0, vy: 0,
    body: [255, 255, 255] as RGB,
    floor: [255, 255, 255] as RGB,
    blend: 0,
    seekers: [] as SeekerRT[],
    spottedFlash: 0,
    invuln: 0,
    shake: 0,
    pickupFlash: 0,
    perfectFlash: 0,
    dangerPulse: 0,
    particles: [] as Particle[],
    gems: stage.gems.map((g) => ({ x: g.x, y: g.y, taken: false, bob: Math.random() * Math.PI * 2, perfect: false })) as GemState[],
    t: 0,
    timeLeft: ROUND_SECONDS * 60,
    hearts: 3,
    painting: false,
    inCone: false,
    stamina: STAMINA_MAX,
    perfectCount: 0,
    startedAt: 0,
  });

  const [hearts, setHearts] = useState(3);
  const [gemCount, setGemCount] = useState(0);
  const [blendPct, setBlendPct] = useState(0);
  const [stamPct, setStamPct] = useState(100);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState<null | "win" | "lose">(null);
  const [spotted, setSpotted] = useState(false);
  const [touch, setTouch] = useState(false);
  const [focused, setFocused] = useState(false);
  const [bodyCss, setBodyCss] = useState("rgb(255,255,255)");
  const [nearGem, setNearGem] = useState(false);
  const [pickupReady, setPickupReady] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [finalStats, setFinalStats] = useState<null | { won: boolean; ms: number; score: number; gems: number; hearts: number; perfectCount: number; timeLeftSec: number; newBest: boolean }>(null);

  // Reset tutorial when character changes
  useEffect(() => { setTutorialOpen(true); setTutorialStep(0); }, [sampleId]);

  // Load assets + reset
  useEffect(() => {
    const bg = new Image();
    bg.onload = () => {
      bgRef.current = bg;
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const oc = off.getContext("2d", { willReadFrequently: true });
      if (oc) {
        oc.drawImage(bg, 0, 0, W, H);
        samplerRef.current = off;
        samplerCtxRef.current = oc;
      }
    };
    bg.src = stage.bg;
    const sk = new Image();
    sk.onload = () => { seekerImgRef.current = sk; };
    sk.src = stage.seekerSprite;
    resetRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId]);

  // Avatar palette
  useEffect(() => {
    if (!avatarSrc) { avatarImgRef.current = null; avatarPaletteRef.current = []; return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      avatarImgRef.current = img;
      try {
        const sz = 48;
        const off = document.createElement("canvas");
        off.width = sz; off.height = sz;
        const oc = off.getContext("2d", { willReadFrequently: true });
        if (oc) {
          oc.drawImage(img, 0, 0, sz, sz);
          const data = oc.getImageData(0, 0, sz, sz).data;
          const buckets = new Map<number, { r: number; g: number; b: number; n: number; w: number }>();
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 200) continue;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max < 28 || max > 245) continue;
            const sat = (max - min) / (max || 1);
            const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
            const e = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, w: 0 };
            e.r += r; e.g += g; e.b += b; e.n += 1; e.w += 1 + sat * 2;
            buckets.set(key, e);
          }
          const top = [...buckets.values()].sort((a, b) => b.w - a.w).slice(0, 8);
          const palette: RGB[] = [];
          for (const e of top) {
            const c: RGB = [e.r / e.n, e.g / e.n, e.b / e.n];
            if (palette.every((p) => colorDistance(p, c) > 60)) palette.push(c);
            if (palette.length >= 3) break;
          }
          avatarPaletteRef.current = palette;
          if (palette[0]) {
            stateRef.current.body = [...palette[0]] as RGB;
            setBodyCss(rgbCss(palette[0]));
          }
        }
      } catch { /* CORS-safe */ }
    };
    img.src = avatarSrc;
  }, [avatarSrc]);

  useEffect(() => {
    if (typeof window !== "undefined") setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," "].includes(k)) {
        e.preventDefault();
        setFocused(true);
        sfxRef.current.resume();
      }
      if (k === " ") paintHoldRef.current = true;
      keysRef.current[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " ") paintHoldRef.current = false;
      keysRef.current[k] = false;
    };
    const blur = () => { keysRef.current = {}; paintHoldRef.current = false; };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (paused || done || tutorialOpen) return;
    setFocused(true);
    sfxRef.current.resume();
    const rect = e.currentTarget.getBoundingClientRect();
    moveTargetRef.current = {
      x: clamp(((e.clientX - rect.left) / rect.width) * W, PLAYER_RADIUS, W - PLAYER_RADIUS),
      y: clamp(((e.clientY - rect.top) / rect.height) * H, PLAYER_RADIUS, H - PLAYER_RADIUS),
    };
  };

  function initSeekers(): SeekerRT[] {
    return stage.seekers.map((cfg) => {
      if (cfg.kind === "horizontal") {
        return { x: cfg.minX + (cfg.phase ? (cfg.maxX - cfg.minX) : 0), y: cfg.y, dir: cfg.phase ? -1 : 1, angle: Math.PI / 2, phase: cfg.phase ?? 0 };
      }
      const ang = cfg.phase ?? 0;
      return { x: cfg.cx + Math.cos(ang) * cfg.radius, y: cfg.cy + Math.sin(ang) * cfg.radius, dir: 1, angle: ang + Math.PI / 2, phase: ang };
    });
  }

  const resetRound = () => {
    const base: RGB = avatarPaletteRef.current[0] ?? [255, 255, 255];
    stateRef.current = {
      px: stage.spawn.x, py: stage.spawn.y,
      vx: 0, vy: 0,
      body: [...base] as RGB,
      floor: [255, 255, 255],
      blend: 0,
      seekers: initSeekers(),
      spottedFlash: 0, invuln: 0, shake: 0, pickupFlash: 0, perfectFlash: 0, dangerPulse: 0,
      particles: [],
      gems: stage.gems.map((g) => ({ x: g.x, y: g.y, taken: false, bob: Math.random() * Math.PI * 2, perfect: false })),
      t: 0,
      timeLeft: ROUND_SECONDS * 60,
      hearts: 3,
      painting: false, inCone: false,
      stamina: STAMINA_MAX,
      perfectCount: 0,
      startedAt: performance.now(),
    };
    moveTargetRef.current = null;
    setHearts(3); setGemCount(0); setBlendPct(0); setStamPct(100);
    setTimeLeft(ROUND_SECONDS); setBodyCss(rgbCss(base));
    setDone(null); setSpotted(false); setNearGem(false); setPickupReady(false);
    setPaused(false); setFinalStats(null);
  };

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const MAX_SPEED = 2.6;
    const ACCEL = 0.4;
    const FRIC = 0.78;

    const step = () => {
      const s = stateRef.current;
      const halted = paused || !!done || tutorialOpen;
      if (!halted) {
        s.t += 1;

        // Movement
        const k = keysRef.current;
        let ax = 0, ay = 0;
        if (k["arrowleft"]  || k["a"]) ax -= 1;
        if (k["arrowright"] || k["d"]) ax += 1;
        if (k["arrowup"]    || k["w"]) ay -= 1;
        if (k["arrowdown"]  || k["s"]) ay += 1;
        if (ax || ay) moveTargetRef.current = null;
        else if (moveTargetRef.current) {
          const dx = moveTargetRef.current.x - s.px;
          const dy = moveTargetRef.current.y - s.py;
          const dist = Math.hypot(dx, dy);
          if (dist < 6) moveTargetRef.current = null;
          else { ax = dx / dist; ay = dy / dist; }
        }
        if (ax && ay) { ax *= 0.7071; ay *= 0.7071; }
        s.vx = clamp(s.vx + ax * ACCEL, -MAX_SPEED, MAX_SPEED);
        s.vy = clamp(s.vy + ay * ACCEL, -MAX_SPEED, MAX_SPEED);
        if (!ax) s.vx *= FRIC;
        if (!ay) s.vy *= FRIC;
        if (Math.abs(s.vx) < 0.05) s.vx = 0;
        if (Math.abs(s.vy) < 0.05) s.vy = 0;
        s.px = clamp(s.px + s.vx, PLAYER_RADIUS, W - PLAYER_RADIUS);
        s.py = clamp(s.py + s.vy, PLAYER_RADIUS + 40, H - PLAYER_RADIUS);
        // Obstacle collision
        const resolved = resolveObstacleCollisions(s.px, s.py, PLAYER_RADIUS + 2, stage.obstacles);
        s.px = resolved.x; s.py = resolved.y;

        // Sample floor under feet
        const sc = samplerCtxRef.current;
        if (sc) {
          try {
            const d = sc.getImageData(s.px | 0, (s.py + 6) | 0, 1, 1).data;
            s.floor = [d[0], d[1], d[2]];
          } catch { /* same-origin */ }
        }

        // Paint pad multiplier
        const onPad = rectsContain(stage.paintPads, s.px, s.py);
        const paintMul = onPad ? 2 : 1;

        // Paint (consumes stamina, refills when idle)
        const wantPaint = paintHoldRef.current && s.stamina > 0;
        s.painting = wantPaint;
        if (wantPaint) {
          s.body = lerpColor(s.body, s.floor, 0.12 * paintMul);
          s.stamina = Math.max(0, s.stamina - STAMINA_DRAIN * paintMul);
          if (s.t % 6 === 0) {
            s.particles.push({
              x: s.px + (Math.random() - 0.5) * 18,
              y: s.py + 4 + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 0.6,
              vy: -0.4 - Math.random() * 0.6,
              life: 0, max: 26 + Math.random() * 10,
              color: rgbCss(s.floor),
            });
          }
        } else {
          s.stamina = Math.min(STAMINA_MAX, s.stamina + STAMINA_REFILL);
        }

        // Blend
        const dC = colorDistance(s.body, s.floor);
        const blend = clamp(1 - dC / 220, 0, 1);
        s.blend = blend;

        // Seekers
        let anySees = false;
        s.seekers.forEach((sk, i) => {
          const cfg = stage.seekers[i];
          if (cfg.kind === "horizontal") {
            sk.x += cfg.speed * sk.dir;
            if (sk.x > cfg.maxX) { sk.x = cfg.maxX; sk.dir = -1; }
            if (sk.x < cfg.minX) { sk.x = cfg.minX; sk.dir = 1; }
            sk.angle = Math.PI / 2 + Math.sin(s.t * cfg.swingSpeed + (cfg.phase ?? 0)) * cfg.swingAmp;
          } else {
            sk.phase += cfg.speed;
            sk.x = cfg.cx + Math.cos(sk.phase) * cfg.radius;
            sk.y = cfg.cy + Math.sin(sk.phase) * cfg.radius;
            // cone faces center
            sk.angle = Math.atan2(cfg.cy - sk.y, cfg.cx - sk.x);
          }

          // Cone vertices
          const a1 = sk.angle - cfg.coneHalf;
          const a2 = sk.angle + cfg.coneHalf;
          const ax1 = sk.x + Math.cos(a1) * cfg.coneLen;
          const ay1 = sk.y + Math.sin(a1) * cfg.coneLen;
          const ax2 = sk.x + Math.cos(a2) * cfg.coneLen;
          const ay2 = sk.y + Math.sin(a2) * cfg.coneLen;
          const inCone = pointInTriangle(s.px, s.py, sk.x, sk.y, ax1, ay1, ax2, ay2);
          // Line-of-sight: obstacles break the beam
          let occluded = false;
          if (inCone) {
            for (const rc of stage.obstacles) {
              if (segIntersectsRect(sk.x, sk.y, s.px, s.py, rc)) { occluded = true; break; }
            }
          }
          if (inCone && !occluded) anySees = true;
        });
        s.inCone = anySees;

        // Danger pulse
        if (anySees && blend < BLEND_SAFE && s.invuln === 0) {
          s.dangerPulse += 1;
          if (s.dangerPulse % 22 === 0) sfxRef.current.danger();
        } else s.dangerPulse = 0;

        if (s.invuln > 0) s.invuln -= 1;
        if (anySees && blend < BLEND_SAFE && s.invuln === 0) {
          s.hearts -= 1;
          s.spottedFlash = 36; s.shake = 18; s.invuln = 90;
          s.body = [...(avatarPaletteRef.current[0] ?? [255, 255, 255])] as RGB;
          setHearts(s.hearts);
          setSpotted(true);
          sfxRef.current.spotted();
          for (let i = 0; i < 22; i++) {
            const a = (Math.PI * 2 * i) / 22;
            s.particles.push({ x: s.px, y: s.py, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2, life: 0, max: 38, color: "#ff5050", r: 3.5 });
          }
          setTimeout(() => setSpotted(false), 750);
          // knockback (away from nearest seeker)
          let near = s.seekers[0];
          let nd = Infinity;
          for (const sk of s.seekers) {
            const d = Math.hypot(sk.x - s.px, sk.y - s.py);
            if (d < nd) { nd = d; near = sk; }
          }
          const dx = s.px - near.x, dy = s.py - near.y;
          const m = Math.hypot(dx, dy) || 1;
          s.vx += (dx / m) * 4; s.vy += (dy / m) * 4;
          if (s.hearts <= 0) { finishRound(false); }
        }
        if (s.spottedFlash > 0) s.spottedFlash -= 1;
        if (s.shake > 0) s.shake -= 1;
        if (s.pickupFlash > 0) s.pickupFlash -= 1;
        if (s.perfectFlash > 0) s.perfectFlash -= 1;

        // Gems
        let near = false, ready = false;
        s.gems.forEach((g) => {
          g.bob += 0.08;
          if (g.taken) return;
          const dist = Math.hypot(g.x - s.px, g.y - s.py);
          if (dist < GEM_PROX_RADIUS) {
            near = true;
            if (blend >= BLEND_PICKUP) ready = true;
          }
          if (dist < GEM_PICKUP_RADIUS && blend >= BLEND_PICKUP) {
            g.taken = true;
            const isPerfect = blend >= BLEND_PERFECT;
            g.perfect = isPerfect;
            if (isPerfect) { s.perfectCount += 1; s.perfectFlash = 30; sfxRef.current.perfect(); }
            else { sfxRef.current.gem(); }
            s.pickupFlash = 26;
            for (let i = 0; i < 22; i++) {
              const a = (Math.PI * 2 * i) / 22;
              s.particles.push({ x: g.x, y: g.y, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6, life: 0, max: 46, color: stage.accent, r: 3 });
            }
            for (let i = 0; i < 10; i++) {
              s.particles.push({
                x: g.x + (Math.random() - 0.5) * 20,
                y: g.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 1.6, vy: -1 - Math.random() * 1.4,
                life: 0, max: 50, color: isPerfect ? "#fff" : "#fff7a8", r: 2,
              });
            }
            const taken = s.gems.filter((x) => x.taken).length;
            setGemCount(taken);
            if (taken >= s.gems.length) finishRound(true);
          }
        });
        setNearGem(near);
        setPickupReady(ready);

        // Timer
        s.timeLeft -= 1;
        if (s.timeLeft <= 0) { s.timeLeft = 0; finishRound(true); }

        // Particles
        s.particles = s.particles.filter((p) => {
          p.life += 1; p.x += p.vx; p.y += p.vy; p.vy += 0.05;
          return p.life < p.max;
        });

        if (s.t % 4 === 0) {
          setBlendPct(Math.round(blend * 100));
          setBodyCss(rgbCss(s.body));
          setTimeLeft(Math.ceil(s.timeLeft / 60));
          setStamPct(Math.round(s.stamina * 100));
        }
      }

      // ---------- DRAW ----------
      ctx.save();
      const shakeX = stateRef.current.shake > 0 ? (Math.random() - 0.5) * stateRef.current.shake : 0;
      const shakeY = stateRef.current.shake > 0 ? (Math.random() - 0.5) * stateRef.current.shake : 0;
      ctx.translate(shakeX, shakeY);

      ctx.clearRect(-20, -20, W + 40, H + 40);
      const bg = bgRef.current;
      if (bg) ctx.drawImage(bg, 0, 0, W, H);
      else { ctx.fillStyle = "#1a0a2e"; ctx.fillRect(0, 0, W, H); }

      // s already declared at the top of step()

      // Paint pads (drawn under everything)
      stage.paintPads.forEach((p) => {
        const pulse = 0.5 + Math.sin(s.t * 0.08) * 0.3;
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.globalAlpha = pulse;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.setLineDash([]);
        // label
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.font = "bold 10px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("2× PAINT", p.x + p.w / 2, p.y + p.h / 2 + 3);
      });

      // Move target ring
      if (moveTargetRef.current && !done && !paused) {
        const mt = moveTargetRef.current;
        const pulse = 0.55 + Math.sin(s.t * 0.18) * 0.18;
        ctx.strokeStyle = stage.accent;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mt.x, mt.y, 10 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Seekers + cones
      s.seekers.forEach((sk, i) => {
        const cfg = stage.seekers[i];
        const a1 = sk.angle - cfg.coneHalf;
        const a2 = sk.angle + cfg.coneHalf;
        const ax1 = sk.x + Math.cos(a1) * cfg.coneLen;
        const ay1 = sk.y + Math.sin(a1) * cfg.coneLen;
        const ax2 = sk.x + Math.cos(a2) * cfg.coneLen;
        const ay2 = sk.y + Math.sin(a2) * cfg.coneLen;
        const danger = s.inCone && s.blend < BLEND_SAFE;
        const coneColor = danger ? "#ff5050" : stage.accent;
        const grad = ctx.createRadialGradient(sk.x, sk.y, 10, sk.x, sk.y, cfg.coneLen);
        grad.addColorStop(0, `${coneColor}${danger ? "ee" : "cc"}`);
        grad.addColorStop(0.5, `${coneColor}${danger ? "77" : "55"}`);
        grad.addColorStop(1, `${coneColor}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sk.x, sk.y);
        ctx.lineTo(ax1, ay1);
        ctx.lineTo(ax2, ay2);
        ctx.closePath();
        ctx.fill();
      });

      // Obstacles (drawn ON TOP of cone so they visually block it)
      stage.obstacles.forEach((rc) => {
        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(rc.x + 4, rc.y + 6, rc.w, rc.h);
        // body
        const g = ctx.createLinearGradient(rc.x, rc.y, rc.x, rc.y + rc.h);
        g.addColorStop(0, "rgba(255,255,255,0.18)");
        g.addColorStop(1, "rgba(0,0,0,0.35)");
        ctx.fillStyle = "rgba(40,30,50,0.95)";
        ctx.fillRect(rc.x, rc.y, rc.w, rc.h);
        ctx.fillStyle = g;
        ctx.fillRect(rc.x, rc.y, rc.w, rc.h);
        ctx.strokeStyle = stage.accent;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rc.x + 0.5, rc.y + 0.5, rc.w - 1, rc.h - 1);
      });

      // Seeker sprites (drawn last among hazards)
      const sk = seekerImgRef.current;
      const skSize = 64;
      s.seekers.forEach((rt) => {
        if (sk) ctx.drawImage(sk, rt.x - skSize / 2, rt.y - skSize / 2, skSize, skSize);
        else { ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(rt.x, rt.y, 20, 0, Math.PI * 2); ctx.fill(); }
      });

      // Gems
      s.gems.forEach((g) => {
        if (g.taken) return;
        const bob = Math.sin(g.bob) * 4;
        const dist = Math.hypot(g.x - s.px, g.y - s.py);
        const inNear = dist < GEM_PROX_RADIUS;
        if (inNear) {
          const ready = s.blend >= BLEND_PICKUP;
          const pulse = 0.5 + Math.sin(s.t * 0.22) * 0.3;
          ctx.strokeStyle = ready ? "#7CFFB2" : "#ffffff";
          ctx.globalAlpha = ready ? 0.9 : 0.5;
          ctx.lineWidth = ready ? 3 : 2;
          ctx.setLineDash(ready ? [] : [4, 4]);
          ctx.beginPath();
          ctx.arc(g.x, g.y, GEM_PICKUP_RADIUS + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.ellipse(g.x, g.y + 12, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.save();
        ctx.translate(g.x, g.y + bob);
        ctx.fillStyle = stage.accent;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.shadowColor = stage.accent;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(8, 0); ctx.lineTo(0, 12); ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
      });

      // Chameleon
      {
        const blink = s.invuln > 0 && (s.t % 8 < 4);
        if (!blink) {
          const bodyColor = rgbCss(s.body);
          const palette = avatarPaletteRef.current;
          const accent2 = palette[1] ? rgbCss(palette[1]) : stage.accent;
          const accent3 = palette[2] ? rgbCss(palette[2]) : stage.accent;

          if (s.inCone && s.blend < BLEND_SAFE && s.invuln === 0) {
            const pulse = 0.5 + Math.sin(s.t * 0.4) * 0.4;
            ctx.strokeStyle = "#ff3a3a";
            ctx.lineWidth = 3;
            ctx.globalAlpha = pulse;
            ctx.beginPath(); ctx.arc(s.px, s.py + 2, 28, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.beginPath(); ctx.ellipse(s.px, s.py + 18, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = bodyColor;
          ctx.strokeStyle = "rgba(15,15,28,0.85)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(s.px, s.py + 4, 22, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

          ctx.save();
          ctx.beginPath(); ctx.ellipse(s.px, s.py + 4, 22, 17, 0, 0, Math.PI * 2); ctx.clip();
          ctx.fillStyle = accent2; ctx.globalAlpha = 0.55;
          ctx.beginPath(); ctx.ellipse(s.px - 2, s.py - 4, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.75; ctx.fillStyle = accent3;
          [[-10, -2], [4, -6], [10, 4], [-4, 8]].forEach(([dx, dy]) => {
            ctx.beginPath(); ctx.arc(s.px + dx, s.py + dy, 2.4, 0, Math.PI * 2); ctx.fill();
          });
          ctx.restore();

          ctx.beginPath();
          ctx.moveTo(s.px - 18, s.py + 6);
          ctx.quadraticCurveTo(s.px - 34, s.py + 18, s.px - 28, s.py + 24);
          ctx.quadraticCurveTo(s.px - 18, s.py + 16, s.px - 10, s.py + 14);
          ctx.fillStyle = bodyColor; ctx.fill(); ctx.stroke();
          ctx.fillStyle = accent2;
          ctx.beginPath(); ctx.arc(s.px - 30, s.py + 22, 3, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = bodyColor;
          [[-14, 12], [14, 12], [-12, -6], [12, -6]].forEach(([dx, dy]) => {
            ctx.beginPath(); ctx.ellipse(s.px + dx, s.py + dy + 8, 6, 5, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
          });

          const headX = s.px + 14, headY = s.py - 12, headR = 19;
          ctx.fillStyle = bodyColor;
          ctx.beginPath(); ctx.arc(headX, headY, headR + 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

          ctx.save();
          ctx.beginPath(); ctx.arc(headX, headY, headR - 2, 0, Math.PI * 2); ctx.clip();
          const av = avatarImgRef.current;
          if (av && av.complete && av.naturalWidth > 0) {
            const side = Math.min(av.naturalWidth, av.naturalHeight);
            const sx = (av.naturalWidth - side) / 2;
            const sy = (av.naturalHeight - side) / 2;
            ctx.drawImage(av, sx, sy, side, side, headX - headR, headY - headR, headR * 2, headR * 2);
          } else {
            ctx.fillStyle = bodyColor; ctx.fillRect(headX - headR, headY - headR, headR * 2, headR * 2);
          }
          ctx.globalAlpha = clamp(1 - s.blend, 0.15, 0.55) * 0.35;
          ctx.fillStyle = rgbCss(s.floor);
          ctx.fillRect(headX - headR, headY - headR, headR * 2, headR * 2);
          ctx.globalAlpha = 1;
          ctx.restore();
          ctx.strokeStyle = "rgba(15,15,28,0.7)";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(headX, headY, headR - 2, 0, Math.PI * 2); ctx.stroke();
        }

        if (s.painting) {
          ctx.strokeStyle = rgbCss(s.floor);
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.7 + Math.sin(s.t * 0.4) * 0.2;
          ctx.beginPath(); ctx.arc(s.px, s.py + 2, 26, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      s.particles.forEach((p) => {
        const a = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r ?? 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (s.pickupFlash > 0) {
        const a = (s.pickupFlash / 26) * 0.35;
        const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
        grad.addColorStop(0, `rgba(255,247,168,${a})`);
        grad.addColorStop(1, "rgba(255,247,168,0)");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      }
      if (s.perfectFlash > 0) {
        const a = (s.perfectFlash / 30) * 0.4;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (s.spottedFlash > 0) {
        const t = s.spottedFlash / 36;
        ctx.fillStyle = `rgba(255,60,60,${t * 0.55})`;
        ctx.fillRect(0, 0, W, H);
        const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.75);
        grad.addColorStop(0, "rgba(255,0,0,0)");
        grad.addColorStop(1, `rgba(120,0,0,${t * 0.8})`);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, done, stage, tutorialOpen]);

  function finishRound(won: boolean) {
    const s = stateRef.current;
    if (done) return;
    const timeLeftSec = Math.ceil(s.timeLeft / 60);
    const ms = Math.max(0, performance.now() - s.startedAt);
    const stats = {
      won,
      gems: s.gems.filter((g) => g.taken).length,
      hearts: s.hearts,
      perfectCount: s.perfectCount,
      timeLeftSec,
    };
    const score = computeScore(stats);
    setDone(won ? "win" : "lose");
    const { next, newBest } = recordRun(stage.id, { won, ms, score }, bests);
    setBests(next);
    setFinalStats({ ...stats, ms, score, newBest });
    if (won) sfxRef.current.win(); else sfxRef.current.lose();
  }

  const dpadPress = (k: string, v: boolean) => {
    setFocused(true); sfxRef.current.resume();
    if (v) moveTargetRef.current = null;
    keysRef.current[k] = v;
  };
  const paintPress = (v: boolean) => { setFocused(true); sfxRef.current.resume(); paintHoldRef.current = v; };

  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${stage.accent} 40%, transparent)`,
        background: "rgba(0,0,0,0.4)",
        boxShadow: `0 18px 60px -30px ${stage.accent}`,
      }}
    >
      {/* Top row: HUD */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[0.14em]">
          <span className="inline-flex items-center gap-1" style={{ color: stage.accent }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`size-3.5 ${i < hearts ? "fill-current" : "opacity-25"}`} />
            ))}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: `color-mix(in oklab, ${stage.accent} ${gemCount > 0 ? 22 : 10}%, transparent)`,
              color: stage.accent,
            }}>
            <Gem className="size-3.5" /> <span className="tabular-nums">{gemCount}</span>/3
          </span>
          <span className="inline-flex items-center gap-1 text-foreground/70">
            <Timer className="size-3.5" /> {timeLeft}s
          </span>
          {myBest.bestScore > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-foreground/75">
              <Trophy className="size-3" /> Best {myBest.bestScore} · {formatMs(myBest.bestMs)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAudioOn((a) => !a)} title={audioOn ? "Mute" : "Unmute"}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]">
            {audioOn ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
          </button>
          <button onClick={() => { setTutorialStep(0); setTutorialOpen(true); }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]">
            How to play
          </button>
          <button onClick={() => setPaused((p) => !p)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]">
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />} {paused ? "Resume" : "Pause"}
          </button>
          <button onClick={resetRound}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]">
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </div>

      {/* Blend + Stamina */}
      <div className="mb-2 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/70">
            <Eye className="size-3" /> Blend
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 transition-[width] duration-100"
              style={{
                width: `${blendPct}%`,
                background: `linear-gradient(90deg, ${bodyCss}, ${stage.accent})`,
                boxShadow: `0 0 12px ${stage.accent}`,
              }} />
            <div className="absolute inset-y-0" style={{ left: "72%", width: 2, background: "rgba(124,255,178,0.7)" }} title="gem pickup" />
            <div className="absolute inset-y-0" style={{ left: "78%", width: 2, background: "rgba(255,255,255,0.55)" }} title="safe from seeker" />
            <div className="absolute inset-y-0" style={{ left: "85%", width: 2, background: "rgba(255,247,168,0.95)" }} title="perfect blend" />
          </div>
          <span className="w-9 text-right text-[10px] font-black tabular-nums"
            style={{ color: blendPct >= 85 ? "#fff7a8" : blendPct >= 78 ? stage.accent : blendPct < 30 ? "#ff7a7a" : "rgb(255,255,255,0.7)" }}>
            {blendPct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/70">
            <Zap className="size-3" /> Stamina
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 transition-[width] duration-100"
              style={{
                width: `${stamPct}%`,
                background: stamPct < 25 ? "linear-gradient(90deg, #ff6b6b, #ff9a3c)" : "linear-gradient(90deg, #7CFFB2, #22d3ee)",
              }} />
          </div>
          <span className="w-9 text-right text-[10px] font-black tabular-nums text-foreground/70">{stamPct}%</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={wrapRef}
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onPointerDown={onPointer}
        onPointerMove={(e) => { if (e.buttons) onPointer(e); }}
        className={`relative overflow-hidden rounded-xl border outline-none focus:ring-2 ${spotted ? "ring-2 ring-red-500 animate-pulse" : ""}`}
        style={{
          aspectRatio: "1 / 1",
          touchAction: "none",
          borderColor: `color-mix(in oklab, ${stage.accent} 40%, transparent)`,
        }}
      >
        <canvas ref={canvasRef} width={W} height={H} className="block h-full w-full" />

        {!done && !paused && !tutorialOpen && nearGem && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl"
            style={{
              background: pickupReady ? "rgba(124,255,178,0.95)" : "rgba(0,0,0,0.7)",
              color: pickupReady ? "#0a2a18" : "#fff",
              border: pickupReady ? "1px solid #7CFFB2" : "1px solid rgba(255,255,255,0.25)",
            }}>
            {pickupReady ? "✓ Walk over the gem!" : `Need ${Math.round(BLEND_PICKUP * 100)}% blend (you: ${blendPct}%)`}
          </div>
        )}

        {!done && !paused && !tutorialOpen && stamPct < 20 && (
          <div className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-orange-500/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
            ⚡ Low stamina — let go to refill
          </div>
        )}

        {spotted && (
          <div className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 rounded-full bg-red-500 px-4 py-1.5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-2xl animate-pulse">
            ✗ Spotted! −1 ♥
          </div>
        )}

        {done && finalStats && (
          <div className="absolute inset-0 grid place-items-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border px-6 py-5 text-center"
              style={{
                borderColor: finalStats.won ? stage.accent : "#ef4444",
                background: `linear-gradient(135deg, color-mix(in oklab, ${finalStats.won ? stage.accent : "#ef4444"} 22%, var(--background) 78%), color-mix(in oklab, ${finalStats.won ? stage.accent : "#ef4444"} 10%, var(--background) 90%))`,
              }}>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: finalStats.won ? stage.accent : "#ef4444" }}>
                {finalStats.won ? "✦ You blended in!" : "✦ Spotted out"}
              </p>
              <p className="mt-1 text-lg font-black">{stage.name} — {stage.flavor.split(" · ")[0]}</p>
              {finalStats.newBest && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-300/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-950">
                  <Sparkles className="size-3" /> New best!
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="rounded-lg bg-white/[0.05] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-foreground/55">Time</p>
                  <p className="font-black tabular-nums">{formatMs(finalStats.ms)}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-foreground/55">Style score</p>
                  <p className="font-black tabular-nums" style={{ color: stage.accent }}>{finalStats.score}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-foreground/55">Gems</p>
                  <p className="font-black tabular-nums">{finalStats.gems}/3 {finalStats.perfectCount > 0 && <span className="text-yellow-300">· {finalStats.perfectCount}× perfect</span>}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-foreground/55">Hearts</p>
                  <p className="font-black tabular-nums">{finalStats.hearts}/3</p>
                </div>
              </div>
              {finalStats.won && prevStage("hexx") && (() => {
                const nextId: SampleId | null = stage.id === "nova" ? "mochi" : stage.id === "mochi" ? "hexx" : null;
                if (nextId) {
                  return (
                    <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: stage.accent }}>
                      ✦ {STAGES[nextId].name} stage unlocked
                    </p>
                  );
                }
                return null;
              })()}
              <button onClick={resetRound}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white hover:opacity-90"
                style={{ background: finalStats.won ? stage.accent : "#ef4444" }}>
                <RotateCcw className="size-3" /> Play again
              </button>
            </div>
          </div>
        )}

        {paused && !done && !tutorialOpen && (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <p className="rounded-lg bg-background/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]">Paused</p>
          </div>
        )}

        {tutorialOpen && !done && (
          <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-[min(420px,100%)] rounded-2xl border bg-background/95 p-5 text-center"
              style={{ borderColor: stage.accent, boxShadow: `0 18px 60px -20px ${stage.accent}` }}>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: stage.accent }}>
                How to play · {tutorialStep + 1}/{TUTORIAL_STEPS.length + 1}
              </p>
              {tutorialStep < TUTORIAL_STEPS.length ? (
                <>
                  <p className="mt-2 text-base font-black">{TUTORIAL_STEPS[tutorialStep].title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{TUTORIAL_STEPS[tutorialStep].body}</p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-base font-black">{stage.name} stage tip</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{stage.hint}</p>
                </>
              )}
              <div className="mt-3 flex justify-center gap-1.5">
                {Array.from({ length: TUTORIAL_STEPS.length + 1 }).map((_, i) => (
                  <span key={i} className="h-1.5 w-6 rounded-full"
                    style={{ background: i <= tutorialStep ? stage.accent : "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button onClick={() => { sfxRef.current.tap(); setTutorialOpen(false); }}
                  className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/60 hover:text-foreground/90">
                  Skip
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { if (window.confirm("Reset best scores & unlock progress?")) setBests(resetBests()); }}
                    className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/40 hover:text-foreground/70">
                    Reset records
                  </button>
                  <button
                    onClick={() => {
                      sfxRef.current.tap();
                      if (tutorialStep >= TUTORIAL_STEPS.length) { setTutorialOpen(false); }
                      else { setTutorialStep((s) => s + 1); if (tutorialStep + 1 === TUTORIAL_STEPS.length) { /* show hint next */ } }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white"
                    style={{ background: stage.accent }}>
                    {tutorialStep >= TUTORIAL_STEPS.length ? "Start playing" : "Next"} <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!focused && !done && !paused && !tutorialOpen && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <div className="flex flex-col items-center gap-2 rounded-2xl border bg-black/85 px-5 py-4 text-center"
              style={{ borderColor: stage.accent }}>
              <Paintbrush className="size-6" style={{ color: stage.accent }} />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white">Click or press a key to play</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                WASD / Arrows · Hold SPACE to paint · Tap to move
              </p>
            </div>
          </div>
        )}
      </div>

      {touch && (
        <div className="mt-3 flex items-center justify-between gap-4 select-none">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <DpadBtn accent={stage.accent} onDown={() => dpadPress("arrowup", true)} onUp={() => dpadPress("arrowup", false)}>↑</DpadBtn>
            <div />
            <DpadBtn accent={stage.accent} onDown={() => dpadPress("arrowleft", true)} onUp={() => dpadPress("arrowleft", false)}>←</DpadBtn>
            <div />
            <DpadBtn accent={stage.accent} onDown={() => dpadPress("arrowright", true)} onUp={() => dpadPress("arrowright", false)}>→</DpadBtn>
            <div />
            <DpadBtn accent={stage.accent} onDown={() => dpadPress("arrowdown", true)} onUp={() => dpadPress("arrowdown", false)}>↓</DpadBtn>
            <div />
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); paintPress(true); }}
            onPointerUp={() => paintPress(false)}
            onPointerLeave={() => paintPress(false)}
            onPointerCancel={() => paintPress(false)}
            className="grid size-20 place-items-center rounded-full border-2 text-xs font-black uppercase tracking-[0.16em] active:scale-95"
            style={{
              borderColor: stage.accent, color: stage.accent,
              background: `color-mix(in oklab, ${stage.accent} 20%, transparent)`,
              boxShadow: `0 0 24px -4px ${stage.accent}`,
            }}>
            <Paintbrush className="size-5" /> Paint
          </button>
        </div>
      )}

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {stage.flavor} · {stage.hint}
      </p>
    </div>
  );
}

function DpadBtn({ children, onDown, onUp, accent }: { children: React.ReactNode; onDown: () => void; onUp: () => void; accent: string }) {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onDown(); }}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      className="grid size-11 place-items-center rounded-lg border bg-white/[0.06] text-base font-black active:scale-95"
      style={{ borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`, color: accent }}
    >
      {children}
    </button>
  );
}
