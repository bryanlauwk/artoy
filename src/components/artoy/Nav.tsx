export function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-[min(1200px,94vw)] items-center justify-between">
        <a href="#top" className="flex items-baseline gap-3">
          <span className="text-gradient-brand text-2xl font-black tracking-[-0.04em]">
            ARTOY
          </span>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Playable IP for creators
          </span>
        </a>
        <div className="hidden gap-9 text-xs font-bold uppercase tracking-[0.14em] text-foreground/80 md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#universes" className="hover:text-foreground">Universes</a>
          <a href="#creators" className="hover:text-foreground">Creators</a>
          <a href="#waitlist" className="hover:text-foreground">About</a>
        </div>
        <a
          href="#waitlist"
          className="bg-gradient-brand shadow-glow rounded-xl px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}
