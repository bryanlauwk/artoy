import { BadgeCheck, Gamepad2, Cat, Smartphone, Package, Tent, Sticker, Box, Swords, Layers, Skull, Play, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import lunarie from "@/assets/artoy/lunarie.png";
import booboi from "@/assets/artoy/booboi.png";
import jaygyii from "@/assets/artoy/jaygyii.png";
import sceneBurning from "@/assets/artoy/scene-burning.png";
import sceneCamp from "@/assets/artoy/scene-camp.png";
import sceneBoss from "@/assets/artoy/scene-boss.png";
import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import wall from "@/assets/artoy/exp-wall.png";

type Feature = { icon: LucideIcon; label: string };
type Tile = { img: string; label: string };
type MerchTile = { img: string; label: string; price: string };

type Universe = {
  name: string;
  tag: string;
  portrait: string;
  followers: string;
  drops: string;
  accent: string;
  ctaBg: string;
  detected: string[];
  features: Feature[];
  experiences: Tile[];
  merch: MerchTile[];
  hero: { img: string; title: string };
};

const WORLDS: Universe[] = [
  {
    name: "Nova",
    tag: "Cyberpunk Dreamer",
    portrait: lunarie,
    followers: "12.8K Followers",
    drops: "8 Drops",
    accent: "var(--pink)",
    ctaBg: "linear-gradient(135deg, var(--purple), var(--pink))",
    detected: ["Character detected", "Cyberpunk style", "Strong collectible potential", "Game character ready"],
    features: [
      { icon: Gamepad2, label: "Mini Game" },
      { icon: Cat, label: "Virtual Pet" },
      { icon: Smartphone, label: "Wallpaper" },
      { icon: Package, label: "Figurine" },
    ],
    experiences: [
      { img: game, label: "Neon Runner" },
      { img: pet, label: "Luna Pet" },
      { img: cards, label: "Pixel Luna" },
      { img: wall, label: "Wallpaper" },
    ],
    merch: [
      { img: toy, label: "Figurine", price: "RM129" },
      { img: cards, label: "Acrylic Stand", price: "RM39" },
      { img: wall, label: "T-Shirt", price: "RM89" },
    ],
    hero: { img: sceneBurning, title: "Neon Escape Room" },
  },
  {
    name: "BooBoi",
    tag: "Cozy Adventures",
    portrait: booboi,
    followers: "8.6K Followers",
    drops: "5 Drops",
    accent: "var(--orange)",
    ctaBg: "linear-gradient(135deg, #ffb84d, #ff7a3d)",
    detected: ["Mascot detected", "Cozy / pastel style", "Great for collectibles", "Story world potential"],
    features: [
      { icon: Gamepad2, label: "Idle Game" },
      { icon: Tent, label: "Plush Toy" },
      { icon: Sticker, label: "Sticker Pack" },
      { icon: Box, label: "Acrylic Stand" },
    ],
    experiences: [
      { img: game, label: "Boo's Camp" },
      { img: pet, label: "Boo's Room" },
      { img: cards, label: "BooBoi Comics" },
      { img: toy, label: "Sticker Pack" },
    ],
    merch: [
      { img: toy, label: "Plush Toy", price: "RM89" },
      { img: pet, label: "Tote Bag", price: "RM49" },
      { img: cards, label: "Enamel Pin", price: "RM25" },
    ],
    hero: { img: sceneCamp, title: "Mochi's Camp Adventure" },
  },
  {
    name: "Hexx",
    tag: "Chaos Creator",
    portrait: jaygyii,
    followers: "21.3K Followers",
    drops: "12 Drops",
    accent: "var(--cyan)",
    ctaBg: "linear-gradient(135deg, #26e1d1, #8b5cf6)",
    detected: ["Monster character", "Street art style", "High merch demand", "Game boss potential"],
    features: [
      { icon: Swords, label: "Boss Fight" },
      { icon: Layers, label: "Trading Cards" },
      { icon: Package, label: "Vinyl Figure" },
      { icon: Skull, label: "Blind Box" },
    ],
    experiences: [
      { img: game, label: "Boss Fight" },
      { img: pet, label: "Dark Buddy" },
      { img: cards, label: "Trading Cards" },
      { img: wall, label: "Phone Wallpaper" },
    ],
    merch: [
      { img: toy, label: "Vinyl Figure", price: "RM149" },
      { img: wall, label: "Hoodie", price: "RM139" },
      { img: cards, label: "Blind Box", price: "RM59" },
    ],
    hero: { img: sceneBoss, title: "Hexx Boss Rush" },
  },
];

export function CreatorUniverses() {
  return (
    <section id="universes" className="ambient-pink relative py-16">
      <div className="mx-auto w-[min(1400px,96vw)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/70">Creator universes</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.02em] md:text-3xl lg:text-4xl">
              Real art. AI-generated experiences.
            </h2>


          </div>
        </div>

        <div className="panel-surface flex flex-col gap-4 p-4 md:gap-5 md:p-6">
          {WORLDS.map((w) => (
            <article
              key={w.name}
              className="grid grid-cols-1 gap-4 rounded-3xl border border-border bg-white/[0.025] p-4 lg:grid-cols-[1.05fr_0.95fr_1.5fr_1.25fr]"
              style={{ boxShadow: `0 30px 80px -50px color-mix(in oklab, ${w.accent} 60%, transparent)` }}
            >
              {/* Artist card */}
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ minHeight: 280 }}
              >
                <img
                  src={w.portrait}
                  alt={`${w.name} — ${w.tag}`}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,15,30,0.92) 0%, rgba(15,15,30,0.45) 45%, transparent 100%)" }} />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Artist</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <h3 className="text-2xl font-black tracking-tight drop-shadow-lg">{w.name}</h3>
                    <BadgeCheck className="size-5" style={{ color: w.accent }} />
                  </div>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">{w.tag}</p>
                  <p className="mt-1.5 text-[11px] text-white/70">
                    {w.followers} · {w.drops}
                  </p>
                </div>
              </div>

              {/* AI suggestions */}
              <div className="rounded-2xl border border-border bg-white/[0.03] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: w.accent }}>
                  <span className="text-foreground/60">2 ›</span> AI Generate
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Analyzed traits</p>
                <ul className="mt-3 space-y-1.5">
                  {w.detected.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-foreground/85">
                      <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: w.accent }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-foreground/60">AI suggestions</p>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {w.features.map((f) => (
                    <div key={f.label} className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.04] p-2 text-center">
                      <f.icon className="size-4" style={{ color: w.accent }} />
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-foreground/75">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experiences */}
              <div className="rounded-2xl border border-border bg-white/[0.03] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: w.accent }}>
                  <span className="text-foreground/60">3 ›</span> Generated experiences
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Your art, transformed</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {w.experiences.map((e) => (
                    <div key={e.label} className="group relative overflow-hidden rounded-xl border border-border">
                      <img src={e.img} alt={e.label} loading="lazy" className="block aspect-[3/4] w-full object-cover" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute inset-x-1.5 bottom-1.5 text-center text-[9px] font-extrabold uppercase tracking-[0.1em] text-white">{e.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white"
                  style={{ background: w.ctaBg }}
                >
                  <Play className="size-3 fill-white" /> Play {w.name}'s world
                </button>
              </div>

              {/* Merch */}
              <div className="rounded-2xl border border-border bg-white/[0.03] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: w.accent }}>
                  <span className="text-foreground/60">4 ›</span> Merch preview
                </p>
                <p className="mt-1 text-xs text-muted-foreground">AI-generated mockups</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {w.merch.map((m) => (
                    <div key={m.label} className="overflow-hidden rounded-xl border border-border">
                      <img src={m.img} alt={m.label} loading="lazy" className="block aspect-square w-full object-cover" />
                      <div className="px-2 py-1.5">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-foreground/80">{m.label}</p>
                        <p className="text-[10px] font-black" style={{ color: w.accent }}>{m.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-white/[0.05] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-foreground/85 hover:bg-white/[0.1]"
                >
                  Launch Drop
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
