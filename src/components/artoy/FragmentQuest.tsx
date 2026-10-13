import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  Gem,
  Download,
  ArrowUpRight,
  Expand,
  Minimize,
} from "lucide-react";
import {
  createQuest,
  stepQuest,
  questScore,
  WIDTH,
  HEIGHT,
  timeRemaining,
  questAct,
  type Vec,
  type Phase,
} from "./quest/engine";
import { DEFAULT_PALETTE, extractPalette, prepareHero } from "./quest/artwork";
import { prepareMotion, type HeroMotion } from "./quest/motion";
import backdrop from "@/assets/artoy/game/mysterious-island-v1.webp";
import relicAtlas from "@/assets/artoy/game/world-relics-v1.webp";
import { renderQuest } from "./quest/render";
import { prepareRelics, resolveWorldIdentity, type WorldRelics } from "./quest/world";

type Props = {
  artworkSrc: string;
  characterName: string;
  heroSrc?: string | null;
  motionSrc?: string | null;
  collectibleSrc?: string | null;
  relicsSrc?: string | null;
  worldId?: "lunarie" | "booboi" | "jaygyii" | null;
  onExploreCollectible?: () => void;
};
type Snapshot = {
  phase: Phase;
  act: ReturnType<typeof questAct>;
  hearts: number;
  fragments: number;
  sparks: number;
  seconds: number;
  cooldown: number;
  score: number;
};
function snapshot(s: ReturnType<typeof createQuest>): Snapshot {
  return {
    phase: s.phase,
    act: questAct(s),
    hearts: s.hearts,
    fragments: s.fragments.filter(Boolean).length,
    sparks: s.sparks.filter(Boolean).length,
    seconds: Math.ceil(timeRemaining(s)),
    cooldown: s.cooldown,
    score: questScore(s),
  };
}
function artworkKey(src: string) {
  let hash = 2166136261;
  for (let i = 0; i < src.length; i++) hash = Math.imul(hash ^ src.charCodeAt(i), 16777619);
  return `artoy.fragment-quest.v1.${(hash >>> 0).toString(16)}`;
}

export function FragmentQuest({
  artworkSrc,
  characterName,
  heroSrc,
  motionSrc,
  collectibleSrc,
  relicsSrc,
  worldId,
  onExploreCollectible,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const arena = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const finale = useRef<HTMLElement>(null);
  const rewardHeading = useRef<HTMLHeadingElement>(null);
  const finaleTitleId = useId();
  const identity = useMemo(
    () => resolveWorldIdentity(worldId, characterName),
    [worldId, characterName],
  );
  const state = useRef(createQuest());
  const keys = useRef(new Set<string>());
  const dashRequest = useRef(false);
  const camera = useRef({ left: 0, width: WIDTH });
  const assets = useRef({
    original: null as HTMLImageElement | null,
    hero: null as HTMLCanvasElement | null,
    motion: null as HeroMotion | null,
    backdrop: null as HTMLImageElement | null,
    identity,
    relics: null as WorldRelics | null,
    palette: DEFAULT_PALETTE,
    name: characterName,
    reducedMotion: false,
  });
  const audio = useRef<AudioContext | null>(null);
  const sound = useRef(false);
  const saved = useRef(false);
  const [hud, setHud] = useState(() => snapshot(state.current));
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [audioOn, setAudioOn] = useState(false);
  const [best, setBest] = useState(0);
  const [announcement, setAnnouncement] = useState(
    "Recover three art fragments, then return to the portal.",
  );
  const [heroReady, setHeroReady] = useState(false);
  const [artError, setArtError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const [collectibleFailed, setCollectibleFailed] = useState(false);
  const [rewardImageFailed, setRewardImageFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  useEffect(() => {
    setRevealed(false);
    setSaveNotice("");
    if (hud.phase !== "won") return;
    finale.current?.focus({ preventScroll: true });
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealIfReduced = () => {
      if (motion.matches) setRevealed(true);
    };
    if (motion.matches) {
      setRevealed(true);
      return;
    }
    motion.addEventListener("change", revealIfReduced);
    const timer = window.setTimeout(() => setRevealed(true), 2400);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener("change", revealIfReduced);
    };
  }, [hud.phase]);
  useEffect(() => {
    if (revealed && hud.phase === "won") {
      rewardHeading.current?.focus({ preventScroll: true });
      if (finale.current) finale.current.scrollTop = 0;
    }
  }, [revealed, hud.phase]);
  const hasCollectible = !!collectibleSrc && !collectibleFailed;
  const rewardSrc = hasCollectible ? collectibleSrc! : artworkSrc;
  const savePreview = async () => {
    setSaving(true);
    setSaveNotice("");
    try {
      const response = await fetch(rewardSrc);
      if (!response.ok) throw new Error("Image unavailable");
      const file = await response.blob();
      if (!file.type.startsWith("image/")) throw new Error("Image unavailable");
      const extension =
        file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]?.split("+")[0] || "png";
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${characterName.replace(/[^a-z0-9-]/gi, "-")}-archive.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSaveNotice("Your preview is ready to save.");
    } catch {
      setSaveNotice("Open the preview to save the image on your device.");
    } finally {
      setSaving(false);
    }
  };
  const storageKey = useMemo(() => artworkKey(artworkSrc), [artworkSrc]);
  const storageRef = useRef(storageKey);
  storageRef.current = storageKey;

  const tone = (event: string) => {
    const ctx = audio.current;
    if (!sound.current || !ctx) return;
    const frequencies =
      event === "won"
        ? [523, 659, 784, 1046]
        : event === "escape"
          ? [392, 523, 784, 1046]
          : event === "guardian"
            ? [146, 196, 233]
            : event === "warning"
              ? [196, 247, 330]
              : event === "awaken"
                ? [262, 392, 523]
                : event === "stun"
                  ? [311, 622]
                  : event === "fragment"
                    ? [659, 880, 1175]
                    : event === "hit" || event === "lost"
                      ? [180, 110]
                      : event === "dash"
                        ? [220, 440]
                        : [880];
    frequencies.forEach((frequency, i) => {
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain(),
        at = ctx.currentTime + i * 0.07;
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.05, at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.15);
    });
  };
  const toneRef = useRef(tone);
  toneRef.current = tone;
  const releaseControls = () => {
    keys.current.clear();
    dashRequest.current = false;
    state.current.target = null;
  };
  const changePhase = (phase: Phase) => {
    releaseControls();
    state.current.phase = phase;
    setHud(snapshot(state.current));
    if (phase === "playing") {
      arena.current?.focus({ preventScroll: true });
      void audio.current?.resume();
    }
  };
  const restart = () => {
    setRevealed(false);
    releaseControls();
    state.current = createQuest();
    camera.current.left = Math.max(
      0,
      Math.min(WIDTH - camera.current.width, state.current.player.x - camera.current.width / 2),
    );
    saved.current = false;
    setAnnouncement("A fresh adventure. Recover the three fragments.");
    changePhase("playing");
  };

  useEffect(() => {
    setCollectibleFailed(false);
    setRewardImageFailed(false);
    setSaveNotice("");
  }, [collectibleSrc, artworkSrc]);

  useEffect(() => {
    let cancelled = false;
    releaseControls();
    state.current = createQuest();
    saved.current = false;
    setHud(snapshot(state.current));
    setHeroReady(false);
    setArtError(false);
    assets.current.original = null;
    assets.current.hero = null;
    assets.current.palette = DEFAULT_PALETTE;
    assets.current.name = characterName;
    setPalette(DEFAULT_PALETTE);
    setAnnouncement("Recover three art fragments, then return to the portal.");
    try {
      const value = Number(localStorage.getItem(storageKey));
      setBest(Number.isFinite(value) && value > 0 ? value : 0);
    } catch {
      setBest(0);
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      assets.current.original = image;
      assets.current.palette = extractPalette(image);
      setPalette(assets.current.palette);
    };
    image.onerror = () => {
      if (!cancelled) setArtError(true);
    };
    image.src = artworkSrc;
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [artworkSrc, characterName, storageKey]);

  useEffect(() => {
    let cancelled = false;
    assets.current.hero = null;
    setHeroReady(false);
    if (!heroSrc) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      assets.current.hero = prepareHero(image);
      setHeroReady(true);
    };
    image.src = heroSrc;
    return () => {
      cancelled = true;
      image.onload = null;
    };
  }, [heroSrc, artworkSrc]);

  useEffect(() => {
    let cancelled = false;
    assets.current.motion = null;
    if (!motionSrc) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!cancelled) {
        assets.current.motion = prepareMotion(image);
        if (assets.current.motion) setHeroReady(true);
      }
    };
    image.src = motionSrc;
    return () => {
      cancelled = true;
      image.onload = null;
    };
  }, [motionSrc, artworkSrc]);
  useEffect(() => {
    let cancelled = false;
    assets.current.identity = identity;
    assets.current.relics = null;
    const source = relicsSrc || (worldId ? relicAtlas : null);
    if (!source) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      try {
        assets.current.relics = prepareRelics(
          image,
          relicsSrc ? "strip-3x1" : "atlas-3x3",
          identity,
        );
      } catch {
        // The signature motifs remain usable when a generated relic image is malformed.
        assets.current.relics = null;
      }
    };
    image.src = source;
    return () => {
      cancelled = true;
      image.onload = null;
    };
  }, [identity, relicsSrc, worldId]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      assets.current.backdrop = image;
    };
    image.src = backdrop;
    return () => {
      image.onload = null;
    };
  }, []);

  useEffect(() => {
    const heldKeys = keys.current;
    const view = canvas.current;
    if (!view) return;
    const ctx = view.getContext("2d");
    const world = document.createElement("canvas");
    world.width = WIDTH;
    world.height = HEIGHT;
    const worldCtx = world.getContext("2d");
    if (!ctx || !worldCtx) return;
    const resize = new ResizeObserver(() => {
      const compact = view.getBoundingClientRect().width < 560;
      setCompact(compact);
      camera.current.width = compact ? 640 : WIDTH;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      view.width = camera.current.width * ratio;
      view.height = HEIGHT * ratio;
    });
    resize.observe(view);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      assets.current.reducedMotion = motion.matches;
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    let frame = 0,
      last = 0,
      accumulator = 0,
      hudAt = 0;
    const animate = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      accumulator += dt;
      while (accumulator >= 1 / 60) {
        const held = keys.current;
        const move: Vec = {
          x:
            Number(held.has("d") || held.has("arrowright")) -
            Number(held.has("a") || held.has("arrowleft")),
          y:
            Number(held.has("s") || held.has("arrowdown")) -
            Number(held.has("w") || held.has("arrowup")),
        };
        stepQuest(state.current, 1 / 60, move, dashRequest.current);
        dashRequest.current = false;
        const events = state.current.events;
        if (events.length) {
          toneRef.current(events[events.length - 1]);
          if (events.includes("fragment"))
            setAnnouncement(
              state.current.fragments.every(Boolean)
                ? "All fragments recovered! Return to the glowing portal."
                : `${state.current.fragments.filter(Boolean).length} of 3 fragments recovered.`,
            );
          if (events.includes("awaken"))
            setAnnouncement("The first fragment lights the archive. Something is waking.");
          if (events.includes("guardian"))
            setAnnouncement(
              "The Archive Warden is awake. Leave its marked circle before it strikes.",
            );
          if (events.includes("warning"))
            setAnnouncement("Move out of the marked circle! Dash to evade the Warden.");
          if (events.includes("stun"))
            setAnnouncement("Warden stunned. Keep moving toward the fragments.");
          if (events.includes("escape"))
            setAnnouncement("The portal is closing! You have 20 seconds to get home.");
          if (events.includes("hit"))
            setAnnouncement("You were hit. Dash to evade the next attack.");
          if (events.includes("won"))
            setAnnouncement("Universe restored! Your character made it home.");
          if (events.includes("lost"))
            setAnnouncement(
              state.current.hearts <= 0
                ? "Out of hearts. Try a different route and use your dash."
                : "Time ran out. Recover all fragments and return to the portal.",
            );
        }
        if (state.current.phase === "won" && !saved.current) {
          saved.current = true;
          const score = questScore(state.current);
          setBest((previous) => {
            const next = Math.max(previous, score);
            try {
              localStorage.setItem(storageRef.current, String(next));
            } catch {
              /* Play remains available without storage. */
            }
            return next;
          });
        }
        accumulator -= 1 / 60;
      }
      renderQuest(worldCtx, state.current, assets.current, now / 1000);
      const width = camera.current.width;
      const cameraTarget = Math.max(0, Math.min(WIDTH - width, state.current.player.x - width / 2));
      camera.current.left =
        assets.current.reducedMotion || state.current.phase !== "playing"
          ? cameraTarget
          : camera.current.left + (cameraTarget - camera.current.left) * (1 - Math.exp(-dt * 10));
      ctx.drawImage(world, camera.current.left, 0, width, HEIGHT, 0, 0, view.width, view.height);
      if (now - hudAt > 90) {
        setHud(snapshot(state.current));
        hudAt = now;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const pause = () => {
      heldKeys.clear();
      dashRequest.current = false;
      state.current.target = null;
      if (state.current.phase === "playing") {
        state.current.phase = "paused";
        setHud(snapshot(state.current));
      }
    };
    const keyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    window.addEventListener("keyup", keyUp);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      motion.removeEventListener("change", updateMotion);
      window.removeEventListener("blur", pause);
      window.removeEventListener("keyup", keyUp);
      document.removeEventListener("visibilitychange", visibility);
      heldKeys.clear();
    };
  }, []);

  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  useEffect(() => {
    const changed = () => setExpanded(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  const pointTo = (event: PointerEvent<HTMLCanvasElement>) => {
    if (state.current.phase !== "playing") return;
    arena.current?.focus({ preventScroll: true });
    const rect = event.currentTarget.getBoundingClientRect();
    state.current.target = {
      x: camera.current.left + ((event.clientX - rect.left) / rect.width) * camera.current.width,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const touchDirection = (key: string, event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (state.current.phase === "playing") {
      state.current.target = null;
      keys.current.add(key);
    }
  };
  return (
    <div
      ref={root}
      className={`fragment-quest ${expanded ? "quest-expanded" : ""} ${hud.phase === "won" ? "quest-completed" : ""}`}
      style={
        {
          "--quest-accent": palette.primary,
          "--quest-secondary": palette.secondary,
        } as CSSProperties
      }
    >
      <header className="quest-heading">
        <div>
          <span className="quest-kicker">
            <Sparkles size={13} /> ARTOY ORIGINAL · CHAPTER 01
          </span>
          <h3>{identity.title}</h3>
          <p>{characterName}’s chapter in The Lost Fragments.</p>
        </div>
        <div className="quest-tools">
          <button
            aria-label={audioOn ? "Mute game" : "Enable game sound"}
            aria-pressed={audioOn}
            onClick={() => {
              const enabled = !audioOn;
              sound.current = enabled;
              setAudioOn(enabled);
              if (enabled) {
                try {
                  audio.current ??= new AudioContext();
                  void audio.current.resume();
                } catch {
                  sound.current = false;
                  setAudioOn(false);
                }
              }
            }}
          >
            {audioOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button
            aria-label={expanded ? "Exit fullscreen" : "Play fullscreen"}
            onClick={async () => {
              try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else await root.current?.requestFullscreen();
              } catch {
                setAnnouncement(
                  "Fullscreen is unavailable here. You can keep playing in the studio.",
                );
              }
            }}
          >
            {expanded ? <Minimize size={17} /> : <Expand size={17} />}
          </button>
        </div>
      </header>
      <div className="quest-hud">
        <div className="quest-health" aria-label={`${hud.hearts} of 3 hearts`}>
          {[0, 1, 2].map((i) => (
            <Heart
              size={17}
              key={i}
              fill={i < hud.hearts ? "currentColor" : "none"}
              className={i >= hud.hearts ? "empty" : ""}
            />
          ))}
        </div>
        <span className="quest-fragments">
          <Gem size={16} /> <b>{hud.fragments}/3</b>
          <span>fragments</span>
        </span>
        <span
          className={
            hud.seconds < 15 && hud.phase === "playing" ? "quest-time urgent" : "quest-time"
          }
        >
          {hud.phase === "won"
            ? "COMPLETE"
            : hud.phase === "lost"
              ? "TRY AGAIN"
              : `${hud.act === "escape" ? "ESCAPE · " : ""}${hud.seconds}s`}
        </span>
        <button
          disabled={hud.phase === "ready" || hud.phase === "won" || hud.phase === "lost"}
          onClick={() => changePhase(hud.phase === "paused" ? "playing" : "paused")}
          aria-label={hud.phase === "paused" ? "Resume adventure" : "Pause adventure"}
        >
          {hud.phase === "paused" ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button onClick={restart} aria-label="Restart adventure">
          <RotateCcw size={16} />
        </button>
      </div>
      <div
        ref={arena}
        className={`quest-arena ${compact ? "quest-compact" : ""} ${hud.phase === "won" ? "quest-finished" : ""}`}
        tabIndex={0}
        role="group"
        aria-label={`${characterName}’s adventure. Use arrow keys or WASD to move; Space to dash; P to pause.`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            keys.current.clear();
        }}
        onKeyDown={(event) => {
          if (
            (event.target as HTMLElement).closest("button, a, input, select, textarea") ||
            !["playing", "paused"].includes(state.current.phase)
          )
            return;
          const key = event.key.toLowerCase();
          if (
            [
              "w",
              "a",
              "s",
              "d",
              "arrowup",
              "arrowdown",
              "arrowleft",
              "arrowright",
              " ",
              "p",
            ].includes(key)
          )
            event.preventDefault();
          if (key === "p" && !event.repeat && ["playing", "paused"].includes(state.current.phase))
            changePhase(state.current.phase === "paused" ? "playing" : "paused");
          if (key === " " && !event.repeat && state.current.phase === "playing")
            dashRequest.current = true;
          else if (state.current.phase === "playing") keys.current.add(key);
        }}
        onKeyUp={(event) => keys.current.delete(event.key.toLowerCase())}
      >
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          aria-label={`The Lost Fragments world with ${characterName} as the hero`}
          onPointerDown={pointTo}
          onPointerMove={(event) => {
            if (event.buttons) pointTo(event);
          }}
        >
          Recover the three fragments, avoid inklings and return to the portal. Move with arrow
          keys, dash with Space.
        </canvas>
        {hud.phase === "ready" && (
          <div className="quest-intro">
            <span>YOUR ART HAS A NEW ADVENTURE</span>
            <h4>
              Three fragments.
              <br />
              One way home.
            </h4>
            <p>
              Something is calling from beyond the portal. Recover three lost art fragments, evade
              the inklings, and discover what the archive is hiding.
            </p>
            <button className="quest-primary" onClick={() => changePhase("playing")}>
              <Play size={17} fill="currentColor" /> Start adventure
            </button>
            <small>90 seconds · Move + dash · All characters welcome</small>
          </div>
        )}
        {hud.phase === "paused" && (
          <div className="quest-overlay">
            <div>
              <Pause size={26} />
              <h4>A little breather.</h4>
              <p>Your adventure and timer are paused.</p>
              <button className="quest-primary" onClick={() => changePhase("playing")}>
                <Play size={16} /> Keep exploring
              </button>
            </div>
          </div>
        )}
        {hud.phase === "lost" && (
          <div className="quest-overlay">
            <div>
              <span className="quest-kicker">ANOTHER WAY THROUGH</span>
              <Gem size={33} />
              <h4>Every hero gets a retry.</h4>
              <p>
                {hud.hearts === 0
                  ? "The inklings caught you. Dash through them to stay safe."
                  : "Time ran out. Find all three fragments, then reach the portal."}
              </p>
              <strong className="quest-score">
                {hud.score.toLocaleString()} <small>points</small>
              </strong>
              <p className="quest-result-detail">
                {hud.fragments}/3 fragments · {hud.sparks} sparks · {hud.hearts} hearts
              </p>
              <button className="quest-primary" onClick={restart}>
                <RotateCcw size={16} /> Try again
              </button>
            </div>
          </div>
        )}
        {hud.phase === "won" && (
          <section
            ref={finale}
            className={`quest-finale ${revealed ? "is-revealed" : "is-assembling"}`}
            aria-labelledby={finaleTitleId}
            tabIndex={-1}
          >
            {!revealed ? (
              <div className="quest-restoration">
                <span className="quest-kicker">THREE FRAGMENTS. ONE ORIGINAL.</span>
                <div className="quest-portal-art" aria-hidden="true">
                  <div className="quest-portal-ring" />
                  {[0, 1, 2].map((fragment) => (
                    <div className={`quest-art-shard shard-${fragment}`} key={fragment}>
                      {!artError ? <img src={artworkSrc} alt="" /> : <Sparkles size={72} />}
                    </div>
                  ))}
                </div>
                <h4 id={finaleTitleId}>{characterName} made it home.</h4>
                <p>Your art is whole. The archive has one last secret.</p>
                <button className="quest-finale-secondary" onClick={() => setRevealed(true)}>
                  Skip reveal <ArrowUpRight size={15} />
                </button>
              </div>
            ) : (
              <div className="quest-archive">
                <div className="quest-archive-art">
                  <span className="quest-archive-edition">ARTOY ARCHIVE / 001</span>
                  {!rewardImageFailed ? (
                    <img
                      src={rewardSrc}
                      alt={
                        hasCollectible
                          ? `${characterName} collectible figurine concept`
                          : `${characterName} original artwork, restored`
                      }
                      onError={() => {
                        if (hasCollectible) setCollectibleFailed(true);
                        else setRewardImageFailed(true);
                      }}
                    />
                  ) : (
                    <div className="quest-archive-placeholder">
                      <Sparkles size={52} />
                      <span>{characterName}</span>
                    </div>
                  )}
                  <div className="quest-archive-caption">
                    <span>{hasCollectible ? "COLLECTIBLE CONCEPT" : "ORIGINAL ARTWORK"}</span>
                    <strong>{characterName}</strong>
                  </div>
                </div>
                <div className="quest-archive-copy">
                  <span className="quest-kicker">
                    <Sparkles size={13} /> CHAPTER COMPLETE
                  </span>
                  <h4 id={finaleTitleId} ref={rewardHeading} tabIndex={-1}>
                    A little world.
                    <br /> A piece to keep.
                  </h4>
                  <p>
                    {hasCollectible
                      ? `You brought ${characterName} home. Now meet the collectible from their universe.`
                      : `You brought ${characterName} home. Keep the original artwork that started this universe.`}
                  </p>
                  <div
                    className="quest-archive-score"
                    aria-label={`${hud.score} points, all three fragments recovered`}
                  >
                    <strong>
                      {hud.score.toLocaleString()} <span>points</span>
                    </strong>
                    <span>
                      <Gem size={13} /> 3 / 3 recovered
                    </span>
                  </div>
                  <div className="quest-archive-actions">
                    {onExploreCollectible && (
                      <button className="quest-primary" onClick={onExploreCollectible}>
                        Explore collectibles <ArrowUpRight size={16} />
                      </button>
                    )}
                    <button
                      className="quest-finale-secondary"
                      onClick={() => void savePreview()}
                      disabled={saving || rewardImageFailed}
                    >
                      <Download size={15} />{" "}
                      {saving
                        ? "Preparing image…"
                        : hasCollectible
                          ? "Save preview"
                          : "Save original art"}
                    </button>
                    <button className="quest-finale-replay" onClick={restart}>
                      <RotateCcw size={14} /> Play again
                    </button>
                  </div>
                  <small>
                    {hasCollectible
                      ? "Concept preview · Not available to purchase yet."
                      : "Your original artwork · Collectible concepts await in the studio."}
                  </small>
                  {saveNotice && (
                    <p className="quest-save-notice" role="status">
                      {saveNotice}{" "}
                      <a href={rewardSrc} target="_blank" rel="noreferrer">
                        Open preview
                      </a>
                    </p>
                  )}
                  {rewardImageFailed && (
                    <p className="quest-save-notice" role="status">
                      The image couldn’t load. Your adventure is complete; explore the studio or
                      play again.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      <div className="quest-bottom">
        <div className="quest-objective">
          <span>
            {hud.act === "escape"
              ? "ESCAPE THE ARCHIVE"
              : hud.act === "guardian"
                ? "THE WARDEN AWAKES"
                : hud.act === "awakening"
                  ? "THE RUINS ARE ALIVE"
                  : "YOUR QUEST"}
          </span>
          <p role="status" aria-live="polite">
            {announcement}
          </p>
        </div>
        <button
          className="quest-dash"
          disabled={hud.phase !== "playing" || hud.cooldown > 0}
          onClick={() => {
            dashRequest.current = true;
            arena.current?.focus({ preventScroll: true });
          }}
        >
          <Zap size={18} fill="currentColor" />
          <span>
            {hud.cooldown > 0 ? "Recharging…" : "Dash"}
            <small>Space / tap</small>
          </span>
          <i style={{ transform: `scaleX(${1 - hud.cooldown / 1.25})` }} />
        </button>
      </div>
      <div className="quest-touch" role="group" aria-label="Touch movement controls">
        {[
          { key: "arrowleft", name: "Move left", Icon: ArrowLeft },
          { key: "arrowup", name: "Move up", Icon: ArrowUp },
          { key: "arrowdown", name: "Move down", Icon: ArrowDown },
          { key: "arrowright", name: "Move right", Icon: ArrowRight },
        ].map(({ key, name, Icon }) => (
          <button
            key={key}
            aria-label={name}
            disabled={hud.phase !== "playing"}
            onPointerDown={(event) => touchDirection(key, event)}
            onPointerUp={() => keys.current.delete(key)}
            onPointerCancel={() => keys.current.delete(key)}
            onLostPointerCapture={() => keys.current.delete(key)}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
      <footer className="quest-footer">
        <span>
          {heroReady ? "Generated game character" : "Original artwork hero"} ·{" "}
          {palette.fromArtwork ? "Colors from your art" : "Signature world palette"}
        </span>
        <span>
          {best > 0 ? `Personal best ${best.toLocaleString()}` : "Collect sparks for bonus points"}
        </span>
      </footer>
      <p className="quest-controls">
        WASD / arrows to move · Space to dash · P to pause. On touch: tap or drag a destination, or
        hold the direction buttons. Dash through inklings to stun them.
      </p>
      {artError && (
        <p className="quest-asset-note" role="alert">
          Your artwork couldn’t load. The adventure still works; try selecting the image again to
          restore your hero.
        </p>
      )}
    </div>
  );
}
