import { useRef, useState } from "react";
import { ArrowRight, CloudUpload, Sparkles, X } from "lucide-react";
import heroArt from "@/assets/artoy/hero-studio.png";

export function Hero({
  onCreate,
  hasSession,
}: {
  onCreate: (file?: File) => void;
  hasSession: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  function chooseFile(next?: File) {
    if (!next) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(next.type)) {
      setError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (next.size > 8 * 1024 * 1024) {
      setError("Your image must be 8 MB or smaller.");
      return;
    }
    setError("");
    setFile(next);
  }
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
          Your art.
          <br />
          Your character.
          <br />
          <span>Your universe.</span>
        </h1>
        <p className="hero-copy">
          Reimagine your character as AI artwork,
          <br className="wide-only" /> toy concepts, and little worlds.
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
            chooseFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="upload-dashed">
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload your character artwork"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                chooseFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button className="upload-picker" onClick={() => input.current?.click()}>
              <CloudUpload size={36} strokeWidth={1.5} />
              <span>
                <strong>{file ? file.name : "Drop your art here"}</strong>
                <small>
                  {file ? "Ready to create · Click to change" : "PNG, JPG or WebP · up to 8 MB"}
                </small>
              </span>
            </button>
            {file && (
              <button
                className="remove-upload"
                onClick={() => {
                  setFile(undefined);
                  setError("");
                }}
                aria-label="Remove selected artwork"
              >
                <X size={15} />
              </button>
            )}
            <button
              className="artoy-cta"
              onClick={() => {
                onCreate(file);
                setFile(undefined);
              }}
            >
              {!file && hasSession ? "Return to my studio" : "Create my character"}{" "}
              <ArrowRight size={17} />
            </button>
            <p className="upload-error" role="status">
              {error}
            </p>
          </div>
        </div>
        <p className="hand-note hero-reassurance">
          No art? Try a sample! <span aria-hidden="true">⤴</span>
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
