import { ArrowRight } from "lucide-react";
import lunarie from "@/assets/artoy/lunarie.png";
import booboi from "@/assets/artoy/booboi.png";
import jaygyii from "@/assets/artoy/jaygyii.png";
import lunarieToy from "@/assets/artoy/game/lunarie-collectible-v1.webp";
import booboiToy from "@/assets/artoy/game/booboi-collectible-v1.webp";
import jaygyiiToy from "@/assets/artoy/game/jaygyii-collectible-v1.webp";
const examples = [
  { name: "Lunarie", art: lunarie, toy: lunarieToy },
  { name: "BooBoi", art: booboi, toy: booboiToy },
  { name: "Jaygyii", art: jaygyii, toy: jaygyiiToy },
];
export function Community() {
  return (
    <section id="explore" className="artoy-example-strip">
      <div className="artoy-container">
        <div className="example-strip-heading">
          <div>
            <p className="collection-kicker">A LITTLE PREVIEW OF WHAT YOURS COULD BECOME</p>
            <h2>From artwork to collectible.</h2>
          </div>
        </div>
        <div
          className="example-transformations"
          tabIndex={0}
          aria-label="Artwork to collectible examples"
        >
          {examples.map((example) => (
            <article key={example.name} className="example-transformation">
              <div className="example-art">
                <img
                  src={example.art}
                  alt={`${example.name} original character artwork`}
                  width="120"
                  height="120"
                  loading="lazy"
                />
                <span>Original art</span>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
              <div className="example-toy">
                <img
                  src={example.toy}
                  alt={`${example.name} matching figurine concept`}
                  width="180"
                  height="180"
                  loading="lazy"
                />
                <span>{example.name} collectible</span>
              </div>
            </article>
          ))}
        </div>
        <p className="example-strip-note">
          Illustrative concept examples. Your collection is generated from your own artwork.
        </p>
      </div>
    </section>
  );
}
