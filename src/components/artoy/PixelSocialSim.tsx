import { useEffect, useRef, useState } from "react";
import { Heart, Gem, Pause, Play, RotateCcw, Paintbrush, Eye, Timer, ChevronRight, Gamepad2, Volume2, VolumeX } from "lucide-react";
import novaBg from "@/assets/artoy/sim/nova-paint-bg.png";
import novaSeeker from "@/assets/artoy/sim/nova-seeker.png";
import mochiBg from "@/assets/artoy/sim/mochi-paint-bg.png";
import mochiSeeker from "@/assets/artoy/sim/mochi-seeker.png";
import hexxBg from "@/assets/artoy/sim/hexx-paint-bg.png";
import hexxSeeker from "@/assets/artoy/sim/hexx-seeker.png";

export type SampleId = "nova" | "mochi" | "hexx";

type Props = { avatarSrc: string | null; sampleId?: SampleId | null };

const W = 640;
const H = 640;

type SceneDef = {
  bg: string;
  seeker: string;
  accent: string;
  title: string;
  flavor: string;
};

const SCENES: Record<SampleId, SceneDef> = {
  nova:  { bg: novaBg,  seeker: novaSeeker,  accent: "#22d3ee", title: "Nova stage",  flavor: "Cyan plaza · sci-fi pilot" },
  mochi: { bg: mochiBg, seeker: mochiSeeker, accent: "#ff5fa8", title: "Mochi stage", flavor: "Pink town · pastel mascot" },
  hexx:  { bg: hexxBg,  seeker: hexxSeeker,  accent: "#fb923c", title: "Hexx stage",  flavor: "Arcade alley · neon punk" },
};

type RGB = [number, number, number];
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r?: number };
type Gem = { x: number; y: number; taken: boolean; bob: number };

const ROUND_SECONDS = 60;
const PLAYER_RADIUS = 16;
const GEM_PICKUP_RADIUS = 24;
const GEM_PROX_RADIUS = 90;
const BLEND_PICKUP = 0.72;
const BLEND_SAFE = 0.78;

const GEMS_INIT = (): Gem[] => [
  { x: 130, y: 180, taken: false, bob: 0 },
  { x: 510, y: 200, taken: false, bob: 1.2 },
  { x: 320, y: 500, taken: false, bob: 2.4 },
];

const TUTORIAL_STEPS = [
  { title: "Welcome, chameleon!", body: "You start pure white — easy to spot. Use WASD / Arrows (or tap) to move around the stage." },
  { title: "Paint to blend", body: "Stand on a colored patch and HOLD SPACE (or the Paint button) to soak that color into your body." },
  { title: "Watch the Blend Meter", body: "When the meter passes the white line (78%), you become invisible inside the Seeker's beam." },
  { title: "Grab the 3 paint gems", body: "Walk over a glowing gem with at least 72% blend to collect it. Get all 3 — or survive 60s — to win." },
  { title: "Avoid the Seeker beam", body: "If the Seeker spots you with low blend, you lose a heart and your paint washes off. 0 hearts = round over." },
];

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

function pointInTriangle(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

// ---------- Audio (tiny synth) ----------
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
    danger: () => { tone(660, 0.07, "square", 0.05); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, "triangle", 0.09), i * 110)); },
    lose: () => { [330, 247, 175].forEach((f, i) => setTimeout(() => tone(f, 0.22, "sawtooth", 0.10), i * 140)); },
    tap: () => { tone(720, 0.04, "sine", 0.04); },
    resume: () => { ensure(); },
  };
}

export function PixelSocialSim({ avatarSrc, sampleId }: Props) {
  // Gate: don't render the engine until a character is picked.
  if (!sampleId) {
    return (
      <div className="rounded-2xl border border-border bg-white/[0.03] p-8 text-center">
        <Gamepad2 className="mx-auto size-7 text-foreground/40" />
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/70">
          Pick a character above to load the playable mini-game
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          3 templates · Nova / Mochi / Hexx · each builds its own Meccha Chameleon stage
        </p>
      </div>
    );
  }

  const activeId: SampleId = sampleId;
  const scene = SCENES[activeId];

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

  const stateRef = useRef({
    px: W / 2, py: H - 80,
    vx: 0, vy: 0,
    body: [255, 255, 255] as RGB,
    floor: [255, 255, 255] as RGB,
    blend: 0,
    seekerAngle: Math.PI / 2,
    seekerCx: 120,
    seekerCy: 90,
    seekerDir: 1,
    spottedFlash: 0,
    invuln: 0,
    shake: 0,
    pickupFlash: 0,
    dangerPulse: 0,
    particles: [] as Particle[],
    gems: GEMS_INIT(),
    t: 0,
    timeLeft: ROUND_SECONDS * 60,
    hearts: 3,
    painting: false,
    inCone: false,
  });

  const [hearts, setHearts] = useState(3);
  const [gemCount, setGemCount] = useState(0);
  const [blendPct, setBlendPct] = useState(0);
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

  // Reset tutorial when character changes
  useEffect(() => {
    setTutorialOpen(true);
    setTutorialStep(0);
  }, [activeId]);

  // Load scene assets + reset
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
    bg.src = scene.bg;
    const sk = new Image();
    sk.onload = () => { seekerImgRef.current = sk; };
    sk.src = scene.seeker;

    resetRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (!avatarSrc) { avatarImgRef.current = null; avatarPaletteRef.current = []; return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      avatarImgRef.current = img;
      // Extract a 3-color palette: dominant body, secondary, accent.
      try {
        const sz = 48;
        const off = document.createElement("canvas");
        off.width = sz; off.height = sz;
        const oc = off.getContext("2d", { willReadFrequently: true });
        if (oc) {
          oc.drawImage(img, 0, 0, sz, sz);
          const data = oc.getImageData(0, 0, sz, sz).data;
          // Bucket by 5-bit RGB (32^3) → count weighted by saturation.
          const buckets = new Map<number, { r: number; g: number; b: number; n: number; w: number }>();
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 200) continue;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max < 28 || max > 245) continue; // skip near-black / near-white
            const sat = (max - min) / (max || 1);
            const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
            const e = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, w: 0 };
            e.r += r; e.g += g; e.b += b; e.n += 1; e.w += 1 + sat * 2;
            buckets.set(key, e);
          }
          const top = [...buckets.values()].sort((a, b) => b.w - a.w).slice(0, 8);
          // De-duplicate visually similar entries.
          const palette: RGB[] = [];
          for (const e of top) {
            const c: RGB = [e.r / e.n, e.g / e.n, e.b / e.n];
            if (palette.every((p) => colorDistance(p, c) > 60)) palette.push(c);
            if (palette.length >= 3) break;
          }
          avatarPaletteRef.current = palette;
          // Seed body color so the chameleon "is" the character, not a white blob.
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

  // Global keyboard listeners
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

  const resetRound = () => {
    const base: RGB = avatarPaletteRef.current[0] ?? [255, 255, 255];
    stateRef.current = {
      px: W / 2, py: H - 80,
      vx: 0, vy: 0,
      body: [...base] as RGB,
      floor: [255, 255, 255],
      blend: 0,
      seekerAngle: Math.PI / 2,
      seekerCx: 120, seekerCy: 90, seekerDir: 1,
      spottedFlash: 0, invuln: 0, shake: 0, pickupFlash: 0, dangerPulse: 0,
      particles: [],
      gems: GEMS_INIT(),
      t: 0,
      timeLeft: ROUND_SECONDS * 60,
      hearts: 3,
      painting: false,
      inCone: false,
    };
    moveTargetRef.current = null;
    setHearts(3);
    setGemCount(0);
    setBlendPct(0);
    setTimeLeft(ROUND_SECONDS);
    setBodyCss(rgbCss(base));
    setDone(null);
    setSpotted(false);
    setNearGem(false);
    setPickupReady(false);
    setPaused(false);
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
        if (ax || ay) {
          moveTargetRef.current = null;
        } else if (moveTargetRef.current) {
          const dx = moveTargetRef.current.x - s.px;
          const dy = moveTargetRef.current.y - s.py;
          const dist = Math.hypot(dx, dy);
          if (dist < 6) {
            moveTargetRef.current = null;
          } else {
            ax = dx / dist;
            ay = dy / dist;
          }
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

        // Sample floor color under feet
        const sc = samplerCtxRef.current;
        if (sc) {
          try {
            const d = sc.getImageData(s.px | 0, (s.py + 6) | 0, 1, 1).data;
            s.floor = [d[0], d[1], d[2]];
          } catch { /* same-origin */ }
        }

        // Paint
        s.painting = paintHoldRef.current;
        if (s.painting) {
          s.body = lerpColor(s.body, s.floor, 0.12);
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
        }

        // Blend %
        const dC = colorDistance(s.body, s.floor);
        const blend = clamp(1 - dC / 220, 0, 1);
        s.blend = blend;

        // Seeker patrol
        s.seekerCx += 0.9 * s.seekerDir;
        if (s.seekerCx > W - 90) s.seekerDir = -1;
        if (s.seekerCx < 90) s.seekerDir = 1;
        s.seekerAngle = Math.PI / 2 + Math.sin(s.t * 0.018) * 0.9;

        const coneLen = 360;
        const coneHalf = 0.55;
        const a1 = s.seekerAngle - coneHalf;
        const a2 = s.seekerAngle + coneHalf;
        const ax1 = s.seekerCx + Math.cos(a1) * coneLen;
        const ay1 = s.seekerCy + Math.sin(a1) * coneLen;
        const ax2 = s.seekerCx + Math.cos(a2) * coneLen;
        const ay2 = s.seekerCy + Math.sin(a2) * coneLen;

        const inCone = pointInTriangle(s.px, s.py, s.seekerCx, s.seekerCy, ax1, ay1, ax2, ay2);
        s.inCone = inCone;

        // Danger warning audio: in cone with low blend → soft pulse
        if (inCone && blend < BLEND_SAFE && s.invuln === 0) {
          s.dangerPulse += 1;
          if (s.dangerPulse % 22 === 0) sfxRef.current.danger();
        } else {
          s.dangerPulse = 0;
        }

        // Detection
        if (s.invuln > 0) s.invuln -= 1;
        if (inCone && blend < BLEND_SAFE && s.invuln === 0) {
          s.hearts -= 1;
          s.spottedFlash = 36;
          s.shake = 18;
          s.invuln = 90;
          s.body = [...(avatarPaletteRef.current[0] ?? [255, 255, 255])] as RGB;
          setHearts(s.hearts);
          setSpotted(true);
          sfxRef.current.spotted();
          // big spotted ring particles
          for (let i = 0; i < 22; i++) {
            const a = (Math.PI * 2 * i) / 22;
            s.particles.push({
              x: s.px, y: s.py,
              vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2,
              life: 0, max: 38, color: "#ff5050", r: 3.5,
            });
          }
          setTimeout(() => setSpotted(false), 750);
          const dx = s.px - s.seekerCx;
          const dy = s.py - s.seekerCy;
          const m = Math.hypot(dx, dy) || 1;
          s.vx += (dx / m) * 4;
          s.vy += (dy / m) * 4;
          if (s.hearts <= 0) {
            setDone("lose");
            sfxRef.current.lose();
          }
        }
        if (s.spottedFlash > 0) s.spottedFlash -= 1;
        if (s.shake > 0) s.shake -= 1;
        if (s.pickupFlash > 0) s.pickupFlash -= 1;

        // Gems
        let near = false;
        let ready = false;
        s.gems.forEach((g) => {
          g.bob += 0.08;
          if (g.taken) return;
          const dist = Math.hypot(g.x - s.px, g.y - s.py);
          if (dist < GEM_PROX_RADIUS) {
            near = true;
            if (blend >= BLEND_PICKUP) ready = true;
          }
          if (dist < GEM_PICKUP_RADIUS && blend > BLEND_PICKUP) {
            g.taken = true;
            s.pickupFlash = 26;
            sfxRef.current.gem();
            for (let i = 0; i < 22; i++) {
              const a = (Math.PI * 2 * i) / 22;
              s.particles.push({
                x: g.x, y: g.y,
                vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6,
                life: 0, max: 46, color: scene.accent, r: 3,
              });
            }
            // gold sparkles
            for (let i = 0; i < 10; i++) {
              s.particles.push({
                x: g.x + (Math.random() - 0.5) * 20,
                y: g.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 1.6, vy: -1 - Math.random() * 1.4,
                life: 0, max: 50, color: "#fff7a8", r: 2,
              });
            }
            const taken = s.gems.filter((x) => x.taken).length;
            setGemCount(taken);
            if (taken >= s.gems.length) {
              setDone("win");
              sfxRef.current.win();
            }
          }
        });
        setNearGem(near);
        setPickupReady(ready);

        // Timer
        s.timeLeft -= 1;
        if (s.timeLeft <= 0) {
          setDone("win");
          sfxRef.current.win();
          s.timeLeft = 0;
        }

        // Particles
        s.particles = s.particles.filter((p) => {
          p.life += 1;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          return p.life < p.max;
        });

        if (s.t % 4 === 0) {
          setBlendPct(Math.round(blend * 100));
          setBodyCss(rgbCss(s.body));
          setTimeLeft(Math.ceil(s.timeLeft / 60));
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

      // s already declared at top of step()

      // Move target ring
      if (moveTargetRef.current && !done && !paused) {
        const mt = moveTargetRef.current;
        const pulse = 0.55 + Math.sin(s.t * 0.18) * 0.18;
        ctx.strokeStyle = scene.accent;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mt.x, mt.y, 10 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Seeker cone
      {
        const coneLen = 360;
        const coneHalf = 0.55;
        const a1 = s.seekerAngle - coneHalf;
        const a2 = s.seekerAngle + coneHalf;
        const ax1 = s.seekerCx + Math.cos(a1) * coneLen;
        const ay1 = s.seekerCy + Math.sin(a1) * coneLen;
        const ax2 = s.seekerCx + Math.cos(a2) * coneLen;
        const ay2 = s.seekerCy + Math.sin(a2) * coneLen;
        const danger = s.inCone && s.blend < BLEND_SAFE;
        const coneColor = danger ? "#ff5050" : scene.accent;
        const grad = ctx.createRadialGradient(s.seekerCx, s.seekerCy, 10, s.seekerCx, s.seekerCy, coneLen);
        grad.addColorStop(0, `${coneColor}${danger ? "ee" : "cc"}`);
        grad.addColorStop(0.5, `${coneColor}${danger ? "77" : "55"}`);
        grad.addColorStop(1, `${coneColor}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(s.seekerCx, s.seekerCy);
        ctx.lineTo(ax1, ay1);
        ctx.lineTo(ax2, ay2);
        ctx.closePath();
        ctx.fill();

        const sk = seekerImgRef.current;
        const skSize = 64;
        if (sk) ctx.drawImage(sk, s.seekerCx - skSize / 2, s.seekerCy - skSize / 2, skSize, skSize);
        else { ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(s.seekerCx, s.seekerCy, 20, 0, Math.PI * 2); ctx.fill(); }
      }

      // Gems
      s.gems.forEach((g) => {
        if (g.taken) return;
        const bob = Math.sin(g.bob) * 4;
        const dist = Math.hypot(g.x - s.px, g.y - s.py);
        const near = dist < GEM_PROX_RADIUS;
        // proximity ring
        if (near) {
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
        ctx.fillStyle = scene.accent;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.shadowColor = scene.accent;
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
          // danger outline if in cone & low blend
          if (s.inCone && s.blend < BLEND_SAFE && s.invuln === 0) {
            const pulse = 0.5 + Math.sin(s.t * 0.4) * 0.4;
            ctx.strokeStyle = "#ff3a3a";
            ctx.lineWidth = 3;
            ctx.globalAlpha = pulse;
            ctx.beginPath(); ctx.arc(s.px, s.py + 2, 26, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = "rgba(0,0,0,0.42)";
          ctx.beginPath(); ctx.ellipse(s.px, s.py + 14, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = bodyColor;
          ctx.strokeStyle = "rgba(15,15,28,0.85)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(s.px, s.py + 2, 18, 14, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s.px - 14, s.py + 4);
          ctx.quadraticCurveTo(s.px - 28, s.py + 16, s.px - 22, s.py + 22);
          ctx.quadraticCurveTo(s.px - 14, s.py + 14, s.px - 8, s.py + 12);
          ctx.fillStyle = bodyColor;
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = bodyColor;
          [[-12,12],[12,12],[-10,-6],[10,-6]].forEach(([dx, dy]) => {
            ctx.beginPath();
            ctx.ellipse(s.px + dx, s.py + dy + 6, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
          });
          const headX = s.px + 8;
          const headY = s.py - 10;
          const headR = 14;
          ctx.fillStyle = bodyColor;
          ctx.beginPath(); ctx.arc(headX, headY, headR + 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.save();
          ctx.beginPath(); ctx.arc(headX, headY, headR - 1, 0, Math.PI * 2); ctx.clip();
          const av = avatarImgRef.current;
          if (av && av.complete && av.naturalWidth > 0) {
            const side = Math.min(av.naturalWidth, av.naturalHeight);
            const sx = (av.naturalWidth - side) / 2;
            const sy = (av.naturalHeight - side) / 2;
            ctx.drawImage(av, sx, sy, side, side, headX - headR, headY - headR, headR * 2, headR * 2);
          } else {
            ctx.fillStyle = "#fff";
            ctx.fillRect(headX - headR, headY - headR, headR * 2, headR * 2);
          }
          ctx.restore();
          ctx.fillStyle = "#0a0a14";
          ctx.beginPath(); ctx.arc(headX + 8, headY - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        }

        if (s.painting) {
          ctx.strokeStyle = rgbCss(s.floor);
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.7 + Math.sin(s.t * 0.4) * 0.2;
          ctx.beginPath(); ctx.arc(s.px, s.py + 2, 24, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Particles
      s.particles.forEach((p) => {
        const a = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r ?? 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Pickup gold flash
      if (s.pickupFlash > 0) {
        const a = (s.pickupFlash / 26) * 0.35;
        const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
        grad.addColorStop(0, `rgba(255,247,168,${a})`);
        grad.addColorStop(1, "rgba(255,247,168,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Spotted flash + vignette
      if (s.spottedFlash > 0) {
        const t = s.spottedFlash / 36;
        ctx.fillStyle = `rgba(255,60,60,${t * 0.55})`;
        ctx.fillRect(0, 0, W, H);
        const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.75);
        grad.addColorStop(0, "rgba(255,0,0,0)");
        grad.addColorStop(1, `rgba(120,0,0,${t * 0.8})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, done, scene.accent, tutorialOpen]);

  const dpadPress = (k: string, v: boolean) => {
    setFocused(true);
    sfxRef.current.resume();
    if (v) moveTargetRef.current = null;
    keysRef.current[k] = v;
  };

  const paintPress = (v: boolean) => {
    setFocused(true);
    sfxRef.current.resume();
    paintHoldRef.current = v;
  };

  const advanceTutorial = () => {
    sfxRef.current.tap();
    if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
      setTutorialOpen(false);
    } else {
      setTutorialStep((s) => s + 1);
    }
  };

  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${scene.accent} 40%, transparent)`,
        background: "rgba(0,0,0,0.4)",
        boxShadow: `0 18px 60px -30px ${scene.accent}`,
      }}
    >
      {/* HUD */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.14em]">
          <span className="inline-flex items-center gap-1" style={{ color: scene.accent }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`size-3.5 ${i < hearts ? "fill-current" : "opacity-25"}`} />
            ))}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: `color-mix(in oklab, ${scene.accent} ${gemCount > 0 ? 22 : 10}%, transparent)`,
              color: scene.accent,
            }}
          >
            <Gem className="size-3.5" /> <span className="tabular-nums">{gemCount}</span>/3 gems
          </span>
          <span className="inline-flex items-center gap-1 text-foreground/70">
            <Timer className="size-3.5" /> {timeLeft}s
          </span>
          <span className="hidden md:inline text-[10px] uppercase tracking-[0.14em] text-foreground/60">
            · {scene.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/60">
            WASD/Arrows · Hold SPACE to paint
          </span>
          <button
            onClick={() => { setAudioOn((a) => !a); }}
            title={audioOn ? "Mute" : "Unmute"}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]"
          >
            {audioOn ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
          </button>
          <button
            onClick={() => { setTutorialStep(0); setTutorialOpen(true); }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]"
          >
            How to play
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]"
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />} {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={resetRound}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </div>

      {/* Blend meter */}
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/70">
          <Eye className="size-3" /> Blend
        </span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-100"
            style={{
              width: `${blendPct}%`,
              background: `linear-gradient(90deg, ${bodyCss}, ${scene.accent})`,
              boxShadow: `0 0 12px ${scene.accent}`,
            }}
          />
          <div className="absolute inset-y-0" style={{ left: "72%", width: 2, background: "rgba(124,255,178,0.7)" }} title="gem pickup" />
          <div className="absolute inset-y-0" style={{ left: "78%", width: 2, background: "rgba(255,255,255,0.55)" }} title="safe from seeker" />
        </div>
        <span
          className="w-10 text-right text-[10px] font-black tabular-nums"
          style={{ color: blendPct >= 78 ? scene.accent : blendPct < 30 ? "#ff7a7a" : "rgb(255,255,255,0.7)" }}
        >
          {blendPct}%
        </span>
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
          borderColor: `color-mix(in oklab, ${scene.accent} 40%, transparent)`,
        }}
      >
        <canvas ref={canvasRef} width={W} height={H} className="block h-full w-full" />

        {/* Proximity guidance */}
        {!done && !paused && !tutorialOpen && nearGem && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl"
            style={{
              background: pickupReady ? "rgba(124,255,178,0.95)" : "rgba(0,0,0,0.7)",
              color: pickupReady ? "#0a2a18" : "#fff",
              border: pickupReady ? "1px solid #7CFFB2" : "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {pickupReady ? "✓ Walk over the gem to collect!" : `Near gem · need ${Math.round(BLEND_PICKUP * 100)}% blend (you: ${blendPct}%)`}
          </div>
        )}

        {/* Low-blend warning */}
        {!done && !paused && !tutorialOpen && blendPct < 30 && !nearGem && (
          <div className="pointer-events-none absolute left-3 bottom-3 rounded-md bg-red-500/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
            ! Low blend — hold SPACE on a colored patch
          </div>
        )}

        {spotted && (
          <div className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 rounded-full bg-red-500 px-4 py-1.5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-2xl animate-pulse">
            ✗ Spotted! −1 ♥
          </div>
        )}

        {done && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
            <div
              className="rounded-2xl border px-6 py-5 text-center"
              style={{
                borderColor: done === "win" ? scene.accent : "#ef4444",
                background: `linear-gradient(135deg, color-mix(in oklab, ${done === "win" ? scene.accent : "#ef4444"} 24%, var(--background) 76%), color-mix(in oklab, ${done === "win" ? scene.accent : "#ef4444"} 12%, var(--background) 88%))`,
              }}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: done === "win" ? scene.accent : "#ef4444" }}>
                {done === "win" ? "✦ You blended in!" : "✦ Spotted out"}
              </p>
              <p className="mt-1.5 text-lg font-black">
                {done === "win" ? `Meccha Chameleon mastered ${scene.title}` : "Try painting faster next round"}
              </p>
              <p className="mt-1 text-xs text-foreground/70">Gems collected: {gemCount}/3</p>
              <button
                onClick={resetRound}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white hover:opacity-90"
                style={{ background: done === "win" ? scene.accent : "#ef4444" }}
              >
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

        {/* Tutorial overlay */}
        {tutorialOpen && !done && (
          <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-sm">
            <div
              className="w-[min(420px,92%)] rounded-2xl border bg-background/95 p-5 text-center"
              style={{ borderColor: scene.accent, boxShadow: `0 18px 60px -20px ${scene.accent}` }}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: scene.accent }}>
                How to play · {tutorialStep + 1}/{TUTORIAL_STEPS.length}
              </p>
              <p className="mt-2 text-base font-black">{TUTORIAL_STEPS[tutorialStep].title}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{TUTORIAL_STEPS[tutorialStep].body}</p>

              <div className="mt-3 flex justify-center gap-1.5">
                {TUTORIAL_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-6 rounded-full"
                    style={{ background: i <= tutorialStep ? scene.accent : "rgba(255,255,255,0.18)" }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => { sfxRef.current.tap(); setTutorialOpen(false); }}
                  className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/60 hover:text-foreground/90"
                >
                  Skip
                </button>
                <button
                  onClick={advanceTutorial}
                  className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white"
                  style={{ background: scene.accent }}
                >
                  {tutorialStep >= TUTORIAL_STEPS.length - 1 ? "Start playing" : "Next"} <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!focused && !done && !paused && !tutorialOpen && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <div
              className="flex flex-col items-center gap-2 rounded-2xl border bg-black/85 px-5 py-4 text-center"
              style={{ borderColor: scene.accent }}
            >
              <Paintbrush className="size-6" style={{ color: scene.accent }} />
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
            <DpadBtn accent={scene.accent} onDown={() => dpadPress("arrowup", true)} onUp={() => dpadPress("arrowup", false)}>↑</DpadBtn>
            <div />
            <DpadBtn accent={scene.accent} onDown={() => dpadPress("arrowleft", true)} onUp={() => dpadPress("arrowleft", false)}>←</DpadBtn>
            <div />
            <DpadBtn accent={scene.accent} onDown={() => dpadPress("arrowright", true)} onUp={() => dpadPress("arrowright", false)}>→</DpadBtn>
            <div />
            <DpadBtn accent={scene.accent} onDown={() => dpadPress("arrowdown", true)} onUp={() => dpadPress("arrowdown", false)}>↓</DpadBtn>
            <div />
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); paintPress(true); }}
            onPointerUp={() => paintPress(false)}
            onPointerLeave={() => paintPress(false)}
            onPointerCancel={() => paintPress(false)}
            className="grid size-20 place-items-center rounded-full border-2 text-xs font-black uppercase tracking-[0.16em] active:scale-95"
            style={{
              borderColor: scene.accent,
              color: scene.accent,
              background: `color-mix(in oklab, ${scene.accent} 20%, transparent)`,
              boxShadow: `0 0 24px -4px ${scene.accent}`,
            }}
          >
            <Paintbrush className="size-5" />
            Paint
          </button>
        </div>
      )}

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {scene.flavor} · paint to ≥72% to grab gems · ≥78% hides you from the seeker beam
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
