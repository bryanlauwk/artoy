import { useState } from "react";
import { ArrowRight, CloudUpload, Sparkles } from "lucide-react";
import heroArt from "@/assets/artoy/hero-studio.png";

export function Hero({
  onCreate,
  hasSession,
}: {
  onCreate: (file?: File) => void;
  hasSession: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <section id="top" className="artoy-hero" aria-labelledby="hero-title">
      <img
        src={heroArt}
        alt="A pink-haired designer toy and a black cat in a colorful artist’s studio"
        className="studio-art"
        fetchPriority="high"
        width="1536"
        height="864"
      />
      <div className="studio-shade" />
      <div className="hero-inner">
        <p className="hero-eyebrow">
          <Sparkles size={13} /> A little idea. A whole new world.
        </p>
        <h1 id="hero-title">
          Your character.
          <br />
          Its world.
          <br />
          <span>Your collection.</span>
        </h1>
        <p className="hero-copy">
          Turn your artwork into a character world,
          <br className="wide-only" /> collectible concepts and themed editions.
        </p>
        <div
          className={`artoy-upload ${dragging ? "is-dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onCreate(e.dataTransfer.files[0]);
          }}
        >
          <div className="upload-dashed">
            <button className="artoy-cta hero-studio-entry" onClick={() => onCreate()}>
              <CloudUpload size={22} />
              {hasSession ? "Return to my collection" : "Upload your artwork"}
              <ArrowRight size={17} />
            </button>
            <p className="hero-upload-note">PNG, JPG or WebP · up to 8 MB</p>
          </div>
        </div>
        <p className="hand-note hero-reassurance">
          <a href="#explore">
            See a complete collection <span aria-hidden="true">↓</span>
          </a>
        </p>
      </div>
      <p className="studio-sticker">
        From doodle
        <br />
        to real
        <br />
        things.<span aria-hidden="true">☺</span>
      </p>
    </section>
  );
}
