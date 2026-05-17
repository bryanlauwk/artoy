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
    <section id="creators" className="relative py-14">
      <div className="mx-auto w-[min(1200px,94vw)] panel-surface px-6 py-12 md:px-10">
        <h2 className="mb-10 text-center text-xs font-extrabold uppercase tracking-[0.32em] text-foreground/90 md:text-sm">
          Why creators love ARTOY
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div
                className="grid size-11 shrink-0 place-items-center rounded-xl"
                style={{
                  background: `color-mix(in oklab, ${color} 18%, transparent)`,
                  border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
                }}
              >
                <Icon className="size-5" style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
