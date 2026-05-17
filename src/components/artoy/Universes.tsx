import lunarie from "@/assets/artoy/lunarie.png";
import booboi from "@/assets/artoy/booboi.png";
import jaygyii from "@/assets/artoy/jaygyii.png";

const WORLDS = [
  {
    name: "Lunarie",
    tag: "Cyberpunk Dreamer",
    img: lunarie,
    desc: "Cyberpunk dreamer turned into a side-scrolling rescue game.",
    pills: ["Mini Game", "Virtual Pet", "Figurine"],
    btn: "linear-gradient(135deg, var(--purple), var(--pink))",
  },
  {
    name: "BooBoi",
    tag: "Cozy Adventurer",
    img: booboi,
    desc: "Cozy adventurer with camp quests, plush toys and sticker drops.",
    pills: ["Idle Game", "Plush", "Sticker Pack"],
    btn: "linear-gradient(135deg, #ffb84d, #ff7a3d)",
  },
  {
    name: "JayGyii",
    tag: "Chaos Creator",
    img: jaygyii,
    desc: "Chaos creature becomes a boss rush, trading card and blind box.",
    pills: ["Boss Fight", "Cards", "Vinyl Figure"],
    btn: "linear-gradient(135deg, #26e1d1, #8b5cf6)",
  },
];

export function Universes() {
  return (
    <section id="universes" className="py-11">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">Creator universes</h2>
        <p className="mb-6 text-muted-foreground">
          Real art. AI-generated experiences.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {WORLDS.map((w) => (
            <article key={w.name} className="panel-surface overflow-hidden p-0">
              <img
                src={w.img}
                alt={`${w.name} — ${w.tag}`}
                className="block h-[260px] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold">{w.name}</h3>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {w.tag}
                </p>
                <p className="mt-2 text-muted-foreground">{w.desc}</p>
                <div className="my-3.5 flex flex-wrap gap-2">
                  {w.pills.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-border bg-white/5 px-2.5 py-1.5 text-xs text-foreground/85"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <button
                  className="shadow-glow rounded-2xl px-5 py-3 font-extrabold text-white"
                  style={{ background: w.btn }}
                >
                  Play Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
