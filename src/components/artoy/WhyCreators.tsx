import { Heart, Users, Sparkles, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; color: string; title: string; desc: string }[] = [
  {
    icon: Heart,
    color: "var(--purple)",
    title: "Bring your characters to life",
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
    <section id="creators" className="py-12">
      <div className="panel-surface mx-auto w-[min(1200px,94vw)] p-7 md:p-10">
        <h2 className="mb-9 text-center text-xs font-extrabold uppercase tracking-[0.22em]">
          Why creators love ARTOY
        </h2>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-border"
                style={{ background: `color-mix(in oklab, ${color} 18%, transparent)` }}
              >
                <Icon className="size-5" style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
