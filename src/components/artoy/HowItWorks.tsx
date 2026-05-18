import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import upload from "@/assets/artoy/lunarie.png";
import analyze from "@/assets/artoy/exp-pet.png";
import launch from "@/assets/artoy/step-launch.png";
import gameThumb from "@/assets/artoy/exp-game.png";
import toyThumb from "@/assets/artoy/exp-toy.png";
import petThumb from "@/assets/artoy/exp-pet.png";
import cardThumb from "@/assets/artoy/exp-cards.png";

type Step = {
  n: string;
  title: string;
  desc: string;
  thumbs: { img: string; label?: string }[];
};

const STEPS: Step[] = [
  {
    n: "1",
    title: "Upload your art",
    desc: "Upload any character, illustration or key visual.",
    thumbs: [{ img: upload }],
  },
  {
    n: "2",
    title: "AI analyzes your character",
    desc: "Our AI understands your art, style and character potential.",
    thumbs: [{ img: analyze }],
  },
  {
    n: "3",
    title: "Generate experiences",
    desc: "Instantly create mini games, toys, pets, cards and more.",
    thumbs: [
      { img: gameThumb, label: "Game" },
      { img: toyThumb, label: "Toy" },
      { img: petThumb, label: "Pet" },
      { img: cardThumb, label: "Card" },
    ],
  },
  {
    n: "4",
    title: "Launch & grow your universe",
    desc: "Share, collect and sell digital and physical drops.",
    thumbs: [{ img: launch }],
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-14">
      <div className="mx-auto w-[min(1200px,94vw)] panel-surface px-6 py-12 md:px-10">
        <h2 className="mb-10 text-center text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/90 md:text-sm">
          How it works
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-start lg:gap-4">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              <div className="flex flex-col items-start">
                {/* Thumbnail row */}
                {s.thumbs.length === 1 ? (
                  <div className="relative w-full overflow-hidden rounded-2xl">
                    <img
                      src={s.thumbs[0].img}
                      alt=""
                      loading="lazy"
                      className="block aspect-[4/3] w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid w-full grid-cols-4 gap-1.5">
                    {s.thumbs.map((t) => (
                      <div key={t.label} className="flex flex-col items-center gap-1">
                        <div className="aspect-square w-full overflow-hidden rounded-xl">
                          <img
                            src={t.img}
                            alt={t.label}
                            loading="lazy"
                            className="block size-full object-cover"
                          />
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-foreground/70">
                          {t.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-start gap-3">
                  <span className="text-3xl font-black leading-none text-purple/90">{s.n}</span>
                  <div>
                    <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em]">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden items-center justify-center pt-12 lg:flex">
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
