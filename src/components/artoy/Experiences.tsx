const CARDS = [
  ["🎮", "Mini games", "Browser-first playable worlds."],
  ["🐾", "Virtual pets", "Character companions for fans."],
  ["🧸", "Collectible toys", "Toy concepts and drop previews."],
  ["🃏", "Trading cards", "Lore, powers and rarity systems."],
  ["🛍️", "Merch drops", "Launch physical products later."],
];

export function Experiences() {
  return (
    <section className="py-11">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">Playable experiences</h2>
        <p className="mb-6 text-muted-foreground">
          More than merch. Experiences fans can play, collect and share.
        </p>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
          {CARDS.map(([icon, t, d]) => (
            <div
              key={t}
              className="min-h-[158px] rounded-3xl border border-border bg-white/5 p-4"
            >
              <div className="mb-3.5 text-4xl">{icon}</div>
              <b>{t}</b>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
