import { useEffect, useState } from "react";
import { Sparkles, Wand2, Users, Coins, Rocket, Loader2, RefreshCw, ShoppingBag, Gamepad2, Lock, Trophy } from "lucide-react";
import { PixelSocialSim, type SampleId } from "./PixelSocialSim";
import { loadBests, isUnlocked, prevStage, type BestsBlob } from "./meccha/storage";
import { formatMs } from "./meccha/scoring";
import a1 from "@/assets/artoy/avatar-1.png";
import a2 from "@/assets/artoy/avatar-2.png";
import a3 from "@/assets/artoy/avatar-3.png";
import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import wall from "@/assets/artoy/exp-wall.png";
import { toast } from "sonner";

const SAMPLES: { id: SampleId; src: string; name: string; tagline: string; accent: string }[] = [
  { id: "nova",  src: a1, name: "Nova",  tagline: "Sci-fi pilot · cyan plaza",     accent: "var(--cyan)" },
  { id: "mochi", src: a2, name: "Mochi", tagline: "Pastel mascot · pink town",    accent: "var(--pink)" },
  { id: "hexx",  src: a3, name: "Hexx",  tagline: "Neon punk · arcade alley",     accent: "var(--orange)" },
];

const EXP_PLACEHOLDERS = [
  { img: game, label: "Mini Game", accent: "var(--cyan)" },
  { img: pet, label: "Virtual Pet", accent: "var(--purple)" },
  { img: toy, label: "Vinyl Toy", accent: "var(--pink)" },
  { img: cards, label: "Trading Card", accent: "var(--orange)" },
  { img: wall, label: "Wallpaper", accent: "var(--cyan)" },
];

const MERCH_PLACEHOLDERS = [
  { img: toy, label: "Figurine", price: "RM129", accent: "var(--pink)" },
  { img: cards, label: "Acrylic Stand", price: "RM39", accent: "var(--orange)" },
  { img: wall, label: "T-Shirt", price: "RM89", accent: "var(--purple)" },
];

const ACCENTS: Record<string, string> = {
  "Mini Game": "var(--cyan)",
  "Virtual Pet": "var(--purple)",
  "Vinyl Toy": "var(--pink)",
  "Trading Card": "var(--orange)",
  Wallpaper: "var(--cyan)",
  Figurine: "var(--pink)",
  "Acrylic Stand": "var(--orange)",
  "T-Shirt": "var(--purple)",
};

const MERCH_PRICES: Record<string, string> = {
  Figurine: "RM129",
  "Acrylic Stand": "RM39",
  "T-Shirt": "RM89",
};

const FEATURES = [
  { icon: Wand2, color: "var(--pink)", title: "Pick once, get a full universe", desc: "5 experiences + 3 merch mockups + 1 playable mini-game — all synced to the selected character." },
  { icon: Coins, color: "var(--orange)", title: "Your IP, your revenue", desc: "Every drop is yours. Sell digital or physical without inventory." },
  { icon: Users, color: "var(--cyan)", title: "Built-in fandom loop", desc: "Fans play, collect and refer friends to unlock more of your world." },
  { icon: Rocket, color: "var(--purple)", title: "Ship in minutes, not months", desc: "No code, no 3D pipeline, no studio. Start from a character and prove the loop instantly." },
];

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

type Result = { label: string; kind: "experience" | "merch"; image: string | null; error?: string };

export function TryItNow() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<SampleId | null>(null);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [bests, setBests] = useState<BestsBlob>(() => loadBests());

  // Refresh bests when returning to the picker (after a game) — cheap, no listener needed.
  useEffect(() => {
    if (!selectedSampleId) setBests(loadBests());
  }, [selectedSampleId]);


  const runGeneration = async (sourceDataUrl: string) => {
    setGenerating(true);
    setResults(null);
    try {
      const res = await fetch("/api/generate-universe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: sourceDataUrl }),
      });
      const json = (await res.json()) as { results?: Result[]; error?: string };
      if (!res.ok || !json.results) {
        const msg = json.error ?? `Generation failed (${res.status})`;
        if (res.status === 402) toast.error("AI credits exhausted — add credits in Workspace settings.");
        else if (res.status === 429) toast.error("Rate limited — try again in a moment.");
        else toast.error(msg.slice(0, 140));
        return;
      }
      setResults(json.results);
      const failed = json.results.filter((r) => !r.image).length;
      if (failed === 0) toast.success("Your universe is ready ✨");
      else toast.warning(`${json.results.length - failed}/${json.results.length} assets generated`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  };

  const onSample = async (sample: typeof SAMPLES[number]) => {
    if (!isUnlocked(sample.id, bests)) {
      const prev = prevStage(sample.id);
      const prevName = prev ? SAMPLES.find((x) => x.id === prev)?.name : "previous stage";
      toast.error(`Clear ${prevName} first to unlock ${sample.name}.`);
      return;
    }
    setSelectedSampleId(sample.id);
    setPreview(sample.src);
    try {
      const dataUrl = await urlToDataUrl(sample.src);
      await runGeneration(dataUrl);
    } catch {
      toast.error("Couldn't load sample image");
    }
  };


  const reset = () => {
    setPreview(null);
    setSelectedSampleId(null);
    setResults(null);
  };

  const regenerate = async () => {
    if (!preview) return;
    try {
      const dataUrl = preview.startsWith("data:") ? preview : await urlToDataUrl(preview);
      await runGeneration(dataUrl);
    } catch {
      toast.error("Couldn't reload source image");
    }
  };

  const experiences = results
    ? results.filter((r) => r.kind === "experience").map((r) => ({ label: r.label, img: r.image, accent: ACCENTS[r.label] ?? "var(--pink)", aiGenerated: true, error: r.error }))
    : EXP_PLACEHOLDERS.map((p) => ({ label: p.label, img: p.img as string, accent: p.accent, aiGenerated: false, error: undefined as string | undefined }));

  const merch = results
    ? results.filter((r) => r.kind === "merch").map((r) => ({ label: r.label, img: r.image, price: MERCH_PRICES[r.label] ?? "—", accent: ACCENTS[r.label] ?? "var(--pink)", aiGenerated: true, error: r.error }))
    : MERCH_PLACEHOLDERS.map((p) => ({ label: p.label, img: p.img as string, price: p.price, accent: p.accent, aiGenerated: false, error: undefined as string | undefined }));

  const activeSample = SAMPLES.find((s) => s.id === selectedSampleId);

  return (
    <section id="try" className="relative py-20">
      <div className="mx-auto w-[min(1400px,96vw)] panel-surface px-6 py-14 md:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/70">Try it now</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.02em] md:text-3xl lg:text-4xl">Pick a character. Get your universe.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tap a sample — your universe and a playable mini-game build themselves.</p>

          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-foreground/70">
            <Sparkles className="size-4 text-pink" /> Live demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT */}
          <div className="rounded-3xl border border-border bg-white/[0.03] p-6 md:p-8">
            {!preview ? (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/60">Pick a character to start</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {SAMPLES.map((s) => {
                    const unlocked = isUnlocked(s.id, bests);
                    const myBest = bests[s.id];
                    const needName = !unlocked && prevStage(s.id) ? SAMPLES.find((x) => x.id === prevStage(s.id))!.name : null;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSample(s)}
                        className={`group relative overflow-hidden rounded-2xl border border-border bg-background/40 text-left transition-transform ${unlocked ? "hover:-translate-y-1" : "opacity-70"}`}
                        style={{ boxShadow: unlocked ? `0 18px 50px -28px color-mix(in oklab, ${s.accent} 80%, transparent)` : undefined }}
                      >
                        <img src={s.src} alt={s.name} loading="lazy" className={`block aspect-square w-full object-cover ${unlocked ? "" : "grayscale"}`} />
                        {!unlocked && (
                          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/55">
                            <div className="flex flex-col items-center gap-1">
                              <Lock className="size-6" style={{ color: s.accent }} />
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
                                Clear {needName} first
                              </p>
                            </div>
                          </div>
                        )}
                        {myBest.bestScore > 0 && (
                          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                            <Trophy className="size-3" style={{ color: s.accent }} /> {myBest.bestScore}
                          </span>
                        )}
                        <div className="px-3 py-3">
                          <p className="text-sm font-black uppercase tracking-[0.14em]" style={{ color: s.accent }}>{s.name}</p>
                          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/60">
                            {s.tagline}
                            {myBest.bestMs > 0 && <span className="ml-1 text-foreground/40">· best {formatMs(myBest.bestMs)}</span>}
                          </p>
                        </div>
                        {unlocked && (
                          <span
                            className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg px-2 py-1.5 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-white opacity-0 transition-opacity group-hover:opacity-100"
                            style={{ background: `color-mix(in oklab, ${s.accent} 80%, black 20%)` }}
                          >
                            ✦ Generate universe
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Clear a stage to unlock the next
                </p>

              </div>
            ) : (
              <div>
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img src={preview} alt="Your character" className="size-24 rounded-2xl border border-border object-cover sm:size-36 md:size-44" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-pink">
                      {generating ? "✦ Generating…" : results ? `✦ ${activeSample?.name ?? ""}'s universe` : "✦ Preview"}
                    </p>
                    <p className="mt-1.5 text-base font-extrabold tracking-tight md:text-lg">
                      {generating ? "Building your universe" : results ? "Your universe is ready" : "Preparing"}
                    </p>
                  </div>
                </div>


                {/* Experiences row */}
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/70">
                      <span className="text-purple">3 ›</span> Generated experiences
                    </p>
                  </div>
                  <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {experiences.map((t, i) => (
                      <div
                        key={`${t.label}-${i}`}
                        className="relative overflow-hidden rounded-2xl border border-border"
                        style={{ boxShadow: `0 18px 40px -24px color-mix(in oklab, ${t.accent} 70%, transparent)` }}
                      >
                        {t.img ? (
                          <img src={t.img} alt={t.label} loading="lazy" className={`block aspect-[4/5] w-full object-cover ${generating ? "opacity-60" : ""}`} />
                        ) : (
                          <div className="grid aspect-[4/5] w-full place-items-center bg-white/[0.03] p-3 text-center text-xs text-muted-foreground">
                            {t.error ? "Failed" : "—"}
                          </div>
                        )}
                        {t.aiGenerated && t.img && (
                          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                            ✦ AI
                          </span>
                        )}
                        <p className="px-2.5 py-2 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/80">
                          {t.label}
                        </p>
                      </div>
                    ))}
                    {generating && (
                      <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-background/40 backdrop-blur-[2px]">
                        <div className="flex items-center gap-2.5 rounded-full bg-background/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em]">
                          <Loader2 className="size-4 animate-spin text-pink" /> Generating your universe…
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Merch row */}
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/70">
                      <span className="text-orange">4 ›</span> Merch preview
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      <ShoppingBag className="size-3" /> Mock pricing
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {merch.map((m, i) => (
                      <div
                        key={`${m.label}-${i}`}
                        className="relative overflow-hidden rounded-2xl border border-border"
                        style={{ boxShadow: `0 18px 40px -24px color-mix(in oklab, ${m.accent} 70%, transparent)` }}
                      >
                        {m.img ? (
                          <img src={m.img} alt={m.label} loading="lazy" className={`block aspect-square w-full object-cover ${generating ? "opacity-60" : ""}`} />
                        ) : (
                          <div className="grid aspect-square w-full place-items-center bg-white/[0.03] p-3 text-center text-xs text-muted-foreground">
                            {m.error ? "Failed" : "—"}
                          </div>
                        )}
                        {m.aiGenerated && m.img && (
                          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                            ✦ AI
                          </span>
                        )}
                        <div className="flex items-center justify-between px-2.5 py-2">
                          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-foreground/80">{m.label}</p>
                          <p className="text-xs font-black" style={{ color: m.accent }}>{m.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pixel Social Sim — actually playable, unlocks after universe + merch are ready */}
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/70">
                      <span className="text-pink">5 ›</span> Ultimate playable experience
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                      style={{
                        background: results && !generating ? "color-mix(in oklab, var(--pink) 22%, transparent)" : "rgba(255,255,255,0.06)",
                        color: results && !generating ? "var(--pink)" : "rgb(255 255 255 / 0.55)",
                      }}
                    >
                      <Gamepad2 className="size-3" />
                      {results && !generating
                        ? `Meccha Chameleon · ${activeSample?.name ?? "Demo"}'s stage`
                        : "Locked"}

                    </span>
                  </div>
                  {results && !generating ? (
                    <PixelSocialSim avatarSrc={preview} sampleId={selectedSampleId} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-white/[0.03] p-8 text-center">
                      {generating ? (
                        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/70">
                          <Loader2 className="size-4 animate-spin text-pink" />
                          Building {activeSample?.name ?? "your"}'s universe…
                        </div>
                      ) : (
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/60">
                          Mini-game unlocks once your universe finishes generating
                        </p>
                      )}

                    </div>
                  )}
                </div>



                {results && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      onClick={regenerate}
                      disabled={generating}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.04] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/85 hover:bg-white/[0.08] disabled:opacity-60"
                    >
                      <RefreshCw className="size-4" /> Regenerate
                    </button>
                    <button
                      onClick={reset}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.04] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/85 hover:bg-white/[0.08]"
                    >
                      Try another character
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="grid size-14 shrink-0 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in oklab, ${color} 18%, transparent)`,
                    border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
                  }}
                >
                  <Icon className="size-6" style={{ color }} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight md:text-lg">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
