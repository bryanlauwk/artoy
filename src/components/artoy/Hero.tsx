import heroArt from "@/assets/artoy/hero.png";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-10 pb-12">
      {/* Ambient glow behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 80% 30%, rgba(255,79,189,.22), transparent 60%), radial-gradient(50% 50% at 20% 80%, rgba(139,92,246,.22), transparent 65%)",
        }}
      />

      <div className="mx-auto grid w-[min(1200px,94vw)] grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative z-10">
          <h1 className="text-[clamp(40px,5.6vw,72px)] font-black uppercase leading-[0.95] tracking-[-0.035em]">
            Turn your art<br />into a{" "}
            <span className="text-gradient-brand">playable</span>{" "}
            <br className="hidden md:inline" />
            <span className="text-gradient-brand">universe</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-[1.7] text-foreground/75">
            AI transforms your characters into mini games, collectible toys, virtual
            pets and merch experiences. Build your world. Grow your fandom. Own your IP.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a
              href="#try"
              className="bg-gradient-brand shadow-glow inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white"
            >
              Try it now <ArrowRight className="size-4" />
            </a>
            <a
              href="#universes"
              className="inline-flex items-center rounded-xl border border-border bg-white/5 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white hover:bg-white/10"
            >
              See Demo Universe
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span>✦ Built for Artists</span>
            <span>✦ Built for Creators</span>
            <span>✦ Built for Dreamers</span>
          </div>
        </div>

        {/* Blended hero artwork — no panel border, soft-fade into background on all sides */}
        <div className="relative -mr-[8vw] lg:-mr-[6vw]">
          {(() => {
            const fadeMask =
              "radial-gradient(ellipse 70% 75% at 55% 50%, #000 35%, rgba(0,0,0,0.6) 60%, transparent 88%)";
            return (
              <img
                src={heroArt}
                alt="Nova — pink-haired cyberpunk character with collectible figurine box"
                width={1280}
                height={800}
                className="block h-auto w-full select-none"
                style={{
                  WebkitMaskImage: fadeMask,
                  maskImage: fadeMask,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                }}
              />
            );
          })()}
        </div>
      </div>
    </section>
  );
}
