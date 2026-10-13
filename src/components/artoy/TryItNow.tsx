import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CloudUpload,
  Download,
  Gamepad2,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { joinWaitlist } from "@/lib/waitlist.functions";
import { FragmentQuest } from "./FragmentQuest";
import { SAMPLES, type Creation, type CreatorSession } from "./useCreatorSession";
import lunarie from "@/assets/artoy/lunarie.png";

import lunarieMotion from "@/assets/artoy/game/lunarie-motion-v1.png";

const GAME_CHARACTERS = [{ id: "lunarie", src: lunarie, name: "Lunarie" }, ...SAMPLES];

function UniverseGame({
  source,
  heroSrc,
  motionSrc,
  collectibleSrc,
  onExploreCollectible,
}: {
  source?: CreatorSession["source"];
  heroSrc?: string | null;
  motionSrc?: string | null;
  collectibleSrc?: string | null;
  onExploreCollectible?: () => void;
}) {
  const [sample, setSample] = useState(GAME_CHARACTERS[0]);
  const artwork = source ?? { image: sample.src, name: sample.name };
  return (
    <div className="studio-game">
      <p className="studio-tab-note">
        {source
          ? "Your character, your colors, one little world to restore. Recover three art fragments and return to the portal."
          : "Meet The Lost Fragments: one curated adventure, reimagined with each character. Choose a hero and jump in."}
      </p>
      {!source && (
        <div
          className="studio-game-options"
          role="group"
          aria-label="Choose an adventure character"
        >
          {GAME_CHARACTERS.map((option) => (
            <button
              key={option.id}
              aria-pressed={sample.id === option.id}
              onClick={() => setSample(option)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
      <FragmentQuest
        key={artwork.image}
        artworkSrc={artwork.image}
        characterName={artwork.name}
        heroSrc={heroSrc}
        motionSrc={source ? motionSrc : sample.id === "lunarie" ? lunarieMotion : null}
        collectibleSrc={collectibleSrc}
        onExploreCollectible={onExploreCollectible}
      />
    </div>
  );
}

function ResultCards({ items }: { items: Creation[] }) {
  return (
    <div className="studio-results-grid">
      {items.map((item) => (
        <article className="studio-result" key={`${item.kind}-${item.label}`}>
          {item.image ? (
            <img
              src={item.image}
              alt={`${item.label} generated from your character`}
              loading="lazy"
            />
          ) : (
            <div className="studio-result-missing">
              <AlertCircle size={24} />
              <span>Couldn’t generate this image</span>
            </div>
          )}
          <div>
            <h3>
              {["Mini Game", "Virtual Pet"].includes(item.label)
                ? `${item.label} concept`
                : item.label}
            </h3>
            {item.image && (
              <a
                href={item.image}
                download={`artoy-${item.label.toLowerCase().replaceAll(" ", "-")}.png`}
                aria-label={`Download ${item.label}`}
              >
                <Download size={17} />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function TryItNow({ session }: { session: CreatorSession }) {
  const { source, results, generating, reading, error } = session;
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState("creations");
  const [showGame, setShowGame] = useState(false);
  const [changingCharacter, setChangingCharacter] = useState(false);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const step = generating ? 2 : results ? 3 : 1;
  const completed = results?.filter((item) => item.image).length ?? 0;
  const experiences = results?.filter((item) => item.kind === "experience") ?? [];
  const merch = results?.filter((item) => item.kind === "merch") ?? [];
  async function saveEmail() {
    setSavingEmail(true);
    setEmailError("");
    try {
      await joinWaitlist({ data: { email: email.trim(), characterName: source?.name } });
      session.setEmailSaved(true);
    } catch {
      setEmailError("We couldn’t add you to the waitlist. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  }
  return (
    <section id="try" className="creator-studio">
      <header className="studio-header">
        <p className="studio-eyebrow">
          <Sparkles size={14} /> Your creative studio
        </p>
        <h2>
          {generating
            ? "A new world is taking shape."
            : results
              ? `${source?.name}’s universe`
              : "Start with a character."}
        </h2>
        <p>
          {generating
            ? "We’re turning your artwork into AI images and merch concepts."
            : results
              ? "Explore your creations, download your favorites, or play with your character."
              : "Upload your art or choose a sample. Make it a world of its own."}
        </p>
        <ol className="studio-steps" aria-label="Creation progress">
          {["Choose artwork", "Generate", "Explore"].map((label, index) => (
            <li
              key={label}
              className={index + 1 === step ? "current" : index + 1 < step ? "complete" : ""}
              aria-current={index + 1 === step ? "step" : undefined}
            >
              <span>{index + 1 < step ? <Check size={13} /> : index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </header>

      {error && (
        <div className="studio-error" role="alert">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {!generating && !results && (
        <div className="studio-choose">
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload character artwork"
            onChange={(event) => {
              session.uploadFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <div
            className={`studio-drop ${dragging ? "dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              session.uploadFile(event.dataTransfer.files[0]);
            }}
          >
            <button
              onClick={() => fileInput.current?.click()}
              disabled={reading}
              className="studio-upload-button"
            >
              <CloudUpload size={30} />
              <span>
                <strong>{reading ? "Reading your artwork…" : "Drop your artwork here"}</strong>
                <small>or browse files · PNG, JPG, WebP · up to 8 MB</small>
              </span>
            </button>
          </div>
          <div className="studio-divider">
            <span>or start with a sample</span>
          </div>
          <div className="studio-samples">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                aria-pressed={source?.sampleId === sample.id}
                className={source?.sampleId === sample.id ? "selected" : ""}
                onClick={() =>
                  session.chooseSource({
                    image: sample.src,
                    name: sample.name,
                    sampleId: sample.id,
                  })
                }
              >
                <img src={sample.src} alt="" />
                <span>
                  <strong>{sample.name}</strong>
                  <small>{sample.tagline}</small>
                </span>
                {source?.sampleId === sample.id && (
                  <CheckCircle2 size={21} className="sample-check" />
                )}
              </button>
            ))}
          </div>
          <div className="studio-selection">
            {source ? (
              <div className="studio-source">
                <img src={source.image} alt="Selected artwork" />
                <div>
                  <strong>{source.name}</strong>
                  <span>Ready to create</span>
                </div>
              </div>
            ) : (
              <p>Select a character to get started.</p>
            )}
            <button
              className="artoy-cta"
              disabled={!source || reading}
              onClick={() => {
                setTab("creations");
                void session.generate();
              }}
            >
              <Sparkles size={16} />
              {error && source ? "Try generation again" : "Generate my universe"}
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="studio-footnote">
            Generates up to 6 character assets and 3 merch concepts with AI.
          </p>
          <div className="studio-game-entry">
            <button
              className="studio-text-button"
              aria-expanded={showGame}
              aria-controls="sample-game"
              onClick={() => setShowGame(!showGame)}
            >
              <Gamepad2 size={17} />{" "}
              {showGame
                ? "Close adventure"
                : source
                  ? `Play with ${source.name}`
                  : "Try a sample adventure"}
            </button>
            {showGame && (
              <div id="sample-game">
                <UniverseGame source={source} />
              </div>
            )}
          </div>
        </div>
      )}

      {generating && source && (
        <div className="studio-generating" aria-busy="true">
          <div className="studio-orbit">
            <img src={source.image} alt={`${source.name}, your selected character`} />
            <span>
              <Sparkles size={23} />
            </span>
          </div>
          <div role="status">
            <h3>
              <Loader2 size={19} className="animate-spin" /> Creating your universe
            </h3>
            <p>
              Generating character art, motion frames and 3 merch concepts.
              <br />
              This can take a few minutes. You can close the studio and return here.
            </p>
          </div>
          <div className="studio-loading-cards" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <button className="studio-text-button" onClick={session.cancel}>
            Stop and return to {results ? "results" : "artwork"}
          </button>
        </div>
      )}

      {!generating && results && source && (
        <div className="studio-output">
          <div className="studio-output-summary">
            <div className="studio-source">
              <img src={source.image} alt="Your original artwork" />
              <div>
                <strong>
                  {completed} of {results.length} images ready
                </strong>
                <span>
                  {completed < results.length
                    ? "Some images didn’t finish. You can still download the completed ones."
                    : "Your character, reimagined."}
                </span>
              </div>
            </div>
            <button className="studio-text-button" onClick={() => setChangingCharacter(true)}>
              <ArrowLeft size={15} />
              New character
            </button>
          </div>
          {changingCharacter && (
            <div className="studio-change-prompt" role="group" aria-label="Start a new character">
              <p>Download your favorites first. Starting a new character clears these results.</p>
              <div>
                <button className="studio-text-button" onClick={() => setChangingCharacter(false)}>
                  Keep exploring
                </button>
                <button
                  className="artoy-cta"
                  onClick={() => {
                    setChangingCharacter(false);
                    setTab("creations");
                    session.reset();
                  }}
                >
                  Start new character
                </button>
              </div>
            </div>
          )}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="studio-tabs" aria-label="Explore your universe">
              <TabsTrigger value="creations">
                Creations <span>{experiences.length}</span>
              </TabsTrigger>
              <TabsTrigger value="merch">
                Merch <span>{merch.length}</span>
              </TabsTrigger>
              <TabsTrigger value="play">
                <Gamepad2 size={16} />
                Play my universe
              </TabsTrigger>
            </TabsList>
            <TabsContent value="creations">
              <ResultCards items={experiences} />
            </TabsContent>
            <TabsContent value="merch">
              <p className="studio-tab-note">
                Concept mockups for inspiration. These products are not available to purchase yet.
              </p>
              <ResultCards items={merch} />
            </TabsContent>
            <TabsContent value="play">
              <UniverseGame
                source={source}
                heroSrc={experiences.find((item) => item.label === "Game Character")?.image}
                motionSrc={experiences.find((item) => item.label === "Game Motion")?.image}
                collectibleSrc={merch.find((item) => item.label === "Figurine")?.image}
                onExploreCollectible={
                  merch.some((item) => item.image) ? () => setTab("merch") : undefined
                }
              />
            </TabsContent>
          </Tabs>
          <div className="studio-output-actions">
            <p>
              Download your favorites before refreshing, starting a new character, or generating a
              new set.
            </p>
            <button className="studio-text-button" onClick={() => void session.generate()}>
              <RefreshCw size={15} />
              Generate a new set
            </button>
          </div>
          <details className="studio-waitlist">
            <summary>
              {session.emailSaved
                ? "You’re on the early-access list"
                : "Get updates about publishing & merch"}
              <ArrowRight size={16} />
            </summary>
            {session.emailSaved ? (
              <p>We’ll email you when publishing and real merch drops are available.</p>
            ) : (
              <>
                <p>
                  Join the early-access list for publishing and real merch drops. This doesn’t save
                  your generated images—download the ones you want to keep.
                </p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveEmail();
                  }}
                >
                  <label htmlFor="studio-email">Email address</label>
                  <div>
                    <input
                      id="studio-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@studio.com"
                      required
                      maxLength={255}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <button className="artoy-cta" disabled={savingEmail}>
                      {savingEmail ? "Joining…" : "Join the waitlist"}
                    </button>
                  </div>
                </form>
                {emailError && <p role="alert">{emailError}</p>}
              </>
            )}
          </details>
        </div>
      )}
    </section>
  );
}
