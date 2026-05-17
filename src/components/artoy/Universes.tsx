const WORLDS = [
  {
    name: "Lunarie",
    emoji: "🎧 🧑‍🎤",
    desc: "Cyberpunk dreamer turned into a side-scrolling rescue game.",
    pills: ["Mini Game", "Virtual Pet", "Figurine"],
    bg: "linear-gradient(135deg, rgba(255,79,189,.38), rgba(139,92,246,.22)), radial-gradient(circle at 70% 20%, rgba(38,225,209,.22), transparent 35%), #15172a",
    btn: "linear-gradient(135deg, var(--purple), var(--pink))",
  },
  {
    name: "BooBoi",
    emoji: "🐻 📷",
    desc: "Cozy adventurer with camp quests, plush toys and sticker drops.",
    pills: ["Idle Game", "Plush", "Sticker Pack"],
    bg: "linear-gradient(135deg, rgba(255,184,77,.38), rgba(255,255,255,.08)), #17251d",
    btn: "linear-gradient(135deg, #ffb84d, #ff7a3d)",
  },
  {
    name: "JayGyii",
    emoji: "👹 ⚔️",
    desc: "Chaos creature becomes a boss rush, trading card and blind box.",
    pills: ["Boss Fight", "Cards", "Vinyl Figure"],
    bg: "linear-gradient(135deg, rgba(38,225,209,.28), rgba(139,92,246,.34)), #101622",
    btn: "linear-gradient(135deg, #26e1d1, #8b5cf6)",
  },
];

export function Universes() {
  return (
    <section id="universes" className="py-11">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">Creator universes</h2>
        <p className="mb-6 text-muted-foreground">
          Different art styles. Different worlds. Same magic.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {WORLDS.map((w) => (
            <article key={w.name} className="panel-surface overflow-hidden p-0">
              <div
                className="flex h-[210px] items-end p-5 text-5xl"
                style={{ background: w.bg }}
              >
                {w.emoji}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">{w.name}</h3>
                <p className="text-muted-foreground">{w.desc}</p>
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
