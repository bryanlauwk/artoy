const STEPS = [
  ["1", "Upload your art", "Add your character, illustration, mascot or campaign visual."],
  ["2", "AI analyzes character", "Style, world, personality, toy potential and game genre."],
  ["3", "Generate experiences", "Mini games, pets, toys, cards, wallpapers and merch mockups."],
  ["4", "Launch & grow", "Share, collect interest, sell digital or physical drops."],
];

export function HowItWorks() {
  return (
    <section id="how" className="py-11">
      <div className="panel-surface mx-auto w-[min(1180px,92vw)] p-7">
        <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">How it works</h2>
        <p className="mb-6 text-muted-foreground">
          From static artwork to playable IP in four simple steps.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, h, d]) => (
            <div key={n}>
              <div className="text-[38px] font-black text-purple">{n}</div>
              <h3 className="text-lg font-bold">{h}</h3>
              <p className="text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
