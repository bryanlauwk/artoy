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

export function Testimonials() {
  return (
    <section className="ambient-pink relative py-20">
      <div className="mx-auto w-[min(1200px,94vw)]">
        <div className="mb-10 text-center">
          <h2 className="eyebrow">What creators are saying</h2>
          <p className="mt-3 text-2xl font-black tracking-[-0.02em] md:text-3xl">
            Real creators. <span className="text-gradient-brand">Real universes.</span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.handle}
              className="relative rounded-3xl border border-border bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 transition-transform hover:-translate-y-1"
            >
              <div className="text-5xl leading-none text-pink/40">"</div>
              <blockquote className="-mt-3 text-base leading-relaxed text-foreground/90">
                {q.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 -m-0.5 rounded-full bg-gradient-to-br from-pink via-purple to-cyan" />
                  <img
                    src={q.avatar}
                    alt={q.handle}
                    loading="lazy"
                    className="relative size-11 rounded-full border-2 border-background object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-pink">{q.handle}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
