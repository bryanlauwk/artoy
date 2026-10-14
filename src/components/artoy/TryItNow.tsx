import { useRef, useState } from "react";
import {
  ArrowRight,
  CloudUpload,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Maximize2,
  Pencil,
} from "lucide-react";
import { DETAIL_OPTIONS, type Creation, type CreatorSession } from "./useCreatorSession";
import { CollectionImageDialog, type ImagePreview } from "./CollectionImageDialog";

function InspectImage({
  image,
  title,
  onInspect,
}: {
  image: string;
  title: string;
  onInspect: (preview: ImagePreview) => void;
}) {
  return (
    <button
      type="button"
      className="collection-inspect"
      aria-label={`Enlarge ${title}`}
      onClick={() => onInspect({ image, title })}
    >
      <img src={image} alt={title} loading="lazy" />
      <Maximize2 size={18} />
    </button>
  );
}
function SaveImage({ image, title }: { image: string; title: string }) {
  return (
    <a
      className="collection-download"
      href={image}
      download={`artoy-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}
      aria-label={`Download ${title}`}
    >
      <Download size={15} /> Save image
    </a>
  );
}

export function TryItNow({ session }: { session: CreatorSession }) {
  const { source, results, generating, reading, error } = session;
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [changingCharacter, setChangingCharacter] = useState(false);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [completePresentation, setCompletePresentation] = useState(true);
  const experiences = results?.filter((item) => item.kind === "experience") ?? [];
  const merch = results?.filter((item) => item.kind === "merch") ?? [];
  const chosen =
    merch.find((item) => item.label === selectedConcept && item.image) ??
    merch.find((item) => item.label === "Miniature World" && item.image) ??
    merch.find((item) => item.image);
  const chosenDetails = chosen ? (session.details[chosen.label] ?? []) : [];
  const completed = results?.filter((item) => item.image).length ?? 0;
  const readyDetails = chosenDetails.filter((item) => item.image).length;
  const busy = generating || !!session.expanding || !!session.retrying;
  function generate() {
    setSelectedConcept(null);
    void session.generate(completePresentation);
  }
  function retryButton(item: Creation) {
    return (
      <button
        className="studio-text-button"
        disabled={busy}
        onClick={() => void session.retry(item)}
      >
        <RefreshCw size={15} />
        {session.retrying === item.label ? "Retrying…" : `Retry ${item.label.toLowerCase()}`}
      </button>
    );
  }
  return (
    <section
      id="try"
      className={`creator-studio ${results && !generating ? "collection-active" : ""}`}
    >
      {!results && !generating && (
        <header className="studio-header">
          <p className="studio-eyebrow">
            <Sparkles size={14} /> Creator studio
          </p>
          <h2>Start with your artwork.</h2>
          <p>One character. A complete collection.</p>
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
          {!source ? (
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
          ) : (
            <div className="studio-source studio-source-ready">
              <img src={source.image} alt="Selected artwork" />
              <div>
                <label className="studio-name-label">
                  Character name
                  <input
                    aria-label="Character name"
                    defaultValue={source.name}
                    key={source.image}
                    maxLength={60}
                    onBlur={(event) => session.rename(event.target.value)}
                  />
                </label>
                <button
                  className="studio-text-button"
                  disabled={reading}
                  onClick={() => fileInput.current?.click()}
                >
                  Change artwork
                </button>
              </div>
            </div>
          )}
          <label className="studio-complete-option">
            <input
              type="checkbox"
              checked={completePresentation}
              onChange={(event) => setCompletePresentation(event.target.checked)}
            />
            <span>
              <strong>Complete presentation</strong>
              <small>
                {completePresentation
                  ? "8 images · character, world, 3 collectibles, product views, packaging and series"
                  : "5 images · character, world and 3 collectibles; expand later"}
              </small>
            </span>
          </label>
          <button className="artoy-cta" disabled={!source || reading} onClick={generate}>
            <Sparkles size={16} />
            {error && source ? "Try generation again" : "Generate my collection"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {generating && source && (
        <div className="studio-generating" aria-busy="true">
          <div className="studio-orbit">
            <img src={source.image} alt="Your selected artwork" />
            <span>
              <Sparkles size={23} />
            </span>
          </div>
          <div role="status">
            <h3>
              <Loader2 size={19} className="animate-spin" /> Creating your collection
            </h3>
            <p>
              First the character and its world, then three collectible concepts.
              <br />
              You can close the studio and return while it generates.
            </p>
          </div>
          <div className="studio-loading-cards" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <button className="studio-text-button" onClick={session.cancel}>
            Stop and return to artwork
          </button>
        </div>
      )}
      {!generating && results && source && (
        <div className="studio-output">
          <header className="collection-page-header">
            <div className="collection-topline">
              <span className="collection-wordmark">ARTOY / YOUR COLLECTION</span>
              <div>
                <span className="collection-ready">
                  {completed} of 5 core images · {readyDetails} of 3 breakdown images
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
            {editingName ? (
              <form
                className="collection-name-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  session.rename(nameDraft);
                  setEditingName(false);
                }}
              >
                <label htmlFor="collection-name">Character name</label>
                <input
                  id="collection-name"
                  autoFocus
                  value={nameDraft}
                  maxLength={60}
                  onChange={(event) => setNameDraft(event.target.value)}
                />
                <button type="submit">Save name</button>
                <button type="button" onClick={() => setEditingName(false)}>
                  Cancel
                </button>
              </form>
            ) : (
              <div className="collection-name-heading">
                <h2>
                  {source.name}’s collection<span aria-hidden="true"> ✦</span>
                </h2>
                <button
                  className="studio-text-button"
                  aria-label="Edit collection name"
                  disabled={busy}
                  onClick={() => {
                    setNameDraft(source.name);
                    setEditingName(true);
                  }}
                >
                  <Pencil size={16} /> Edit name
                </button>
              </div>
            )}
            <p>From your artwork to a world worth collecting.</p>
            {completed < 5 && (
              <small>Some images didn’t finish. Retry only the missing ones below.</small>
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
                    setPreview(null);
                    setEditingName(false);
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
              <p>
                {session.expanding.endsWith(":complete")
                  ? "Core images are ready. Completing product views, packaging and series…"
                  : "Expanding your selected collectible…"}
              </p>
              <button className="studio-text-button" onClick={session.cancel}>
                Stop expansion
              </button>
            </div>
          )}
          <div className="collection-board">
            <section className="collection-identity" aria-labelledby="identity-heading">
              <p className="collection-kicker">01 / THE ILLUSTRATED UNIVERSE</p>
              <h3 id="identity-heading">A world built around your character.</h3>
              {experiences
                .filter((item) => item.label === "Illustrated Universe")
                .map((item) => (
                  <figure className="collection-world-hero" key={item.label}>
                    {item.image ? (
                      <InspectImage image={item.image} title={item.label} onInspect={setPreview} />
                    ) : (
                      <div className="studio-result-missing">
                        <AlertCircle size={24} />
                        <p>The illustrated universe didn’t finish.</p>
                        {retryButton(item)}
                      </div>
                    )}
                    <figcaption>
                      <strong>{item.label}</strong>
                      {item.image && <SaveImage image={item.image} title={item.label} />}
                    </figcaption>
                  </figure>
                ))}
              <div className="collection-origin-strip">
                <button
                  className="collection-inspect"
                  aria-label="Enlarge uploaded artwork"
                  onClick={() => setPreview({ image: source.image, title: "Uploaded artwork" })}
                >
                  <img src={source.image} alt="Your uploaded artwork" />
                  <span>Uploaded artwork</span>
                </button>
                <ArrowRight size={20} />
                {experiences
                  .filter((item) => item.label === "Character Identity")
                  .map((item) => (
                    <div key={item.label}>
                      {item.image ? (
                        <>
                          <InspectImage
                            image={item.image}
                            title={item.label}
                            onInspect={setPreview}
                          />
                          <SaveImage image={item.image} title={item.label} />
                        </>
                      ) : (
                        <div className="studio-result-missing">
                          <p>Character identity didn’t finish.</p>
                          {retryButton(item)}
                        </div>
                      )}
                    </div>
                  ))}
                <p>
                  Your character’s details become the visual thread through the world and
                  collection.
                </p>
              </div>
            </section>
            <section className="collection-concepts" aria-labelledby="concepts-heading">
              <p className="collection-kicker">02 / FROM ILLUSTRATION TO COLLECTIBLE</p>
              <h3 id="concepts-heading">Three ways to collect.</h3>
              <p>Select a form to see its collection breakdown.</p>
              <div className="collection-concept-grid">
                {merch.map((item) => (
                  <article
                    key={item.label}
                    className={`collection-concept ${chosen?.label === item.label ? "selected" : ""}`}
                  >
                    <h4>{item.label}</h4>
                    {item.image ? (
                      <>
                        <InspectImage
                          image={item.image}
                          title={item.label}
                          onInspect={setPreview}
                        />
                        <div className="collection-card-actions">
                          <button
                            className="studio-text-button collection-pick"
                            aria-pressed={chosen?.label === item.label}
                            disabled={busy}
                            onClick={() => setSelectedConcept(item.label)}
                          >
                            {chosen?.label === item.label ? "Selected" : "Select concept"}
                          </button>
                          <SaveImage image={item.image} title={item.label} />
                        </div>
                      </>
                    ) : (
                      <div className="studio-result-missing">
                        <AlertCircle size={24} />
                        <p>This concept didn’t finish.</p>
                        {retryButton(item)}
                      </div>
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
                    <h3 id="breakdown-heading">{chosen.label}. The complete presentation.</h3>
                    <p>
                      Product views, a signature gift box and a series using this same collectible.
                    </p>
                  </div>
                </div>
                <div className="collection-detail-grid">
                  {DETAIL_OPTIONS.map((option) => {
                    const result = chosenDetails.find((item) => item.label === option.label);
                    const pending =
                      session.expanding === `${chosen.label}:${option.id}` ||
                      session.expanding === `${chosen.label}:complete`;
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
                            <InspectImage
                              image={result.image}
                              title={option.label}
                              onInspect={setPreview}
                            />
                            <SaveImage image={result.image} title={option.label} />
                          </>
                        ) : (
                          <>
                            <div className="collection-detail-placeholder">
                              <Sparkles size={28} />
                              <span>
                                {pending
                                  ? "Taking shape…"
                                  : result
                                    ? "This image didn’t finish"
                                    : "Optional expansion"}
                              </span>
                            </div>
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
                              {pending
                                ? "Creating…"
                                : `${result ? "Retry" : "Generate"} ${option.label.toLowerCase()}`}
                            </button>
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
            <p className="collection-disclaimer">
              Concept previews. Physical design and manufacturing still need review; products aren’t
              available to purchase.
            </p>
          </div>
          <details className="studio-output-actions">
            <summary>Collection actions</summary>
            <p>Download your favorites before refreshing or replacing the collection.</p>
            <button className="studio-text-button" disabled={busy} onClick={generate}>
              <RefreshCw size={15} /> Generate a new set
            </button>
          </details>
        </div>
      )}
      <CollectionImageDialog preview={preview} onClose={() => setPreview(null)} />
    </section>
  );
}
