import { Heart, Users, Sparkles, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; color: string; title: string; desc: string }[] = [
  {
    icon: Heart,
    color: "var(--purple)",
    title: "Bring characters to life",
    desc: "Turn static art into interactive games, pets and collectibles.",
  },
  {
    icon: Users,
    color: "var(--cyan)",
    title: "Build a real fandom",
    desc: "Fans play, collect, trade and share your universe.",
  },
  {
    icon: Sparkles,
    color: "var(--pink)",
    title: "AI expands your world",
    desc: "Generate new stories, toys and adventures in your style.",
  },
  {
    icon: ShoppingBag,
    color: "var(--orange)",
    title: "Monetize your IP",
    desc: "Launch digital and physical drops without inventory risk.",
  },
];

export function WhyCreators() {
  return (
    <section id="creators" className="relative py-20">
      <div className="mx-auto w-[min(1200px,94vw)]">
        <div className="mb-12 text-center">
          <h2 className="eyebrow">Why creators love ARTOY</h2>
          <p className="mt-3 text-2xl font-black tracking-[-0.02em] md:text-3xl">
            Built for the next generation of <span className="text-gradient-brand">IP-first</span> creators.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 transition-transform hover:-translate-y-1"
            >
              <div
                className="absolute -right-10 -top-10 size-32 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-80"
                style={{ background: `color-mix(in oklab, ${color} 40%, transparent)` }}
              />
              <div
                className="relative grid size-12 place-items-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, color-mix(in oklab, ${color} 30%, transparent), color-mix(in oklab, ${color} 10%, transparent))`,
                  border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
                }}
              >
                <Icon className="size-6" style={{ color }} />
              </div>
              <h3 className="relative mt-4 text-base font-extrabold tracking-tight">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
