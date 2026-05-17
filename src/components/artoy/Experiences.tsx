import game from "@/assets/artoy/exp-game.png";
import pet from "@/assets/artoy/exp-pet.png";
import toy from "@/assets/artoy/exp-toy.png";
import cards from "@/assets/artoy/exp-cards.png";
import wall from "@/assets/artoy/exp-wall.png";

const CARDS = [
  [game, "Mini games", "Browser-first playable worlds."],
  [pet, "Virtual pets", "Character companions for fans."],
  [toy, "Collectible toys", "Toy concepts and drop previews."],
  [cards, "Trading cards", "Lore, powers and rarity systems."],
  [wall, "Interactive wallpapers", "Animated lockscreens and drops."],
] as const;

export function Experiences() {
  return (
    <section className="py-11">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">Playable experiences</h2>
        <p className="mb-6 text-muted-foreground">
          More than merch. Experiences fans can play, collect and share.
        </p>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
          {CARDS.map(([img, t, d]) => (
            <div
              key={t}
              className="overflow-hidden rounded-3xl border border-border bg-white/5"
            >
              <img src={img} alt={t} className="block h-36 w-full object-cover" />
              <div className="p-4">
                <b>{t}</b>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
