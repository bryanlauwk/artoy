import { ChevronLeft, ChevronRight } from "lucide-react";
import a1 from "@/assets/artoy/avatar-1.png";
import a2 from "@/assets/artoy/avatar-2.png";
import a3 from "@/assets/artoy/avatar-3.png";

const QUOTES = [
  {
    avatar: a1,
    quote:
      "This feels like Pop Mart meets Roblox. Finally something for creators who dream bigger.",
    handle: "@akki_illustrates",
    role: "Illustrator",
  },
  {
    avatar: a2,
    quote: "I uploaded my character and got a mini game AND a toy concept in minutes!",
    handle: "@mangaka.kun",
    role: "Comic Artist",
  },
  {
    avatar: a3,
    quote:
      "My fans love the virtual pet. They don't just buy merch — they keep coming back to play and collect.",
    handle: "@lunarie.exe",
    role: "Content Creator",
  },
];

function Arrow({ dir }: { dir: "left" | "right" }) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      aria-label={dir === "left" ? "Previous" : "Next"}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-white/[0.04] text-foreground/70 transition-colors hover:bg-white/[0.08] hover:text-foreground"
    >
      <Icon className="size-4" />
    </button>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-14">
      <div className="mx-auto w-[min(1200px,94vw)] panel-surface px-6 py-12 md:px-10">
        <h2 className="mb-10 text-center text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/90 md:text-sm">
          What creators are saying
        </h2>
        <div className="flex items-center gap-4">
          <Arrow dir="left" />
          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
            {QUOTES.map((q) => (
              <figure key={q.handle} className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 -m-0.5 rounded-full bg-gradient-to-br from-pink via-purple to-cyan" />
                  <img
                    src={q.avatar}
                    alt={q.handle}
                    loading="lazy"
                    className="relative size-14 rounded-full border-2 border-background object-cover"
                  />
                </div>
                <div>
                  <blockquote className="text-sm leading-relaxed text-foreground/90">
                    “{q.quote}”
                  </blockquote>
                  <figcaption className="mt-2">
                    <p className="text-xs font-extrabold text-pink">{q.handle}</p>
                    <p className="text-xs text-muted-foreground">{q.role}</p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
          <Arrow dir="right" />
        </div>
      </div>
    </section>
  );
}
