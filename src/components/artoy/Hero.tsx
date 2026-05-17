import heroArt from "@/assets/artoy/hero.png";

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
        <div className="panel-surface shadow-glow relative overflow-hidden">
          <img
            src={heroArt}
            alt="Lunarie cyberpunk character with collectible figurine box"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
