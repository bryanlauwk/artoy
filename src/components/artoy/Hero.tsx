export function Hero() {
  return (
    <section className="px-0 py-[72px] pb-7">
      <div className="mx-auto grid w-[min(1180px,92vw)] grid-cols-1 items-center gap-9 lg:grid-cols-[1.03fr_0.97fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-foreground/85">
            <span className="size-2 rounded-full bg-cyan shadow-[0_0_18px_var(--cyan)]" />
            AI toy lab for artists, OCs and creator IP
          </div>
          <h1 className="my-5 text-[clamp(46px,7vw,86px)] font-black leading-[0.94] tracking-[-0.04em]">
            Turn your art into a{" "}
            <span className="text-gradient-brand">playable universe</span>
          </h1>
          <p className="max-w-[590px] text-lg leading-[1.7] text-foreground/80">
            Upload your character or key visual. ARTOY transforms it into mini games,
            collectible toys, virtual pets, trading cards and merch experiences fans
            can play, collect and share.
          </p>
          <div className="my-7 flex flex-wrap gap-3.5">
            <a
              href="#waitlist"
              className="bg-gradient-brand shadow-glow rounded-2xl px-5 py-3.5 font-extrabold text-white"
            >
              Join the Waitlist →
            </a>
            <a
              href="#demo"
              className="rounded-2xl border border-border bg-white/5 px-5 py-3.5 font-extrabold text-white"
            >
              See Demo Universe
            </a>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>✦ For artists</span>
            <span>✦ For creators</span>
            <span>✦ For fandom builders</span>
          </div>
        </div>

        {/* Showcase */}
        <div className="panel-surface shadow-glow relative min-h-[500px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(6,8,19,.1),rgba(6,8,19,.85)), url('https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(1.3)",
            }}
          />
          <div
            className="absolute bottom-0 right-[7%] grid h-[86%] w-[56%] place-items-center rounded-[30px] text-[120px]"
            style={{
              background:
                "radial-gradient(circle at 50% 20%, rgba(255,79,189,.45), transparent 45%), linear-gradient(160deg,#1d1028,#0f1427)",
            }}
          >
            <span className="absolute left-[16%] top-[10%] text-[64px]">🎧</span>
            <span className="text-[180px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]">
              🧑‍🎤
            </span>
          </div>
          <div className="absolute bottom-[9%] left-[8%] right-[8%] grid grid-cols-3 gap-3">
            {[
              ["Mini Game", "Escape The Burning Room"],
              ["Collectible", "Lunarie blind box"],
              ["Merch", "QR-linked drops"],
            ].map(([t, s]) => (
              <div
                key={t}
                className="rounded-2xl border border-border bg-background/75 p-3.5 backdrop-blur-md"
              >
                <b className="block text-sm">{t}</b>
                <span className="text-xs text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
