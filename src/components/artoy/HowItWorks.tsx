import { Fragment } from "react";
import { ArrowRight, Upload, Sparkles, Wand2, Rocket } from "lucide-react";
import upload from "@/assets/artoy/lunarie.png";
import analyze from "@/assets/artoy/exp-pet.png";
import generate from "@/assets/artoy/exp-toy.png";
import launch from "@/assets/artoy/scene-boss.png";

const STEPS = [
  {
    n: "01",
    title: "Upload your art",
    desc: "Drop in any character, illustration or key visual.",
    img: upload,
    icon: Upload,
    accent: "var(--purple)",
  },
  {
    n: "02",
    title: "AI analyzes your character",
    desc: "We understand your art, style and IP potential.",
    img: analyze,
    icon: Sparkles,
    accent: "var(--cyan)",
  },
  {
    n: "03",
    title: "Generate experiences",
    desc: "Instantly create mini-games, toys, pets and cards.",
    img: generate,
    icon: Wand2,
    accent: "var(--pink)",
  },
  {
    n: "04",
    title: "Launch & grow your universe",
    desc: "Share, collect and sell digital and physical drops.",
    img: launch,
    icon: Rocket,
    accent: "var(--orange)",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="ambient-cyan relative py-20">
      <div className="mx-auto w-[min(1200px,94vw)]">
        <div className="mb-12 text-center">
          <h2 className="eyebrow">How it works</h2>
          <p className="mt-3 text-2xl font-black tracking-[-0.02em] md:text-3xl">
            From static artwork to <span className="text-gradient-brand">playable IP</span> in four steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              <article className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                    className="block size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 40%, color-mix(in oklab, ${s.accent} 35%, transparent))`,
                    }}
                  />
                  <div
                    className="absolute left-3 top-3 grid size-9 place-items-center rounded-xl border border-white/30 backdrop-blur-md"
                    style={{ background: `color-mix(in oklab, ${s.accent} 35%, transparent)` }}
                  >
                    <s.icon className="size-4 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-black tracking-[0.3em]" style={{ color: s.accent }}>
                    {s.n}
                  </div>
                  <h3 className="mt-1 text-base font-extrabold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </article>
              {i < STEPS.length - 1 && (
                <div className="hidden items-center justify-center lg:flex">
                  <ArrowRight className="size-6 text-foreground/30" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
