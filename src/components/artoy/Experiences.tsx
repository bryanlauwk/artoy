import { Play } from "lucide-react";
import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import wall from "@/assets/artoy/exp-wall.png";

const CARDS = [
  { img: game, label: "Mini Games", accent: "var(--cyan)" },
  { img: pet, label: "Virtual Pets", accent: "var(--purple)" },
  { img: toy, label: "Collectible Toys", accent: "var(--pink)" },
  { img: cards, label: "Trading Cards", accent: "var(--orange)" },
  { img: wall, label: "Interactive Wallpapers", accent: "var(--pink)" },
];

export function Experiences() {
  return (
    <section className="ambient-warm relative py-20">
      <div className="mx-auto w-[min(1200px,94vw)]">
        <div className="mb-8">
          <h2 className="eyebrow">Playable experiences</h2>
          <p className="mt-2 max-w-2xl text-2xl font-black tracking-[-0.02em] md:text-3xl">
            More than merch. Experiences your fans <span className="text-gradient-brand">play, collect &amp; share</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CARDS.map((c) => (
            <div key={c.label} className="group">
              <div
                className="relative overflow-hidden rounded-3xl border border-border transition-transform group-hover:-translate-y-1"
                style={{
                  boxShadow: `0 24px 60px -30px color-mix(in oklab, ${c.accent} 70%, transparent)`,
                }}
              >
                <img
                  src={c.img}
                  alt={c.label}
                  loading="lazy"
                  className="block aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                <button
                  aria-label={`Play ${c.label}`}
                  className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full border border-white/40 bg-background/40 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Play className="size-4 fill-white text-white" />
                </button>
                <div className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full border border-white/40 bg-background/60 backdrop-blur-md group-hover:opacity-0 transition-opacity">
                  <Play className="size-3 fill-white text-white" />
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-foreground/80">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
