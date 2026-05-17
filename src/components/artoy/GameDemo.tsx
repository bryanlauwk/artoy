export function GameDemo() {
  return (
    <section id="demo" className="py-11">
      <div className="panel-surface mx-auto grid w-[min(1180px,92vw)] grid-cols-1 gap-6 p-7 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">
            Game preview: Escape The Burning Room
          </h2>
          <p className="mb-5 text-muted-foreground">
            A fast, browser-first mini game generated from one uploaded character visual.
          </p>
          <div className="relative min-h-[390px] overflow-hidden rounded-3xl border border-border bg-[#160d12]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,100,45,.12), rgba(0,0,0,.75)), radial-gradient(circle at 20% 50%, rgba(255,110,40,.55), transparent 16%), radial-gradient(circle at 80% 35%, rgba(255,70,20,.55), transparent 18%), linear-gradient(90deg,#2b140e,#101015)",
              }}
            />
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
              <span className="rounded-xl border border-border bg-black/55 px-3 py-2 font-black">♥ ♥ ♥</span>
              <span className="rounded-xl border border-border bg-black/55 px-3 py-2 font-black">00:45</span>
              <span className="rounded-xl border border-border bg-black/55 px-3 py-2 font-black">PAUSE</span>
            </div>
            <div className="absolute bottom-20 left-1/2 text-[64px] drop-shadow-[0_10px_16px_#000]">
              🧑‍🎤
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <div className="flex gap-2.5">
                <Round>←</Round>
                <Round>→</Round>
              </div>
              <Round>↑</Round>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold">Generated from the artwork</h3>
          <p className="text-muted-foreground">
            ARTOY converts creator visuals into a mini-game concept, merch mockups and
            fan collectibles.
          </p>
          <div className="my-3.5 flex flex-wrap gap-2">
            {["Side-scroller", "Puzzle", "Adventure", "Shareable"].map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-white/5 px-2.5 py-1.5 text-xs text-foreground/85"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="panel-surface mt-4 p-5">
            <b>Collect & own</b>
            <p className="mb-4 text-muted-foreground">
              Figurine · Acrylic stand · T-shirt · Blind box · Digital items
            </p>
            <a
              href="#waitlist"
              className="bg-gradient-brand shadow-glow inline-block rounded-2xl px-5 py-3.5 font-extrabold text-white"
            >
              Create My Universe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Round({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid size-[52px] place-items-center rounded-full border border-border bg-white/10 font-black">
      {children}
    </div>
  );
}
