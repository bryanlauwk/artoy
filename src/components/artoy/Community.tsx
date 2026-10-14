import { useId, useState } from "react";
import { ArrowRight, Download, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import lunarieOriginal from "@/assets/artoy/case-study/lunarie-sketch-v2.webp";
import lunarieFigurine from "@/assets/artoy/case-study/lunarie-figurine-v1.webp";
import lunarieSheet from "@/assets/artoy/case-study/lunarie-concepts-v1.webp";
import booboiOriginal from "@/assets/artoy/case-study/booboi-sketch-v2.webp";
import booboiFigurine from "@/assets/artoy/game/booboi-collectible-v1.webp";
import booboiSheet from "@/assets/artoy/case-study/booboi-concepts-v1.webp";
import jaygyiiOriginal from "@/assets/artoy/case-study/miko-sketch-v2.webp";
import jaygyiiFigurine from "@/assets/artoy/game/jaygyii-collectible-v1.webp";
import jaygyiiSheet from "@/assets/artoy/case-study/jaygyii-concepts-v1.webp";

import lunarieWorld from "@/assets/artoy/case-study/lunarie-world-v2.webp";
import booboiWorld from "@/assets/artoy/case-study/booboi-world-v2.webp";
import mikoWorld from "@/assets/artoy/case-study/miko-world-v2.webp";
import lunariePackaging from "@/assets/artoy/case-study/lunarie-packaging-v2.webp";
import booboiPackaging from "@/assets/artoy/case-study/booboi-packaging-v2.webp";
import mikoPackaging from "@/assets/artoy/case-study/miko-packaging-v2.webp";

const examples = [
  {
    id: "lunarie",
    name: "Lunarie",
    original: lunarieOriginal,
    figurine: lunarieFigurine,
    sheet: lunarieSheet,
    world: lunarieWorld,
    packaging: lunariePackaging,
    motifs: "Pink hair, cap, headphones and skull motif.",
  },
  {
    id: "booboi",
    name: "BooBoi",
    original: booboiOriginal,
    figurine: booboiFigurine,
    sheet: booboiSheet,
    world: booboiWorld,
    packaging: booboiPackaging,
    motifs: "Bear ears, yellow cap, blue hoodie and camera details.",
  },
  {
    id: "miko",
    name: "Miko",
    original: jaygyiiOriginal,
    figurine: jaygyiiFigurine,
    sheet: jaygyiiSheet,
    world: mikoWorld,
    packaging: mikoPackaging,
    motifs: "Teal hair, cat features and spectral flame accents.",
  },
];
function ConceptPanel({
  src,
  column,
  row,
  alt,
  wide = false,
}: {
  src: string;
  column: number;
  row: number;
  alt: string;
  wide?: boolean;
}) {
  const clipId = `case-panel-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className="case-sheet-panel"
      viewBox={`${column * 512} ${row * 512} 512 512`}
      preserveAspectRatio={wide ? "xMidYMid slice" : "xMidYMid meet"}
      role="img"
      aria-label={alt}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={column * 512} y={row * 512} width="512" height="512" />
        </clipPath>
      </defs>
      <image href={src} width="1536" height="1024" clipPath={`url(#${clipId})`} />
    </svg>
  );
}
const products = [
  { title: "Character Figurine", note: "Your character, made collectible.", column: null },
  { title: "Mini World", note: "A favorite scene on a small base.", column: 1 },
  { title: "Acrylic Charm", note: "The same character, ready to carry.", column: 2 },
];
const breakdown = [
  { title: "Every Angle", note: "Front / side / back", column: 0 },
  { title: "Gift Box", note: "A special box with its name and a mini inside", column: 1 },
  { title: "Collect the Series", note: "Three matching themed editions", column: 2 },
];
export function Community() {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState<{
    title: string;
    column?: number | null;
    row?: number;
    image?: string;
  } | null>(null);
  const example = examples[selected];
  return (
    <section id="explore" className="artoy-case-study case-template" aria-labelledby="case-title">
      <div className="artoy-container">
        <header className="case-study-header">
          <div>
            <p className="collection-kicker">ARTOY / COMPLETE COLLECTION EXAMPLES</p>
            <h2 id="case-title">Your sketch becomes a whole collection.</h2>
            <p>
              Start with a drawing. See it reimagined as an artwork world, figurine, mini world,
              charm and matching gift box.
            </p>
          </div>
          <div
            className="case-character-toggle"
            role="group"
            aria-label="Choose a collection example"
          >
            {examples.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected === index}
                aria-controls="case-collection"
                onClick={() => {
                  setSelected(index);
                  setPreview(null);
                }}
              >
                <img src={item.original} alt="" width="30" height="30" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </header>
        <div
          id="case-collection"
          className="case-collection-panel"
          key={example.id}
          role="region"
          aria-labelledby="case-collection-title"
        >
          <p className="sr-only" role="status">
            {example.name}’s collection displayed.
          </p>
          <div className="case-collection-title">
            <h3 id="case-collection-title">
              {example.name}’s collection <span aria-hidden="true">✦</span>
            </h3>
            <p>{example.motifs}</p>
          </div>
          <section className="case-study-section" aria-labelledby="case-world-title">
            <p className="collection-kicker" id="case-world-title">
              01 / BEFORE & AFTER
            </p>
            <div className="case-transformation">
              <figure className="case-before">
                <figcaption>
                  <strong>Before · The starting sketch</strong>
                  <span>A simple character drawing</span>
                </figcaption>
                <button
                  className="case-inspect"
                  aria-label={`Enlarge ${example.name} starting sketch`}
                  onClick={() => setPreview({ title: "Starting sketch", image: example.original })}
                >
                  <img
                    src={example.original}
                    alt={`${example.name} starting pencil sketch`}
                    width="1024"
                    height="1024"
                  />
                  <span className="case-zoom-hint">
                    <Maximize2 size={16} /> Enlarge sketch
                  </span>
                </button>
              </figure>
              <ArrowRight className="case-transformation-arrow" size={28} aria-hidden="true" />
              <figure className="case-after">
                <figcaption>
                  <strong>After · A matching collection</strong>
                  <span>One character, many ways to collect</span>
                </figcaption>
                <button
                  className="case-inspect"
                  aria-label={`Enlarge ${example.name} collection preview`}
                  onClick={() => setPreview({ title: "Collection preview", image: example.sheet })}
                >
                  <img
                    src={example.sheet}
                    alt={`${example.name} collection: figurine, mini world, acrylic charm, every angle, gift box and themed editions`}
                    width="1536"
                    height="1024"
                  />
                  <span className="case-zoom-hint">
                    <Maximize2 size={16} /> Explore the collection
                  </span>
                </button>
              </figure>
            </div>
            <p className="case-transformation-note">
              {example.motifs} The same details carry through every idea below.
            </p>
            <p className="case-saved-note">
              Saved example pictures · switching characters never creates new images. Upload your
              own artwork to create your collection.
            </p>
            <h3>A new world for the same character.</h3>
            <figure className="case-world-hero">
              <button
                className="case-inspect"
                aria-label={`Inspect ${example.name} artwork world`}
                onClick={() => setPreview({ title: "Artwork World", image: example.world })}
              >
                <img
                  src={example.world}
                  alt={`${example.name} colorful artwork world`}
                  width="1536"
                  height="1024"
                  loading="lazy"
                />
                <Maximize2 size={20} />
              </button>
              <figcaption>
                <strong>Artwork World</strong>
                <span>Explore the details</span>
              </figcaption>
            </figure>
          </section>
          <section className="case-study-section" aria-labelledby="case-products-title">
            <p className="collection-kicker">02 / FROM DRAWING TO KEEPSAKE</p>
            <h3 id="case-products-title">Find your favorite form.</h3>
            <div className="case-product-grid">
              {products.map((product) => (
                <article className="case-product" key={product.title}>
                  <h4>{product.title}</h4>
                  <p>{product.note}</p>
                  <button
                    className="case-inspect"
                    aria-label={`Inspect ${example.name} ${product.title.toLowerCase()}`}
                    onClick={() =>
                      setPreview({ title: product.title, column: product.column, row: 0 })
                    }
                  >
                    {product.column === null ? (
                      <img
                        className="case-figurine"
                        src={example.figurine}
                        alt={`${example.name} character figurine`}
                        width="1024"
                        height="1024"
                        loading="lazy"
                      />
                    ) : (
                      <ConceptPanel
                        src={example.sheet}
                        column={product.column}
                        row={0}
                        alt={`${example.name} ${product.title.toLowerCase()}`}
                      />
                    )}{" "}
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="case-study-section" aria-labelledby="case-breakdown-title">
            <p className="collection-kicker">03 / THE COMPLETE COLLECTION</p>
            <h3 id="case-breakdown-title">Ready to share and gift.</h3>
            <div className="case-product-grid">
              {breakdown.map((item) => (
                <article className="case-product" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.note}</p>
                  <button
                    className="case-inspect"
                    aria-label={`Inspect ${example.name} ${item.title.toLowerCase()}`}
                    onClick={() =>
                      setPreview(
                        item.column === 1
                          ? { title: item.title, image: example.packaging }
                          : { title: item.title, column: item.column, row: 1 },
                      )
                    }
                  >
                    {item.column === 1 ? (
                      <img
                        className="case-packaging-image"
                        src={example.packaging}
                        alt={`${example.name} signature gift box and miniature`}
                        width="1536"
                        height="1024"
                        loading="lazy"
                      />
                    ) : (
                      <ConceptPanel
                        src={example.sheet}
                        column={item.column}
                        row={1}
                        alt={`${example.name} ${item.title.toLowerCase()}`}
                      />
                    )}
                  </button>
                </article>
              ))}
            </div>
          </section>
          <div className="case-compact-footer">
            <p>
              Tap any picture to see it up close. These are examples; the toys are not for sale yet.
            </p>
            <details className="case-evidence">
              <summary>How these examples were made</summary>
              <div>
                <p>
                  These three collections use saved, hand-picked pictures. Browsing, switching
                  characters and enlarging pictures do not generate new images.
                </p>
                <p>
                  The starting sketches and collection pictures were made with AI around the same
                  character details. They illustrate what a collection could look like; they are not
                  exact before-and-after results from these sketches. Lunarie’s figurine was saved
                  from an earlier ARTOY result.
                </p>
                <p>
                  Only your own uploaded artwork is used for new studio generation. The gift boxes
                  and toys are design ideas; physical products have not been made or tested yet.
                </p>
                {example.id === "lunarie" && (
                  <a
                    href="/case-studies/lunarie-charm-print-proof.pdf"
                    className="case-proof-link"
                    download
                  >
                    <Download size={15} /> Lunarie 1:1 paper charm proof
                  </a>
                )}
              </div>
            </details>
          </div>
        </div>
        <Dialog
          open={preview !== null}
          onOpenChange={(open) => {
            if (!open) setPreview(null);
          }}
        >
          <DialogContent className="case-image-dialog">
            {preview && (
              <>
                <DialogTitle>
                  {example.name}: {preview.title}
                </DialogTitle>
                <DialogDescription>
                  A closer look. Explore the details, then return to the collection.
                </DialogDescription>
                {preview.image ? (
                  <img src={preview.image} alt={`${example.name} ${preview.title}`} />
                ) : preview.column === null ? (
                  <img src={example.figurine} alt={`${example.name} ${preview.title}`} />
                ) : (
                  <ConceptPanel
                    src={example.sheet}
                    column={preview.column ?? 0}
                    row={preview.row ?? 0}
                    alt={`${example.name} ${preview.title}`}
                  />
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
