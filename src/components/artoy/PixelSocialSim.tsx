import { useEffect, useRef, useState } from "react";
import { Heart, Coins, Pause, Play, RotateCcw, MessageCircle, MousePointerClick } from "lucide-react";
import novaBg from "@/assets/artoy/sim/nova-bg.png";
import novaNpcs from "@/assets/artoy/sim/nova-npcs.png";
import mochiBg from "@/assets/artoy/sim/mochi-bg.png";
import mochiNpcs from "@/assets/artoy/sim/mochi-npcs.png";
import hexxBg from "@/assets/artoy/sim/hexx-bg.png";
import hexxNpcs from "@/assets/artoy/sim/hexx-npcs.png";

export type SampleId = "nova" | "mochi" | "hexx";

type Props = { avatarSrc: string | null; sampleId?: SampleId | null };

// Logical canvas (matches bg aspect, displayed responsively).
const W = 640;
const H = 640;

type Rect = { x: number; y: number; w: number; h: number };
type SpriteRect = Rect;

// Source rects in the sprite strip (1920x1080, 4 cells horizontally).
const SPR_A: SpriteRect = { x: 120, y: 300, w: 330, h: 620 };
const SPR_B: SpriteRect = { x: 580, y: 290, w: 320, h: 640 };
const SPR_C: SpriteRect = { x: 1050, y: 280, w: 360, h: 640 };
const SPR_COIN: SpriteRect = { x: 1530, y: 400, w: 360, h: 360 };

// World colliders calibrated to the baked plaza backgrounds (logical 640x640 space).
const COLLIDERS: Rect[] = [
  { x: 28, y: 100, w: 170, h: 200 },
  { x: 215, y: 70, w: 210, h: 220 },
  { x: 440, y: 100, w: 175, h: 200 },
  { x: 268, y: 410, w: 104, h: 90 },
  { x: 10, y: 510, w: 130, h: 130 },
  { x: 510, y: 510, w: 130, h: 130 },
];
const WALK_TOP = 320;
const WALK_BOTTOM = 612;

type SceneDef = {
  bg: string;
  sp: string;
  accent: string;
  rim: string;
  npcs: { name: string; lines: string[]; accent: string }[];
  title: string;
};

const SCENES: Record<SampleId, SceneDef> = {
  nova: {
    bg: novaBg,
    sp: novaNpcs,
    accent: "#22d3ee",
    rim: "#22d3ee",
    title: "Nova's plaza",
    npcs: [
      { name: "Vex", lines: ["The stars are loud tonight ✦", "Charge up at the inn!", "Welcome to Nova-town."], accent: "#22d3ee" },
      { name: "Lume", lines: ["Stat-link is online.", "Collect the star-coins!", "Cute build, pilot."], accent: "#a78bfa" },
      { name: "Ori", lines: ["The fountain hums in C#.", "Mind the violet trees.", "Let's sync, friend."], accent: "#c4b5fd" },
    ],
  },
  mochi: {
    bg: mochiBg,
    sp: mochiNpcs,
    accent: "#ff5fa8",
    rim: "#ff5fa8",
    title: "Mochi's town",
    npcs: [
      { name: "Mochi", lines: ["Cute outfit today!", "Want to trade hearts?", "The cafe just opened ☕"], accent: "#ff5fa8" },
      { name: "Pip", lines: ["Found all the coins yet?", "I love your style ✦", "Come visit the shop!"], accent: "#22d3ee" },
      { name: "Juno", lines: ["The fountain is lucky 🍀", "Welcome to town!", "Let's be friends 💖"], accent: "#a78bfa" },
    ],
  },
  hexx: {
    bg: hexxBg,
    sp: hexxNpcs,
    accent: "#fb923c",
    rim: "#fb923c",
    title: "Hexx alley",
    npcs: [
      { name: "Bolt", lines: ["The arcade is poppin' 🎮", "Beat my high score?", "Welcome to the alley."], accent: "#fb923c" },
      { name: "Ash", lines: ["Ramen's hot, friend.", "Grab the ember tokens!", "Nice fit."], accent: "#f472b6" },
      { name: "Riko", lines: ["Spinning vinyl tonight 🎧", "Mind the magenta trees.", "Stay neon."], accent: "#ec4899" },
    ],
  },
};

type NPC = {
  x: number; y: number; baseX: number; range: number; dir: 1 | -1; speed: number;
  sprite: SpriteRect; name: string; lines: string[]; accent: string;
};

type Coin = { x: number; y: number; taken: boolean; bob: number };

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };

const NPCS_INIT = (id: SampleId): NPC[] => {
  const s = SCENES[id];
  return [
    { x: 130, y: 470, baseX: 130, range: 60, dir: 1, speed: 0.35, sprite: SPR_A, ...s.npcs[0] },
    { x: 320, y: 540, baseX: 320, range: 70, dir: -1, speed: 0.30, sprite: SPR_B, ...s.npcs[1] },
    { x: 510, y: 470, baseX: 510, range: 60, dir: 1, speed: 0.32, sprite: SPR_C, ...s.npcs[2] },
  ];
};

const COINS_INIT = (): Coin[] => [
  { x: 90, y: 380, taken: false, bob: 0 },
  { x: 220, y: 370, taken: false, bob: 0.4 },
  { x: 420, y: 370, taken: false, bob: 0.8 },
  { x: 560, y: 380, taken: false, bob: 1.2 },
  { x: 170, y: 600, taken: false, bob: 1.6 },
  { x: 320, y: 615, taken: false, bob: 2.0 },
  { x: 470, y: 600, taken: false, bob: 2.4 },
  { x: 320, y: 360, taken: false, bob: 2.8 },
];

function aabb(ax: number, ay: number, aw: number, ah: number, b: Rect) {
  return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
}

export function PixelSocialSim({ avatarSrc, sampleId }: Props) {
  const activeId: SampleId = sampleId ?? "mochi";
  const scene = SCENES[activeId];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const activeRef = useRef(false);
  const stateRef = useRef({
    px: 310, py: 470,
    vx: 0, vy: 0,
    npcs: NPCS_INIT(activeId),
    coins: COINS_INIT(),
    particles: [] as Particle[],
    chatNpcIndex: -1,
    chatLineIndex: 0,
    chatTimer: 0,
    t: 0,
    paused: false,
  });
  const bgRef = useRef<HTMLImageElement | null>(null);
  const spritesRef = useRef<HTMLImageElement | null>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  const [coinCount, setCoinCount] = useState(0);
  const [hearts] = useState(3);
  const [chatText, setChatText] = useState<string | null>(null);
  const [chatAccent, setChatAccent] = useState<string>(scene.accent);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [touch, setTouch] = useState(false);
  const [focused, setFocused] = useState(false);

  // Load scene art whenever the sample changes — and reset world state.
  useEffect(() => {
    const bg = new Image();
    bg.onload = () => { bgRef.current = bg; };
    bg.src = scene.bg;
    const sp = new Image();
    sp.onload = () => { spritesRef.current = sp; };
    sp.src = scene.sp;

    stateRef.current = {
      px: 310, py: 470, vx: 0, vy: 0,
      npcs: NPCS_INIT(activeId),
      coins: COINS_INIT(),
      particles: [],
      chatNpcIndex: -1, chatLineIndex: 0, chatTimer: 0, t: 0, paused: false,
    };
    setCoinCount(0);
    setChatText(null);
    setDone(false);
    setPaused(false);
  }, [activeId, scene.bg, scene.sp]);

  // Avatar
  useEffect(() => {
    if (!avatarSrc) { avatarImgRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { avatarImgRef.current = img; };
    img.src = avatarSrc;
  }, [avatarSrc]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTouch(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        activeRef.current = false;
        keysRef.current = {};
        setFocused(false);
        return;
      }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e"].includes(k)) {
        e.preventDefault();
      }
      keysRef.current[k] = true;
      if (k === "e") tryChat();
    };
    const up = (e: KeyboardEvent) => { if (activeRef.current) keysRef.current[e.key.toLowerCase()] = false; };
    const pointerDown = (e: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap || wrap.contains(e.target as Node)) return;
      activeRef.current = false;
      keysRef.current = {};
      setFocused(false);
    };
    const blur = () => { keysRef.current = {}; };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("pointerdown", pointerDown);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("pointerdown", pointerDown);
    };
  }, []);

  const activateGame = () => {
    activeRef.current = true;
    setFocused(true);
    requestAnimationFrame(() => wrapRef.current?.focus({ preventScroll: true }));
  };

  const tryChat = () => {
    const s = stateRef.current;
    const nearIdx = s.npcs.findIndex((n) => Math.hypot(n.x - s.px, n.y + 4 - s.py) < 70);
    if (nearIdx === -1) return;
    if (s.chatNpcIndex !== nearIdx) {
      s.chatNpcIndex = nearIdx;
      s.chatLineIndex = 0;
    } else {
      s.chatLineIndex = (s.chatLineIndex + 1) % s.npcs[nearIdx].lines.length;
    }
    s.chatTimer = 220;
    setChatText(`${s.npcs[nearIdx].name}: ${s.npcs[nearIdx].lines[s.chatLineIndex]}`);
    setChatAccent(s.npcs[nearIdx].accent);
  };

  const spawnSparkles = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
      s.particles.push({
        x, y, vx: Math.cos(a) * (1 + Math.random() * 1.5), vy: Math.sin(a) * (1 + Math.random() * 1.5) - 0.5,
        life: 0, max: 30 + Math.random() * 10, color,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const PW = 28, PH = 28;
    const MAX_SPEED = 2.4;
    const ACCEL = 0.35;
    const FRIC = 0.78;

    const step = () => {
      const s = stateRef.current;
      if (!s.paused && !done) {
        s.t += 1;
        const k = keysRef.current;
        let ax = 0, ay = 0;
        if (k["arrowleft"] || k["a"]) ax -= 1;
        if (k["arrowright"] || k["d"]) ax += 1;
        if (k["arrowup"] || k["w"]) ay -= 1;
        if (k["arrowdown"] || k["s"]) ay += 1;
        if (ax && ay) { ax *= 0.7071; ay *= 0.7071; }
        s.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, s.vx + ax * ACCEL));
        s.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, s.vy + ay * ACCEL));
        if (!ax) s.vx *= FRIC;
        if (!ay) s.vy *= FRIC;
        if (Math.abs(s.vx) < 0.05) s.vx = 0;
        if (Math.abs(s.vy) < 0.05) s.vy = 0;

        const nx = s.px + s.vx;
        const ny = s.py + s.vy;
        const blocked = (x: number, y: number) =>
          COLLIDERS.some((r) => aabb(x - PW / 2, y - PH / 2, PW, PH, r));
        if (!blocked(nx, s.py) && nx >= 18 && nx <= W - 18) s.px = nx;
        else s.vx = 0;
        if (!blocked(s.px, ny) && ny >= WALK_TOP && ny <= WALK_BOTTOM) s.py = ny;
        else s.vy = 0;

        s.npcs.forEach((n) => {
          n.x += n.speed * n.dir;
          if (n.x > n.baseX + n.range) n.dir = -1;
          if (n.x < n.baseX - n.range) n.dir = 1;
        });

        s.coins.forEach((c) => {
          c.bob += 0.08;
          if (!c.taken && Math.hypot(c.x - s.px, c.y - s.py) < 26) {
            c.taken = true;
            spawnSparkles(c.x, c.y, "#fde047");
            setCoinCount((v) => {
              const nv = v + 1;
              if (nv >= s.coins.length) {
                spawnSparkles(s.px, s.py, scene.accent);
                spawnSparkles(s.px, s.py, "#fde047");
                setDone(true);
              }
              return nv;
            });
          }
        });

        s.particles = s.particles.filter((p) => {
          p.life += 1;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          return p.life < p.max;
        });

        if (s.chatTimer > 0) {
          s.chatTimer -= 1;
          if (s.chatTimer === 0) { setChatText(null); s.chatNpcIndex = -1; }
        }
      }

      ctx.clearRect(0, 0, W, H);
      const bg = bgRef.current;
      if (bg) ctx.drawImage(bg, 0, 0, W, H);
      else { ctx.fillStyle = "#1a0a2e"; ctx.fillRect(0, 0, W, H); }

      const sp = spritesRef.current;

      s.coins.forEach((c) => {
        if (c.taken) return;
        const bob = Math.sin(c.bob) * 3;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(c.x, c.y + 10, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        if (sp) {
          ctx.drawImage(sp, SPR_COIN.x, SPR_COIN.y, SPR_COIN.w, SPR_COIN.h, c.x - 14, c.y - 14 + bob, 28, 28);
        } else {
          ctx.fillStyle = "#fde047";
          ctx.beginPath(); ctx.arc(c.x, c.y + bob, 8, 0, Math.PI * 2); ctx.fill();
        }
      });

      type Drawable = { y: number; kind: "npc" | "player"; ref?: NPC };
      const drawables: Drawable[] = [
        ...s.npcs.map((n) => ({ y: n.y, kind: "npc" as const, ref: n })),
        { y: s.py, kind: "player" as const },
      ];
      drawables.sort((a, b) => a.y - b.y);

      drawables.forEach((d) => {
        if (d.kind === "npc" && d.ref) {
          const n = d.ref;
          const bob = Math.sin(s.t * 0.12 + n.baseX) * 1.5;
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath(); ctx.ellipse(n.x, n.y + 24, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
          if (sp) {
            const dw = 56, dh = (n.sprite.h / n.sprite.w) * dw;
            ctx.drawImage(sp, n.sprite.x, n.sprite.y, n.sprite.w, n.sprite.h, n.x - dw / 2, n.y - dh + 22 + bob, dw, dh);
          }
          const near = Math.hypot(n.x - s.px, n.y - s.py) < 70;
          if (near && s.chatNpcIndex === -1) {
            const py = n.y - 56 + Math.sin(s.t * 0.18) * 2;
            ctx.fillStyle = n.accent;
            ctx.beginPath(); ctx.arc(n.x, py, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 11px ui-monospace, monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("E", n.x, py + 1);
          }
        } else {
          const moving = Math.abs(s.vx) + Math.abs(s.vy) > 0.2;
          const bobP = moving ? Math.sin(s.t * 0.4) * 2 : 0;
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath(); ctx.ellipse(s.px, s.py + 18, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
          const img = avatarImgRef.current;
          const R = 20;
          ctx.save();
          ctx.shadowColor = scene.rim;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = scene.rim;
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(s.px, s.py + bobP, R + 1, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath(); ctx.arc(s.px, s.py + bobP, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
            ctx.drawImage(img, s.px - R, s.py - R + bobP, R * 2, R * 2);
            ctx.restore();
          } else {
            ctx.fillStyle = scene.rim;
            ctx.beginPath(); ctx.arc(s.px, s.py + bobP, R, 0, Math.PI * 2); ctx.fill();
          }
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(s.px, s.py + bobP, R, 0, Math.PI * 2); ctx.stroke();
        }
      });

      s.particles.forEach((p) => {
        const a = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [done, scene.accent, scene.rim]);

  useEffect(() => { stateRef.current.paused = paused; }, [paused]);

  const reset = () => {
    stateRef.current = {
      px: 310, py: 470, vx: 0, vy: 0,
      npcs: NPCS_INIT(activeId), coins: COINS_INIT(), particles: [],
      chatNpcIndex: -1, chatLineIndex: 0, chatTimer: 0, t: 0, paused: false,
    };
    setCoinCount(0);
    setChatText(null);
    setDone(false);
    setPaused(false);
    activateGame();
  };

  const press = (k: string, v: boolean) => { activeRef.current = true; setFocused(true); keysRef.current[k] = v; };

  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${scene.accent} 40%, transparent)`,
        background: "rgba(0,0,0,0.4)",
        boxShadow: `0 18px 60px -30px ${scene.accent}`,
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.14em]">
          <span className="inline-flex items-center gap-1" style={{ color: scene.accent }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`size-3.5 ${i < hearts ? "fill-current" : "opacity-30"}`} />
            ))}
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-300">
            <Coins className="size-3.5" /> {coinCount}/8
          </span>
          <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/60 md:inline">
            · {scene.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/60 sm:inline">
            Click game · WASD/Arrows · E to chat
          </span>
          <button
            onClick={() => { setPaused((p) => !p); activateGame(); }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]"
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />} {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </div>

      <div
        ref={wrapRef}
        tabIndex={0}
        onFocus={activateGame}
        onPointerDown={activateGame}
        onClick={activateGame}
        className="relative overflow-hidden rounded-xl border outline-none focus:ring-2"
        style={{
          aspectRatio: "1 / 1",
          touchAction: "none",
          borderColor: `color-mix(in oklab, ${scene.accent} 40%, transparent)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-full w-full"
        />

        {chatText && (
          <div
            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl border bg-black/85 px-3.5 py-2 text-xs font-bold text-white shadow-2xl"
            style={{ borderColor: chatAccent, boxShadow: `0 0 24px -4px ${chatAccent}` }}
          >
            <MessageCircle className="mr-1.5 inline size-3.5" style={{ color: chatAccent }} />
            {chatText}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
            <div
              className="rounded-2xl border px-6 py-5 text-center"
              style={{
                borderColor: scene.accent,
                background: `linear-gradient(135deg, color-mix(in oklab, ${scene.accent} 24%, var(--background) 76%), color-mix(in oklab, ${scene.accent} 12%, var(--background) 88%))`,
              }}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: scene.accent }}>✦ Quest complete</p>
              <p className="mt-1.5 text-lg font-black">You lit up {scene.title} ✨</p>
              <button
                onClick={reset}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white hover:opacity-90"
                style={{ background: scene.accent }}
              >
                <RotateCcw className="size-3" /> Play again
              </button>
            </div>
          </div>
        )}

        {paused && !done && (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <p className="rounded-lg bg-background/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]">Paused</p>
          </div>
        )}

        {!focused && !done && !paused && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <div
              className="flex flex-col items-center gap-2 rounded-2xl border bg-black/80 px-5 py-4 text-center"
              style={{ borderColor: scene.accent }}
            >
              <MousePointerClick className="size-6" style={{ color: scene.accent }} />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white">Click to play</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">WASD / Arrows · E to chat</p>
            </div>
          </div>
        )}
      </div>

      {touch && (
        <div className="mt-3 flex items-center justify-between gap-4 select-none">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <DpadBtn accent={scene.accent} onDown={() => press("arrowup", true)} onUp={() => press("arrowup", false)}>↑</DpadBtn>
            <div />
            <DpadBtn accent={scene.accent} onDown={() => press("arrowleft", true)} onUp={() => press("arrowleft", false)}>←</DpadBtn>
            <div />
            <DpadBtn accent={scene.accent} onDown={() => press("arrowright", true)} onUp={() => press("arrowright", false)}>→</DpadBtn>
            <div />
            <DpadBtn accent={scene.accent} onDown={() => press("arrowdown", true)} onUp={() => press("arrowdown", false)}>↓</DpadBtn>
            <div />
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); tryChat(); }}
            className="grid size-16 place-items-center rounded-full border-2 text-base font-black uppercase active:scale-95"
            style={{
              borderColor: scene.accent,
              color: scene.accent,
              background: `color-mix(in oklab, ${scene.accent} 20%, transparent)`,
              boxShadow: `0 0 24px -4px ${scene.accent}`,
            }}
          >
            E
          </button>
        </div>
      )}

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Your character is the avatar · explore {scene.title}, collect 8 coins, press E near townsfolk to chat
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
