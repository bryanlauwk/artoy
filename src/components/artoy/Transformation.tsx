import { ArrowRight } from "lucide-react";
import { BunnyArtwork } from "./BunnyArtwork";

export function Doodle() {
  return (
    <svg
      viewBox="0 0 160 180"
      role="img"
      aria-label="A doodle of a bunny wearing headphones"
      className="bunny-doodle"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M54 72C25 1 57-4 68 63M83 63C87-5 119 8 101 74" />
        <path d="M44 81C55 53 112 58 121 87C141 124 113 136 80 136C45 136 27 115 44 81Z" />
        <path d="M40 83C14 86 21 120 42 119M123 84C144 88 142 116 123 117M30 90L29 111M134 93L134 110M61 136L51 163L69 169L73 146M99 136L113 161L96 168L90 148M70 138L68 172L91 172L90 137M48 146L39 154M109 143L120 151" />
        <path d="M73 113Q82 123 90 113" />
        <ellipse cx="62" cy="100" rx="3" ry="6" fill="currentColor" />
        <ellipse cx="100" cy="99" rx="3" ry="6" fill="currentColor" />
        <path d="M77 108L82 111L86 108" />
      </g>
      <path
        d="M12 35L15 27L18 35L27 38L18 41L15 49L12 41L4 38Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
export function Transformation() {
  return (
    <section
      className="artoy-transformation"
      aria-label="From a doodle to a universe of possibilities"
    >
      <div className="transformation-inner">
        <div className="transform-cell">
          <p className="hand-note">Turn this…</p>
          <div className="paper-doodle">
            <Doodle />
          </div>
        </div>
        <ArrowRight className="transform-arrow" aria-hidden="true" />
        <div className="transform-cell">
          <p className="hand-note">…into this</p>
          <BunnyArtwork
            variant="character"
            alt="A white bunny in headphones reimagined as a plush designer toy"
          />
        </div>
        <ArrowRight className="transform-arrow" aria-hidden="true" />
        <div className="transform-cell">
          <p className="hand-note">Imagine a game</p>
          <BunnyArtwork
            variant="game"
            alt="The same bunny jumping through a colorful platform game"
          />
        </div>
        <div className="transform-cell">
          <p className="hand-note">Dream up collectibles</p>
          <BunnyArtwork variant="collectible" alt="The bunny as a keychain and boxed collectible" />
        </div>
        <div className="transform-cell">
          <p className="hand-note">Make it your own</p>
          <BunnyArtwork variant="pet" alt="The bunny as a virtual pet on a phone" />
          <span className="worlds-bubble hand-note">
            Same art.
            <br />
            Different worlds.
          </span>
        </div>
      </div>
    </section>
  );
}
