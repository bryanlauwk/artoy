import { useRef, useState } from "react";
import { UploadCloud, Sparkles, Wand2, Users, Coins, Rocket, ArrowRight, X, Loader2 } from "lucide-react";
import a1 from "@/assets/artoy/avatar-1.png";
import a2 from "@/assets/artoy/avatar-2.png";
import a3 from "@/assets/artoy/avatar-3.png";
import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import wall from "@/assets/artoy/exp-wall.png";
import { UnlockDialog } from "./UnlockDialog";
import { toast } from "sonner";

const SAMPLES = [
  { src: a1, name: "Nova" },
  { src: a2, name: "Mochi" },
  { src: a3, name: "Hexx" },
];

const PLACEHOLDERS = [
  { img: game, label: "Mini Game", accent: "var(--cyan)" },
  { img: pet, label: "Virtual Pet", accent: "var(--purple)" },
  { img: toy, label: "Vinyl Toy", accent: "var(--pink)" },
  { img: cards, label: "Trading Card", accent: "var(--orange)" },
  { img: wall, label: "Wallpaper", accent: "var(--cyan)" },
];

const ACCENTS: Record<string, string> = {
  "Mini Game": "var(--cyan)",
  "Virtual Pet": "var(--purple)",
  "Vinyl Toy": "var(--pink)",
  "Trading Card": "var(--orange)",
  Wallpaper: "var(--cyan)",
};

const FEATURES = [
  { icon: Wand2, color: "var(--pink)", title: "Upload once, get 5 experiences", desc: "Game, pet, toy, cards & wallpaper — auto-generated in your art style." },
  { icon: Coins, color: "var(--orange)", title: "Your IP, your revenue", desc: "Every drop is yours. Sell digital or physical without inventory." },
  { icon: Users, color: "var(--cyan)", title: "Built-in fandom loop", desc: "Fans play, collect and refer friends to unlock more of your world." },
  { icon: Rocket, color: "var(--purple)", title: "Ship in minutes, not months", desc: "No code, no 3D pipeline, no studio. Just upload your character." },
];

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

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

type Result = { label: string; image: string | null; error?: string };

export function TryItNow() {
  const [preview, setPreview] = useState<string | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
    setSourceDataUrl(dataUrl);
    setResults(null);
  };

  const onSample = async (src: string) => {
    setPreview(src);
    setResults(null);
    try {
      const dataUrl = await urlToDataUrl(src);
      setSourceDataUrl(dataUrl);
    } catch {
      toast.error("Couldn't load sample image");
    }
  };

  const reset = () => {
    setPreview(null);
    setSourceDataUrl(null);
    setResults(null);
  };

  const handleUnlock = async () => {
    if (!sourceDataUrl) {
      toast.error("Please pick or upload a character first");
      return;
    }
    setGenerating(true);
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
      setOpen(false);
      const failed = json.results.filter((r) => !r.image).length;
      if (failed === 0) toast.success("Your universe is ready ✨");
      else toast.warning(`${json.results.length - failed}/${json.results.length} experiences generated`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  };

  const tiles = results
    ? results.map((r) => ({
        label: r.label,
        img: r.image,
        accent: ACCENTS[r.label] ?? "var(--pink)",
        aiGenerated: true,
        error: r.error,
      }))
    : PLACEHOLDERS.map((p) => ({ label: p.label, img: p.img as string, accent: p.accent, aiGenerated: false, error: undefined as string | undefined }));

  return (
    <section id="try" className="relative py-20">
      <div className="mx-auto w-[min(1400px,96vw)] panel-surface px-6 py-14 md:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/70">Try it now</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.02em] md:text-3xl lg:text-4xl">Drop your art. See your universe.</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-foreground/70">
            <Sparkles className="size-4 text-pink" /> Live demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT */}
          <div className="rounded-3xl border border-border bg-white/[0.03] p-6 md:p-8">
            {!preview ? (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/40 px-6 py-16 text-center transition-colors hover:border-pink/60 hover:bg-white/[0.04]"
                >
                  <span
                    className="grid size-20 place-items-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, color-mix(in oklab, var(--pink) 28%, transparent), color-mix(in oklab, var(--purple) 28%, transparent))",
                      border: "1px solid color-mix(in oklab, var(--pink) 40%, transparent)",
                    }}
                  >
                    <UploadCloud className="size-8 text-white" />
                  </span>
                  <p className="mt-5 text-lg font-extrabold tracking-tight">Drop your character art</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">PNG or JPG · up to 20MB</p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground/90 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-background group-hover:bg-foreground">
                    Browse files
                  </span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

                <div className="mt-6">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/60">Or try a sample</p>
                  <div className="mt-3 flex gap-3">
                    {SAMPLES.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => onSample(s.src)}
                        className="group relative overflow-hidden rounded-2xl border border-border transition-transform hover:-translate-y-1"
                      >
                        <img src={s.src} alt={s.name} loading="lazy" className="block size-24 object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <img src={preview} alt="Your character" className="size-36 rounded-2xl border border-border object-cover md:size-44" />
                    <button
                      onClick={reset}
                      aria-label="Reset"
                      className="absolute -right-2.5 -top-2.5 grid size-7 place-items-center rounded-full border border-border bg-background text-foreground/80 hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-pink">
                      {results ? "✦ AI generated for you" : "✦ Preview"}
                    </p>
                    <p className="mt-1.5 text-base font-extrabold tracking-tight md:text-lg">
                      {results ? "Your universe is ready" : "Your universe is being prepared"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {results
                        ? `${results.filter((r) => r.image).length} experiences generated in your art style`
                        : "5 experiences will be generated in your art style"}
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {tiles.map((t, i) => (
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

                {!results && (
                  <button
                    onClick={() => setOpen(true)}
                    disabled={generating}
                    className="bg-gradient-brand shadow-glow mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-70"
                  >
                    Generate my universe <ArrowRight className="size-5" />
                  </button>
                )}
                {!results && (
                  <p className="mt-2.5 text-center text-xs text-muted-foreground">
                    Free preview · unlock all 5 experiences after generation
                  </p>
                )}
                {results && (
                  <button
                    onClick={reset}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.04] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/80 hover:bg-white/[0.08]"
                  >
                    Try another character
                  </button>
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

      <UnlockDialog
        open={open}
        onOpenChange={(v) => !generating && setOpen(v)}
        onUnlock={handleUnlock}
        isGenerating={generating}
      />
    </section>
  );
}
