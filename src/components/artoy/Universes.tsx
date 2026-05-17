import { BadgeCheck, Gamepad2, Cat, Smartphone, Package, Tent, Sticker, Box, Swords, Layers, Skull, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import lunarie from "@/assets/artoy/lunarie.png";
import booboi from "@/assets/artoy/booboi.png";
import jaygyii from "@/assets/artoy/jaygyii.png";
import sceneBurning from "@/assets/artoy/scene-burning.png";
import sceneCamp from "@/assets/artoy/scene-camp.png";
import sceneBoss from "@/assets/artoy/scene-boss.png";

type Universe = {
  name: string;
  tag: string;
  img: string;
  accent: string;
  features: { icon: LucideIcon; label: string }[];
  scene: { img: string; title: string; ctaBg: string };
};

const WORLDS: Universe[] = [
  {
    name: "Nova",
    tag: "Cyberpunk Dreamer",
    img: lunarie,
    accent: "var(--pink)",
    features: [
      { icon: Gamepad2, label: "Mini Game" },
      { icon: Cat, label: "Virtual Pet" },
      { icon: Smartphone, label: "Wallpaper" },
      { icon: Package, label: "Figurine" },
    ],
    scene: {
      img: sceneBurning,
      title: "Neon Escape Room",
      ctaBg: "linear-gradient(135deg, var(--purple), var(--pink))",
    },
  },
  {
    name: "Mochi",
    tag: "Cozy Adventurer",
    img: booboi,
    accent: "var(--orange)",
    features: [
      { icon: Gamepad2, label: "Idle Game" },
      { icon: Tent, label: "Plush Toy" },
      { icon: Sticker, label: "Sticker Pack" },
      { icon: Box, label: "Acrylic Stand" },
    ],
    scene: {
      img: sceneCamp,
      title: "Mochi's Camp Adventure",
      ctaBg: "linear-gradient(135deg, #ffb84d, #ff7a3d)",
    },
  },
  {
    name: "Hexx",
    tag: "Chaos Creator",
    img: jaygyii,
    accent: "var(--cyan)",
    features: [
      { icon: Swords, label: "Boss Fight" },
      { icon: Layers, label: "Trading Cards" },
      { icon: Package, label: "Vinyl Figure" },
      { icon: Skull, label: "Blind Box" },
    ],
    scene: {
      img: sceneBoss,
      title: "Hexx Boss Rush",
      ctaBg: "linear-gradient(135deg, #26e1d1, #8b5cf6)",
    },
  },
];

export function Universes() {
  return (
    <section id="universes" className="ambient-pink relative py-16">
      <div className="mx-auto w-[min(1200px,94vw)]">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-[0.04em] md:text-2xl">
              Creator universes
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Real art. AI-generated experiences.
            </p>
          </div>
          <a
            href="#waitlist"
            className="hidden text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground md:inline"
          >
            View all universes →
          </a>
        </div>

        <div className="relative">
          <button
            aria-label="Previous"
            className="absolute -left-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/70 text-foreground/70 backdrop-blur-md hover:text-foreground md:grid lg:-left-6"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Next"
            className="absolute -right-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/70 text-foreground/70 backdrop-blur-md hover:text-foreground md:grid lg:-right-6"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WORLDS.map((w) => (
            <article
              key={w.name}
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-border bg-gradient-to-b from-white/[0.06] to-white/[0.02] transition-transform hover:-translate-y-1"
              style={{
                boxShadow: `0 30px 80px -40px color-mix(in oklab, ${w.accent} 80%, transparent)`,
              }}
            >
              {/* Character portrait — dominant */}
              <div className="relative h-[340px] overflow-hidden">
                <img
                  src={w.img}
                  alt={`${w.name} — ${w.tag}`}
                  loading="lazy"
                  className="block size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,15,30,0.92) 0%, rgba(15,15,30,0.55) 45%, transparent 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-2xl font-black tracking-tight drop-shadow-lg">{w.name}</h3>
                    <BadgeCheck className="size-5" style={{ color: w.accent }} />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    {w.tag}
                  </p>
                </div>
              </div>

              {/* Feature chips */}
              <div className="grid grid-cols-4 gap-1.5 px-5 pt-4">
                {w.features.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.04] p-2 text-center transition-colors hover:bg-white/[0.08]"
                  >
                    <f.icon className="size-4" style={{ color: w.accent }} />
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-foreground/75">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Scene preview — flush */}
              <div className="relative mx-5 mb-5 mt-4 overflow-hidden rounded-2xl">
                <img
                  src={w.scene.img}
                  alt={w.scene.title}
                  loading="lazy"
                  className="block h-[160px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                <span className="absolute left-3 top-3 text-[11px] font-black uppercase tracking-[0.16em] text-white drop-shadow">
                  {w.scene.title}
                </span>
                <button
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white shadow-lg transition-transform hover:scale-105"
                  style={{ background: w.scene.ctaBg }}
                >
                  <Play className="size-3 fill-white" /> Play Now
                </button>
              </div>
            </article>
          ))}
          </div>
        </div>

        <div className="mt-7 flex justify-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-pink" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        </div>
      </div>
    </section>
  );
}
