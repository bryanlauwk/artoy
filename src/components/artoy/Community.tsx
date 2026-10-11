import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import lunarie from "@/assets/artoy/lunarie.png";
import booboi from "@/assets/artoy/booboi.png";
import jaygyii from "@/assets/artoy/jaygyii.png";
import nova from "@/assets/artoy/avatar-1.png";
import mochi from "@/assets/artoy/avatar-2.png";
import hexx from "@/assets/artoy/avatar-3.png";

const characters = [
  {
    name: "Lunarie",
    type: "Game + Toy + Story",
    image: lunarie,
    description:
      "A pink-haired rebel with a universe of possibilities. Imagine her next adventure.",
  },
  {
    name: "Booboi",
    type: "Collectible character",
    image: booboi,
    description:
      "Big personality, little character. A playful starting point for your next collectible.",
  },
  {
    name: "Jaygyii",
    type: "Art + Collectibles",
    image: jaygyii,
    description: "A world of character, ready to inspire a new story.",
  },
  {
    name: "Nova",
    type: "Sci-fi game world",
    image: nova,
    description: "A sci-fi pilot exploring a cyan-lit plaza. Try the Nova sample in the creator.",
  },
  {
    name: "Mochi",
    type: "Pastel character",
    image: mochi,
    description:
      "A pastel mascot at home in a pink town. Clear Nova’s stage in the demo to unlock Mochi.",
  },
  {
    name: "Hexx",
    type: "Neon game world",
    image: hexx,
    description:
      "Neon punk energy in an arcade alley. Clear Mochi’s stage in the demo to unlock Hexx.",
  },
];
export function Community({ onCreate }: { onCreate: () => void }) {
  const gallery = useRef<HTMLDivElement>(null);
  const selectedCard = useRef<HTMLButtonElement | null>(null);
  const openingCreator = useRef(false);
  const [active, setActive] = useState<(typeof characters)[number] | null>(null);
  const [expanded, setExpanded] = useState(false);
  return (
    <section id="explore" className="artoy-community">
      <div className="artoy-container">
        <div className="section-heading">
          <div>
            <h2>Explore a universe of creations</h2>
            <p>Meet the characters. Imagine what yours could become.</p>
          </div>
          <button
            className="artoy-text-link"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls="character-gallery"
          >
            {expanded ? "Carousel view" : "View all"} <ArrowRight size={17} />
          </button>
        </div>
        <div
          id="character-gallery"
          ref={gallery}
          className={`character-gallery ${expanded ? "expanded" : ""}`}
        >
          {characters.map((character) => (
            <button
              key={character.name}
              className="character-card"
              onClick={(event) => {
                selectedCard.current = event.currentTarget;
                openingCreator.current = false;
                setActive(character);
              }}
              aria-label={`Explore ${character.name}: ${character.type}`}
            >
              <img src={character.image} alt="" width="300" height="360" loading="lazy" />
              <span className="character-info">
                <strong>{character.name}</strong>
                <span>{character.type}</span>
                <small>
                  <Sparkles size={12} /> ARTOY original
                </small>
              </span>
              <ArrowRight className="card-arrow" size={18} />
            </button>
          ))}
        </div>
        <div className="gallery-bottom">
          <p>Character showcase · A little inspiration for your next idea</p>
          <div>
            <button
              className="icon-button"
              aria-label="Previous characters"
              onClick={() => gallery.current?.scrollBy({ left: -280, behavior: "smooth" })}
              hidden={expanded}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Next characters"
              onClick={() => gallery.current?.scrollBy({ left: 280, behavior: "smooth" })}
              hidden={expanded}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent
          className="character-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!openingCreator.current) selectedCard.current?.focus();
          }}
        >
          {active && (
            <>
              <img src={active.image} alt={`${active.name} character artwork`} />
              <p className="eyebrow">ARTOY CHARACTER SHOWCASE</p>
              <DialogTitle>{active.name}</DialogTitle>
              <DialogDescription>{active.description}</DialogDescription>
              <button
                className="artoy-cta"
                onClick={() => {
                  openingCreator.current = true;
                  setActive(null);
                  onCreate();
                }}
              >
                Create your own character <ArrowRight size={16} />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
