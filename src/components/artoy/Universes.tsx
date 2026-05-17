import { BadgeCheck, Gamepad2, Cat, Smartphone, Package, Tent, Sticker, Box, Swords, Layers, Skull } from "lucide-react";
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
  features: { icon: LucideIcon; label: string }[];
  scene: { img: string; title: string; cta: string; ctaBg: string };
};

const WORLDS: Universe[] = [
  {
    name: "Nova",
    tag: "Cyberpunk Dreamer",
    img: lunarie,
    features: [
      { icon: Gamepad2, label: "Mini Game" },
      { icon: Cat, label: "Virtual Pet" },
      { icon: Smartphone, label: "Wallpaper" },
      { icon: Package, label: "Figurine" },
    ],
    scene: {
      img: sceneBurning,
      title: "Neon Escape Room",
      cta: "Play Now",
      ctaBg: "linear-gradient(135deg, var(--purple), var(--pink))",
    },
  },
  {
    name: "Mochi",
    tag: "Cozy Adventurer",
    img: booboi,
    features: [
      { icon: Gamepad2, label: "Idle Game" },
      { icon: Tent, label: "Plush Toy" },
      { icon: Sticker, label: "Sticker Pack" },
      { icon: Box, label: "Acrylic Stand" },
    ],
    scene: {
      img: sceneCamp,
      title: "Mochi's Camp Adventure",
      cta: "Play Now",
      ctaBg: "linear-gradient(135deg, #ffb84d, #ff7a3d)",
    },
  },
  {
    name: "Hexx",
    tag: "Chaos Creator",
    img: jaygyii,
    features: [
      { icon: Swords, label: "Boss Fight" },
      { icon: Layers, label: "Trading Cards" },
      { icon: Package, label: "Vinyl Figure" },
      { icon: Skull, label: "Blind Box" },
    ],
    scene: {
      img: sceneBoss,
      title: "Hexx Boss Rush",
      cta: "Play Now",
      ctaBg: "linear-gradient(135deg, #26e1d1, #8b5cf6)",
    },
  },
];

export function Universes() {
  return (
    <section id="universes" className="py-12">
      <div className="mx-auto w-[min(1200px,94vw)]">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.22em]">
              Creator universes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real art. AI-generated experiences.
            </p>
          </div>
          <a
            href="#waitlist"
            className="hidden text-xs font-extrabold uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground md:inline"
          >
            View all universes →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {WORLDS.map((w) => (
            <article key={w.name} className="panel-surface overflow-hidden p-0">
              <div className="relative">
                <img
                  src={w.img}
                  alt={`${w.name} — ${w.tag}`}
                  loading="lazy"
                  className="block h-[280px] w-full object-cover"
                />
                <div className="absolute left-4 top-4">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-black tracking-tight drop-shadow-lg">
                      {w.name}
                    </h3>
                    <BadgeCheck className="size-5 fill-cyan text-background" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/85 drop-shadow">
                    {w.tag}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 px-4 pt-4">
                {w.features.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-white/5 p-2 text-center"
                  >
                    <f.icon className="size-5 text-pink" />
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-foreground/80">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4">
                <div className="relative overflow-hidden rounded-2xl border border-border">
                  <img
                    src={w.scene.img}
                    alt={w.scene.title}
                    loading="lazy"
                    className="block h-[150px] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-3 px-4">
                    <span className="text-xs font-black uppercase tracking-wider drop-shadow">
                      {w.scene.title}
                    </span>
                  </div>
                  <button
                    className="absolute bottom-3 right-3 rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg"
                    style={{ background: w.scene.ctaBg }}
                  >
                    {w.scene.cta} →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-pink" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        </div>
      </div>
    </section>
  );
}
