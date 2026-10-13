import { ArrowRight, Download, Shirt, Crown } from "lucide-react";
import { BunnyArtwork } from "./BunnyArtwork";
import { Doodle } from "./Transformation";

export function HowItWorks({ onCreate }: { onCreate: () => void }) {
  return (
    <section id="how" className="artoy-how">
      <div className="artoy-container">
        <div className="section-heading">
          <div>
            <h2>How it works</h2>
            <p>From a little doodle to a world of possibilities.</p>
          </div>
        </div>
        <div className="steps-and-cta">
          <ol className="artoy-steps">
            <li>
              <div className="step-illustration">
                <span className="step-number">1</span>
                <div className="mini-paper">
                  <Doodle />
                </div>
              </div>
              <h3>Upload your art</h3>
              <p>Drop a drawing or choose a sample to get started.</p>
            </li>
            <li>
              <div className="step-illustration">
                <span className="step-number">2</span>
                <BunnyArtwork
                  variant="character"
                  alt="A plush bunny character generated from a doodle"
                />
              </div>
              <h3>Generate your universe</h3>
              <p>See your character reimagined with AI.</p>
            </li>
            <li>
              <div className="step-illustration merch-icons">
                <span className="step-number">3</span>
                <Download />
                <Shirt />
              </div>
              <h3>Explore & download</h3>
              <p>
                Keep your favorite images and merch concepts. Play an adventure with your character.
              </p>
            </li>
          </ol>
          <div className="how-cta">
            <p className="hand-note">
              Same art.
              <br />
              Different
              <br />
              worlds. <Crown size={37} strokeWidth={1.4} />
            </p>
            <button className="artoy-cta" onClick={onCreate}>
              Start creating <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
