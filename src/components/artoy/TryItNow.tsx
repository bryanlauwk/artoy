import { useRef, useState } from "react";
import { UploadCloud, Sparkles, Wand2, Users, Coins, Rocket, ArrowRight, X } from "lucide-react";
import a1 from "@/assets/artoy/avatar-1.png";
import a2 from "@/assets/artoy/avatar-2.png";
import a3 from "@/assets/artoy/avatar-3.png";
import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import { UnlockDialog } from "./UnlockDialog";

const SAMPLES = [
  { src: a1, name: "Nova" },
  { src: a2, name: "Mochi" },
  { src: a3, name: "Hexx" },
];

const OUTPUTS = [
  { img: game, label: "Mini Game", accent: "var(--cyan)" },
  { img: pet, label: "Virtual Pet", accent: "var(--purple)" },
  { img: toy, label: "Toy Drop", accent: "var(--pink)" },
  { img: cards, label: "Trading Cards", accent: "var(--orange)" },
];

const FEATURES = [
  {
    icon: Wand2,
    color: "var(--pink)",
    title: "Upload once, get 5 experiences",
    desc: "Game, pet, toy, cards & wallpaper — auto-generated in your art style.",
  },
  {
    icon: Coins,
    color: "var(--orange)",
    title: "Your IP, your revenue",
    desc: "Every drop is yours. Sell digital or physical without inventory.",
  },
  {
    icon: Users,
    color: "var(--cyan)",
    title: "Built-in fandom loop",
    desc: "Fans play, collect and refer friends to unlock more of your world.",
  },
  {
    icon: Rocket,
    color: "var(--purple)",
    title: "Ship in minutes, not months",
    desc: "No code, no 3D pipeline, no studio. Just upload your character.",
  },
];

export function TryItNow() {
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => setPreview(null);

  return (
    <section id="try" className="relative py-14">
      <div className="mx-auto w-[min(1200px,94vw)] panel-surface px-6 py-12 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-foreground/70">
              Try it now
            </p>
            <h2 className="mt-1.5 text-xl font-black uppercase tracking-[0.02em] md:text-2xl">
              Drop your art. See your universe.
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-foreground/70">
            <Sparkles className="size-3 text-pink" /> Live demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* LEFT — Upload mockup */}
          <div className="rounded-2xl border border-border bg-white/[0.03] p-5">
            {!preview ? (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center transition-colors hover:border-pink/60 hover:bg-white/[0.04]"
                >
                  <span
                    className="grid size-14 place-items-center rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in oklab, var(--pink) 28%, transparent), color-mix(in oklab, var(--purple) 28%, transparent))",
                      border: "1px solid color-mix(in oklab, var(--pink) 40%, transparent)",
                    }}
                  >
                    <UploadCloud className="size-6 text-white" />
                  </span>
                  <p className="mt-4 text-base font-extrabold tracking-tight">
                    Drop your character art
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG or JPG · up to 20MB
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground/90 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-background group-hover:bg-foreground">
                    Browse files
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />

                <div className="mt-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground/60">
                    Or try a sample
                  </p>
                  <div className="mt-2.5 flex gap-2.5">
                    {SAMPLES.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setPreview(s.src)}
                        className="group relative overflow-hidden rounded-xl border border-border transition-transform hover:-translate-y-0.5"
                      >
                        <img
                          src={s.src}
                          alt={s.name}
                          loading="lazy"
                          className="block size-20 object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={preview}
                      alt="Your character"
                      className="size-28 rounded-xl border border-border object-cover"
                    />
                    <button
                      onClick={reset}
                      aria-label="Reset"
                      className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border border-border bg-background text-foreground/80 hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-pink">
                      ✦ AI generated for you
                    </p>
                    <p className="mt-1 text-sm font-extrabold tracking-tight">
                      Your universe is ready
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      4 experiences generated in your art style
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {OUTPUTS.map((o) => (
                    <div
                      key={o.label}
                      className="overflow-hidden rounded-xl border border-border"
                      style={{
                        boxShadow: `0 18px 40px -24px color-mix(in oklab, ${o.accent} 70%, transparent)`,
                      }}
                    >
                      <img
                        src={o.img}
                        alt={o.label}
                        loading="lazy"
                        className="block aspect-square w-full object-cover"
                      />
                      <p className="px-2 py-1.5 text-center text-[9px] font-extrabold uppercase tracking-[0.14em] text-foreground/80">
                        {o.label}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setOpen(true)}
                  className="bg-gradient-brand shadow-glow mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white"
                >
                  Generate my universe <ArrowRight className="size-4" />
                </button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Free preview · unlock all 5 experiences after generation
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — Key features */}
          <div className="flex flex-col justify-center gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div
                  className="grid size-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `color-mix(in oklab, ${color} 18%, transparent)`,
                    border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
                  }}
                >
                  <Icon className="size-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UnlockDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}
