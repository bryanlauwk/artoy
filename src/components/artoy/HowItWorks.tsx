import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import upload from "@/assets/artoy/lunarie.png";
import launch from "@/assets/artoy/step-launch.png";
import gameThumb from "@/assets/artoy/exp-game.png";
import toyThumb from "@/assets/artoy/exp-toy.png";
import petThumb from "@/assets/artoy/exp-pet.png";
import cardThumb from "@/assets/artoy/exp-cards.png";

type Step = {
  n: string;
  title: string;
  desc: string;
  hero?: string;
  mosaic?: string[];
};

const STEPS: Step[] = [
  { n: "1", title: "Upload your art", desc: "Drop any character, illustration or key visual.", hero: upload },
  { n: "2", title: "AI builds your universe", desc: "Games, pets, toys and merch — all in your art style.", mosaic: [gameThumb, toyThumb, petThumb, cardThumb] },
  { n: "3", title: "Launch & grow", desc: "Share, collect and sell digital + physical drops.", hero: launch },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-14">
      <div className="mx-auto w-[min(1200px,94vw)] panel-surface px-6 py-12 md:px-10">
        <h2 className="mb-10 text-center text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/90 md:text-sm">
          How it works
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-4">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              <div className="flex flex-col items-start">
                {/* Thumbnail — same aspect-[4/3] footprint for every step */}
                <div className="relative w-full overflow-hidden rounded-2xl border border-border">
                  {s.hero ? (
                    <img
                      src={s.hero}
                      alt=""
                      loading="lazy"
                      className="block aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] w-full grid-cols-2 grid-rows-2 gap-0.5 bg-background/40 p-0.5">
                      {s.mosaic!.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt=""
                          loading="lazy"
                          className="block size-full rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <span className="text-3xl font-black leading-none text-purple/90">{s.n}</span>
                  <div>
                    <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em]">{s.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden h-full items-center justify-center pb-20 lg:flex">
                  <ArrowRight className="size-5 text-foreground/40" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
