import heroArt from "@/assets/artoy/hero.png";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="pt-12 pb-8">
      <div className="mx-auto grid w-[min(1200px,94vw)] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <h1 className="text-[clamp(44px,6.4vw,80px)] font-black uppercase leading-[0.95] tracking-[-0.035em]">
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
              href="#waitlist"
              className="bg-gradient-brand shadow-glow inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white"
            >
              Join the Waitlist <ArrowRight className="size-4" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center rounded-xl border border-border bg-white/5 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white hover:bg-white/10"
            >
              See Demo Universe
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span>✦ For Artists</span>
            <span>✦ For Creators</span>
            <span>✦ For Dreamers</span>
          </div>
        </div>

        <div className="panel-surface shadow-glow relative overflow-hidden">
          <img
            src={heroArt}
            alt="Lunarie — pink-haired cyberpunk character with collectible figurine box"
            width={1280}
            height={800}
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
