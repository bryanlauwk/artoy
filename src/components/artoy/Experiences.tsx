import { Play } from "lucide-react";
import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import wall from "@/assets/artoy/exp-wall.png";

const CARDS = [
  { img: game, label: "Mini Games" },
  { img: pet, label: "Virtual Pets" },
  { img: toy, label: "Collectible Toys" },
  { img: cards, label: "Trading Cards" },
  { img: wall, label: "Interactive Wallpapers" },
];

export function Experiences() {
  return (
    <section className="py-12">
      <div className="panel-surface mx-auto w-[min(1200px,94vw)] p-7 md:p-10">
        <h2 className="mb-1 text-xs font-extrabold uppercase tracking-[0.22em]">
          Playable experiences
        </h2>
        <p className="mb-7 text-sm text-muted-foreground">
          More than merch. These are experiences your fans can play, collect and share.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CARDS.map((c) => (
            <div key={c.label} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={c.img}
                  alt={c.label}
                  loading="lazy"
                  className="block aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
                <button className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full border border-white/40 bg-background/70 backdrop-blur-md">
                  <Play className="size-3.5 fill-white text-white" />
                </button>
              </div>
              <p className="mt-2.5 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-foreground/85">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
