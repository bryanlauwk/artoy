import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CloudUpload,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { joinWaitlist } from "@/lib/waitlist.functions";
import { SAMPLES, DETAIL_OPTIONS, type Creation, type CreatorSession } from "./useCreatorSession";

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
            <h3>{item.label}</h3>
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
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [changingCharacter, setChangingCharacter] = useState(false);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const step = generating ? 2 : results ? 3 : 1;
  const completed = results?.filter((item) => item.image).length ?? 0;
  const experiences = results?.filter((item) => item.kind === "experience") ?? [];
  const merch = results?.filter((item) => item.kind === "merch") ?? [];
  const chosen =
    merch.find((item) => item.label === selectedConcept && item.image) ??
    merch.find((item) => item.image);
  const chosenDetails = chosen ? (session.details[chosen.label] ?? []) : [];
  const busy = generating || !!session.expanding;

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
    <section
      id="try"
      className={`creator-studio ${results && !generating ? "collection-active" : ""}`}
    >
      {(!results || generating) && (
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
              ? "Creating your character identity, illustrated world and three collectible concepts."
              : results
                ? "Your character. Its world. Your collection."
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
      )}

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
                setSelectedConcept(null);
                void session.generate();
              }}
            >
              <Sparkles size={16} />
              {error && source ? "Try generation again" : "Generate my universe"}
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="studio-footnote">
            Start with 5 images: your character, its world and 3 collectible concepts. Expand a
            favorite when you’re ready.
          </p>
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
              First your character identity, then its illustrated world and three collectible
              concepts.
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
          <header className="collection-page-header">
            <div className="collection-topline">
              <span className="collection-wordmark">ARTOY</span>
              <div>
                <span className="collection-ready">
                  {completed} of {results.length} images ready
                </span>
                <button
                  className="studio-text-button"
                  disabled={busy}
                  onClick={() => setChangingCharacter(true)}
                >
                  New character <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <h2>
              {source.name}’s collection<span aria-hidden="true"> ✦</span>
            </h2>
            <p>Your character. Its world. Your collection.</p>
            {completed < results.length && (
              <small>
                Some images didn’t finish. You can still explore and save the completed ones.
              </small>
            )}
          </header>
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
                    setSelectedConcept(null);
                    session.reset();
                  }}
                >
                  Start new character
                </button>
              </div>
            </div>
          )}
          {session.expanding && (
            <div className="collection-expanding" role="status">
              <Loader2 size={18} className="animate-spin" />
              <p>Expanding your selected collectible…</p>
              <button className="studio-text-button" onClick={session.cancel}>
                Stop expansion
              </button>
            </div>
          )}
          <div className="collection-board">
            <section className="collection-identity" aria-labelledby="identity-heading">
              <div>
                <p className="collection-kicker">01 / THE CHARACTER & ITS WORLD</p>
                <h3 id="identity-heading">One character. A whole universe.</h3>
                <p>
                  Recognizable details from your artwork carry through the character, world and
                  collectible concepts.
                </p>
              </div>
              <ResultCards items={experiences} />
            </section>
            <section className="collection-concepts" aria-labelledby="concepts-heading">
              <p className="collection-kicker">02 / FROM ILLUSTRATION TO COLLECTIBLE</p>
              <h3 id="concepts-heading">Find your favorite form.</h3>
              <p>Choose a concept to explore its product views, packaging and themed editions.</p>
              <div className="collection-concept-grid">
                {merch.map((item) => (
                  <article
                    key={item.label}
                    className={`collection-concept ${chosen?.label === item.label ? "selected" : ""}`}
                  >
                    {item.image ? (
                      <button
                        className="collection-pick"
                        aria-pressed={chosen?.label === item.label}
                        onClick={() => setSelectedConcept(item.label)}
                      >
                        <span>
                          {item.label}
                          <small>
                            {chosen?.label === item.label
                              ? "Selected concept"
                              : "Explore this concept"}
                          </small>
                        </span>
                        <img
                          src={item.image}
                          alt={`${item.label} concept from ${source.name}`}
                          loading="lazy"
                        />
                      </button>
                    ) : (
                      <div className="studio-result-missing">
                        <AlertCircle size={24} />
                        <p>{item.label} didn’t finish.</p>
                      </div>
                    )}
                    {item.image && (
                      <a
                        className="collection-download"
                        href={item.image}
                        download={`artoy-${item.label.toLowerCase().replaceAll(" ", "-")}.png`}
                        aria-label={`Download ${item.label}`}
                      >
                        <Download size={16} /> Save concept
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
            {chosen && (
              <section className="collection-breakdown" aria-labelledby="breakdown-heading">
                <div className="collection-breakdown-heading">
                  <div>
                    <p className="collection-kicker">03 / THE COLLECTION BREAKDOWN</p>
                    <h3 id="breakdown-heading">Explore your {chosen.label.toLowerCase()}.</h3>
                    <p>
                      Each expansion creates one new image using this chosen design as its
                      reference.
                    </p>
                  </div>
                  <img src={chosen.image!} alt="Selected collectible reference" />
                </div>
                <div className="collection-detail-grid">
                  {DETAIL_OPTIONS.map((option) => {
                    const result = chosenDetails.find((item) => item.label === option.label);
                    const pending = session.expanding === `${chosen.label}:${option.id}`;
                    return (
                      <article
                        className="collection-detail"
                        key={`${chosen.label}:${option.id}`}
                        aria-busy={pending}
                      >
                        <h4>{option.label}</h4>
                        <p>{option.description}</p>
                        {result?.image ? (
                          <>
                            <a
                              href={result.image}
                              download={`artoy-${option.id}.png`}
                              aria-label={`Download ${option.label}`}
                            >
                              <img
                                src={result.image}
                                alt={`${option.label} for the selected ${chosen.label}`}
                                loading="lazy"
                              />
                              <span>
                                <Download size={15} /> Save image
                              </span>
                            </a>
                            <small>Generated from your selected concept</small>
                          </>
                        ) : (
                          <div className="collection-detail-placeholder">
                            <Sparkles size={28} />
                            <span>{pending ? "Taking shape…" : "Ready when you are"}</span>
                          </div>
                        )}
                        {!result?.image && (
                          <button
                            className="studio-text-button"
                            disabled={busy}
                            onClick={() => void session.expand(chosen, option.id)}
                          >
                            {pending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Sparkles size={16} />
                            )}
                            {pending ? "Creating…" : `Generate ${option.label.toLowerCase()}`}
                          </button>
                        )}
                        {pending && (
                          <button className="studio-text-button" onClick={session.cancel}>
                            Stop expansion
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
            <p className="collection-disclaimer">
              Concept previews for inspiration. Product views are visual interpretations; physical
              design and manufacturing still need review. Products are not available to purchase
              yet.
            </p>
          </div>
          <div className="studio-output-actions">
            <p>
              Download your favorites before refreshing, starting a new character, or generating a
              new set.
            </p>
            <button
              className="studio-text-button"
              disabled={busy}
              onClick={() => void session.generate()}
            >
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
