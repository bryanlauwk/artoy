import { ArrowRight, ArrowUp } from "lucide-react";
import upload from "@/assets/artoy/lunarie.png";
import analyze from "@/assets/artoy/exp-pet.png";
import game from "@/assets/artoy/exp-game.png";
import toy from "@/assets/artoy/exp-toy.png";
import pet from "@/assets/artoy/exp-pet.png";
import cards from "@/assets/artoy/exp-cards.png";
import launch from "@/assets/artoy/scene-boss.png";

const STEPS = [
  {
    n: "1",
    title: "Upload your art",
    desc: "Upload any character, illustration or key visual.",
    images: [upload],
  },
  {
    n: "2",
    title: "AI analyzes your character",
    desc: "Our AI understands your art, style and character potential.",
    images: [analyze],
  },
  {
    n: "3",
    title: "Generate experiences",
    desc: "Instantly create mini games, toys, pets, cards and more.",
    images: [game, toy, pet, cards],
  },
  {
    n: "4",
    title: "Launch & grow your universe",
    desc: "Share, collect and sell digital and physical drops.",
    images: [launch],
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-10">
      <div className="panel-surface mx-auto w-[min(1200px,94vw)] p-7 md:p-10">
        <h2 className="mb-1 text-center text-xs font-extrabold uppercase tracking-[0.22em] text-foreground/80">
          How it works
        </h2>
        <p className="mb-9 text-center text-muted-foreground">
          From static artwork to playable IP in four simple steps.
        </p>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
          {STEPS.map((s, i) => (
            <>
              <div key={s.n}>
                <div className="mb-3 flex gap-2">
                  {s.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      loading="lazy"
                      className="size-16 rounded-xl border border-border object-cover"
                    />
                  ))}
                </div>
                <div className="text-3xl font-black text-purple">{s.n}</div>
                <h3 className="mt-1 text-sm font-extrabold uppercase tracking-wider">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  key={`arrow-${i}`}
                  className="hidden size-7 text-foreground/40 lg:block"
                />
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

// silence unused import warning when lucide ArrowUp not used
void ArrowUp;
