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
    quote:
      "I uploaded my character and got a mini game AND a toy concept in minutes!",
    handle: "@mangaka.kun",
    role: "Comic Artist",
  },
  {
    avatar: a3,
    quote:
      "My fans love the virtual pet. They don't just buy merch, they keep coming back to play and collect.",
    handle: "@lunarie.exe",
    role: "Content Creator",
  },
];

export function Testimonials() {
  return (
    <section className="py-12">
      <div className="panel-surface mx-auto w-[min(1200px,94vw)] p-7 md:p-10">
        <h2 className="mb-8 text-center text-xs font-extrabold uppercase tracking-[0.22em]">
          What creators are saying
        </h2>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[auto_1fr_auto] md:gap-4">
          <button className="hidden size-9 place-items-center self-center rounded-full border border-border bg-white/5 md:grid">
            <ChevronLeft className="size-4" />
          </button>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {QUOTES.map((q) => (
              <div key={q.handle} className="flex gap-3">
                <img
                  src={q.avatar}
                  alt={q.handle}
                  loading="lazy"
                  className="size-14 shrink-0 rounded-full border border-border object-cover"
                />
                <div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    “{q.quote}”
                  </p>
                  <p className="mt-2 text-xs font-extrabold text-pink">{q.handle}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="hidden size-9 place-items-center self-center rounded-full border border-border bg-white/5 md:grid">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
