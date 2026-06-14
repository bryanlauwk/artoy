import { useEffect, useRef, useState } from "react";
import { Heart, Coins, Pause, Play, RotateCcw, MessageCircle } from "lucide-react";

type Props = { avatarSrc: string | null };

// Logical canvas resolution (scaled up via CSS for crisp pixel look).
const W = 320;
const H = 200;

type Rect = { x: number; y: number; w: number; h: number };
type NPC = { x: number; y: number; baseX: number; baseY: number; range: number; dir: 1 | -1; color: string; name: string; lines: string[] };
type Coin = { x: number; y: number; taken: boolean; bob: number };

// Static collidables (shop fronts, fountain, trees).
const SHOPS: (Rect & { color: string; sign: string })[] = [
  { x: 24, y: 28, w: 64, h: 38, color: "#d97757", sign: "CAFE" },
  { x: 128, y: 22, w: 64, h: 42, color: "#7a9cf0", sign: "SHOP" },
  { x: 232, y: 28, w: 64, h: 38, color: "#7fc59a", sign: "INN" },
];
const TREES: Rect[] = [
  { x: 8, y: 110, w: 14, h: 14 },
  { x: 298, y: 108, w: 14, h: 14 },
  { x: 60, y: 170, w: 12, h: 12 },
  { x: 248, y: 170, w: 12, h: 12 },
];
const FOUNTAIN: Rect = { x: 144, y: 110, w: 32, h: 24 };

const NPC_NAMES = ["Mochi", "Pip", "Juno"];
const NPC_COLORS = ["#f472b6", "#facc15", "#60a5fa"];
const NPC_LINES = [
  ["Cute outfit today!", "Want to trade hearts?", "The cafe just opened ☕"],
  ["Did you find all the coins?", "I love your style ✦", "Come visit the shop!"],
  ["The fountain is lucky 🍀", "Welcome to town!", "Let's be friends 💖"],
];

function initNPCs(): NPC[] {
  return [
    { x: 64, y: 140, baseX: 64, baseY: 140, range: 30, dir: 1, color: NPC_COLORS[0], name: NPC_NAMES[0], lines: NPC_LINES[0] },
    { x: 160, y: 160, baseX: 160, baseY: 160, range: 26, dir: -1, color: NPC_COLORS[1], name: NPC_NAMES[1], lines: NPC_LINES[1] },
    { x: 246, y: 140, baseX: 246, baseY: 140, range: 28, dir: 1, color: NPC_COLORS[2], name: NPC_NAMES[2], lines: NPC_LINES[2] },
  ];
}

function initCoins(): Coin[] {
  return [
    { x: 50, y: 90, taken: false, bob: 0 },
    { x: 110, y: 95, taken: false, bob: 0.4 },
    { x: 200, y: 95, taken: false, bob: 0.8 },
    { x: 270, y: 90, taken: false, bob: 1.2 },
    { x: 40, y: 175, taken: false, bob: 1.6 },
    { x: 280, y: 175, taken: false, bob: 2.0 },
    { x: 120, y: 175, taken: false, bob: 2.4 },
    { x: 210, y: 175, taken: false, bob: 2.8 },
  ];
}

function aabb(ax: number, ay: number, aw: number, ah: number, b: Rect) {
  return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
}

export function PixelSocialSim({ avatarSrc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const stateRef = useRef({
    px: 160,
    py: 130,
    facing: "down" as "up" | "down" | "left" | "right",
    npcs: initNPCs(),
    coins: initCoins(),
    chatNpcIndex: -1,
    chatLineIndex: 0,
    chatTimer: 0,
    t: 0,
    paused: false,
  });
  const avatarImgRef = useRef<HTMLImageElement | null>(null);
  const [coinCount, setCoinCount] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [chatText, setChatText] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [touch, setTouch] = useState(false);

  // Load avatar
  useEffect(() => {
    if (!avatarSrc) {
      avatarImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { avatarImgRef.current = img; };
    img.src = avatarSrc;
  }, [avatarSrc]);

  // Detect touch device once.
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTouch(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e"].includes(k)) {
        e.preventDefault();
      }
      keysRef.current[k] = true;
      if (k === "e") tryChat();
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const tryChat = () => {
    const s = stateRef.current;
    const nearIdx = s.npcs.findIndex((n) => Math.hypot(n.x + 6 - (s.px + 8), n.y + 8 - (s.py + 8)) < 22);
    if (nearIdx === -1) return;
    if (s.chatNpcIndex !== nearIdx) {
      s.chatNpcIndex = nearIdx;
      s.chatLineIndex = 0;
    } else {
      s.chatLineIndex = (s.chatLineIndex + 1) % s.npcs[nearIdx].lines.length;
    }
    s.chatTimer = 180; // ~3s @ 60fps
    setChatText(`${s.npcs[nearIdx].name}: ${s.npcs[nearIdx].lines[s.chatLineIndex]}`);
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    let raf = 0;

    const step = () => {
      const s = stateRef.current;
      if (!s.paused && !done) {
        s.t += 1;

        // Input
        const k = keysRef.current;
        let dx = 0, dy = 0;
        if (k["arrowleft"] || k["a"]) dx -= 1;
        if (k["arrowright"] || k["d"]) dx += 1;
        if (k["arrowup"] || k["w"]) dy -= 1;
        if (k["arrowdown"] || k["s"]) dy += 1;
        if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
        const speed = 1.2;
        const nx = s.px + dx * speed;
        const ny = s.py + dy * speed;

        // Collide
        const pw = 14, ph = 14;
        const blocked = (x: number, y: number) =>
          SHOPS.some((r) => aabb(x, y, pw, ph, r)) ||
          TREES.some((r) => aabb(x, y, pw, ph, r)) ||
          aabb(x, y, pw, ph, FOUNTAIN);
        if (!blocked(nx, s.py) && nx >= 2 && nx <= W - pw - 2) s.px = nx;
        if (!blocked(s.px, ny) && ny >= 70 && ny <= H - ph - 2) s.py = ny;
        if (dx < 0) s.facing = "left"; else if (dx > 0) s.facing = "right";
        else if (dy < 0) s.facing = "up"; else if (dy > 0) s.facing = "down";

        // NPC patrol
        s.npcs.forEach((n) => {
          n.x += 0.35 * n.dir;
          if (n.x > n.baseX + n.range) n.dir = -1;
          if (n.x < n.baseX - n.range) n.dir = 1;
        });

        // Coin pickup
        s.coins.forEach((c) => {
          c.bob += 0.08;
          if (!c.taken && Math.hypot(c.x - (s.px + 7), c.y - (s.py + 7)) < 10) {
            c.taken = true;
            setCoinCount((v) => {
              const nv = v + 1;
              if (nv >= s.coins.length) setDone(true);
              return nv;
            });
          }
        });

        // Chat timer
        if (s.chatTimer > 0) {
          s.chatTimer -= 1;
          if (s.chatTimer === 0) { setChatText(null); s.chatNpcIndex = -1; }
        }
      }

      // ============ DRAW ============

      // Grass background
      ctx.fillStyle = "#3aa564";
      ctx.fillRect(0, 0, W, H);
      // Sky band on top
      const grd = ctx.createLinearGradient(0, 0, 0, 70);
      grd.addColorStop(0, "#8ec5ff");
      grd.addColorStop(1, "#bfe0ff");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, 70);
      // Dirt path
      ctx.fillStyle = "#c69b6d";
      ctx.fillRect(0, 100, W, 22);
      ctx.fillStyle = "#a87f54";
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, 100, 4, 2);

      // Grass speckles
      ctx.fillStyle = "#2f8a52";
      for (let i = 0; i < 40; i++) {
        const gx = (i * 37) % W;
        const gy = 124 + ((i * 53) % (H - 130));
        ctx.fillRect(gx, gy, 2, 2);
      }

      // Shops
      SHOPS.forEach((sh) => {
        // body
        ctx.fillStyle = sh.color;
        ctx.fillRect(sh.x, sh.y + 12, sh.w, sh.h - 12);
        // roof
        ctx.fillStyle = "#3b2f4a";
        ctx.beginPath();
        ctx.moveTo(sh.x - 4, sh.y + 14);
        ctx.lineTo(sh.x + sh.w / 2, sh.y - 4);
        ctx.lineTo(sh.x + sh.w + 4, sh.y + 14);
        ctx.closePath();
        ctx.fill();
        // door
        ctx.fillStyle = "#2d2236";
        ctx.fillRect(sh.x + sh.w / 2 - 6, sh.y + sh.h - 14, 12, 14);
        // window
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(sh.x + 6, sh.y + 18, 10, 8);
        ctx.fillRect(sh.x + sh.w - 16, sh.y + 18, 10, 8);
        // sign
        ctx.fillStyle = "#fff";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = "center";
        ctx.fillText(sh.sign, sh.x + sh.w / 2, sh.y + 10);
      });

      // Trees
      TREES.forEach((t) => {
        ctx.fillStyle = "#6b3f1d";
        ctx.fillRect(t.x + t.w / 2 - 1, t.y + t.h - 4, 2, 4);
        ctx.fillStyle = "#1f6b3a";
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2, t.y + t.h / 2, t.w / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2f8a52";
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2 - 2, t.y + t.h / 2 - 2, t.w / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Fountain
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.w, FOUNTAIN.h);
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(FOUNTAIN.x + 4, FOUNTAIN.y + 4, FOUNTAIN.w - 8, FOUNTAIN.h - 8);
      ctx.fillStyle = "#bfe0ff";
      ctx.fillRect(FOUNTAIN.x + FOUNTAIN.w / 2 - 1, FOUNTAIN.y - 4 + Math.sin(s.t * 0.2) * 1.5, 2, 6);

      // Coins
      s.coins.forEach((c) => {
        if (c.taken) return;
        const bob = Math.sin(c.bob) * 1.5;
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(c.x, c.y + bob, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ca8a04";
        ctx.fillRect(c.x - 1, c.y - 1 + bob, 2, 3);
      });

      // NPCs
      s.npcs.forEach((n, idx) => {
        const bob = Math.sin(s.t * 0.12 + idx) * 1;
        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(n.x + 6, n.y + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // body
        ctx.fillStyle = n.color;
        ctx.fillRect(n.x, n.y + bob, 12, 12);
        // head
        ctx.fillStyle = "#ffd9b3";
        ctx.fillRect(n.x + 2, n.y - 4 + bob, 8, 6);
        // eyes
        ctx.fillStyle = "#000";
        ctx.fillRect(n.x + 4, n.y - 2 + bob, 1, 1);
        ctx.fillRect(n.x + 7, n.y - 2 + bob, 1, 1);
        // proximity heart
        const near = Math.hypot(n.x + 6 - (s.px + 8), n.y + 8 - (s.py + 8)) < 22;
        if (near) {
          ctx.fillStyle = "#f472b6";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillText("♥", n.x + 6, n.y - 8 + Math.sin(s.t * 0.2) * 1);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 6px monospace";
          ctx.fillText("[E]", s.px + 7, s.py - 6);
        }
      });

      // Player
      const bobP = (keysRef.current["arrowleft"] || keysRef.current["arrowright"] || keysRef.current["arrowup"] || keysRef.current["arrowdown"] ||
        keysRef.current["a"] || keysRef.current["d"] || keysRef.current["w"] || keysRef.current["s"]) ? Math.sin(s.t * 0.4) * 1 : 0;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(s.px + 7, s.py + 15, 7, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      const img = avatarImgRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        // clip avatar to circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.px + 7, s.py + 7 + bobP, 8, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, s.px - 1, s.py - 1 + bobP, 16, 16);
        ctx.restore();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.px + 7, s.py + 7 + bobP, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.arc(s.px + 7, s.py + 7 + bobP, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  // Sync pause flag.
  useEffect(() => { stateRef.current.paused = paused; }, [paused]);

  const reset = () => {
    stateRef.current = {
      px: 160, py: 130, facing: "down",
      npcs: initNPCs(), coins: initCoins(),
      chatNpcIndex: -1, chatLineIndex: 0, chatTimer: 0,
      t: 0, paused: false,
    };
    setCoinCount(0);
    setHearts(3);
    setChatText(null);
    setDone(false);
    setPaused(false);
  };

  // Touch dpad helpers
  const press = (k: string, v: boolean) => { keysRef.current[k] = v; };

  return (
    <div className="rounded-2xl border border-pink/40 bg-black/40 p-3" style={{ boxShadow: "0 18px 60px -30px color-mix(in oklab, var(--pink) 90%, transparent)" }}>
      {/* HUD bar */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.14em]">
          <span className="inline-flex items-center gap-1 text-pink">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`size-3.5 ${i < hearts ? "fill-pink" : "opacity-30"}`} />
            ))}
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-300">
            <Coins className="size-3.5" /> {coinCount}/8
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/60 sm:inline">
            WASD / Arrows · E to chat
          </span>
          <button onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]">
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />} {paused ? "Resume" : "Pause"}
          </button>
          <button onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-white/[0.1]">
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-border" style={{ aspectRatio: `${W} / ${H}` }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-full w-full"
          style={{ imageRendering: "pixelated" as const }}
        />
        {chatText && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-lg border border-pink/60 bg-black/80 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <MessageCircle className="mr-1 inline size-3 text-pink" />
            {chatText}
          </div>
        )}
        {done && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
            <div className="rounded-2xl border border-pink/60 bg-background/95 px-6 py-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-pink">✦ Quest complete</p>
              <p className="mt-1.5 text-lg font-black">You filled the town with joy ✨</p>
              <button onClick={reset} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-pink px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white hover:opacity-90">
                <RotateCcw className="size-3" /> Play again
              </button>
            </div>
          </div>
        )}
        {paused && !done && (
          <div className="absolute inset-0 grid place-items-center bg-black/50">
            <p className="rounded-lg bg-background/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]">Paused</p>
          </div>
        )}
      </div>

      {/* Touch controls */}
      {touch && (
        <div className="mt-3 flex items-center justify-between gap-4 select-none">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <DpadBtn onDown={() => press("arrowup", true)} onUp={() => press("arrowup", false)}>↑</DpadBtn>
            <div />
            <DpadBtn onDown={() => press("arrowleft", true)} onUp={() => press("arrowleft", false)}>←</DpadBtn>
            <div />
            <DpadBtn onDown={() => press("arrowright", true)} onUp={() => press("arrowright", false)}>→</DpadBtn>
            <div />
            <DpadBtn onDown={() => press("arrowdown", true)} onUp={() => press("arrowdown", false)}>↓</DpadBtn>
            <div />
          </div>
          <button
            onPointerDown={tryChat}
            className="grid size-16 place-items-center rounded-full border border-pink/60 bg-pink/20 text-base font-black uppercase text-pink active:scale-95"
          >
            E
          </button>
        </div>
      )}

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Your character {avatarSrc ? "is" : "will be"} the avatar · walk around, collect 8 coins, press E near townsfolk to chat
      </p>
    </div>
  );
}

function DpadBtn({ children, onDown, onUp }: { children: React.ReactNode; onDown: () => void; onUp: () => void }) {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onDown(); }}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      className="grid size-11 place-items-center rounded-lg border border-border bg-white/[0.06] text-base font-black active:scale-95"
    >
      {children}
    </button>
  );
}
