import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export function Nav({ onCreate }: { onCreate: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="artoy-nav">
      <a className="artoy-logo" href="#top" aria-label="ARTOY home">
        <b>ARTOY</b>
        <span>Your art, brought to life</span>
      </a>
      <nav
        className={menuOpen ? "artoy-links is-open" : "artoy-links"}
        aria-label="Main navigation"
      >
        <a href="#explore" onClick={() => setMenuOpen(false)}>
          Explore
        </a>
        <a href="#how" onClick={() => setMenuOpen(false)}>
          How it works
        </a>
      </nav>
      <div className="artoy-nav-actions">
        <button
          className="artoy-cta nav-cta"
          onClick={() => {
            setMenuOpen(false);
            onCreate();
          }}
        >
          Try it now <ArrowRight size={16} />
        </button>
        <button
          className="icon-button mobile-menu"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
