export function Nav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] w-[min(1180px,92vw)] items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="text-gradient-brand text-3xl font-black tracking-[-0.04em]">
            ARTOY
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Playable IP for creators
          </span>
        </div>
        <div className="hidden gap-7 text-sm text-foreground/85 md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#universes" className="hover:text-foreground">Universes</a>
          <a href="#demo" className="hover:text-foreground">Game demo</a>
          <a href="#waitlist" className="hover:text-foreground">Waitlist</a>
        </div>
        <a
          href="#waitlist"
          className="bg-gradient-brand shadow-glow rounded-2xl px-5 py-3.5 text-sm font-extrabold text-white"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}
