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
    liveVerified: true,
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
    liveVerified: false,
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
    liveVerified: false,
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
  { title: "Character Figurine", note: "The character, made collectible.", column: null },
  { title: "Miniature World", note: "A signature scene on a small base.", column: 1 },
  { title: "Acrylic Charm", note: "The same identity, ready to carry.", column: 2 },
];
const breakdown = [
  { title: "Product Views", note: "Front / side / back", column: 0 },
  { title: "Packaging Concept", note: "Signature box / wordmark / miniature", column: 1 },
  { title: "Collect the Series", note: "Three related themed editions", column: 2 },
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
            <h2 id="case-title">One character. A whole collection.</h2>
            <p>Explore the same journey through three distinct personalities.</p>
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
              01 / IT STARTS WITH A DRAWING
            </p>
            <div className="case-sketch-strip">
              <button
                className="case-inspect"
                aria-label={`Inspect ${example.name} demo drawing`}
                onClick={() => setPreview({ title: "Demo drawing", image: example.original })}
              >
                <img src={example.original} alt={`${example.name} demo pencil drawing`} />
                <span>Demo drawing</span>
              </button>
              <ArrowRight size={22} />
              <div>
                <strong>From a drawing to a whole collection.</strong>
                <p>{example.motifs}</p>
                <small>An AI-made drawing starts this example.</small>
              </div>
            </div>
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
            <p className="collection-kicker">02 / FROM ILLUSTRATION TO COLLECTIBLE</p>
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
                        alt={`${example.name} character figurine concept`}
                        width="1024"
                        height="1024"
                        loading="lazy"
                      />
                    ) : (
                      <ConceptPanel
                        src={example.sheet}
                        column={product.column}
                        row={0}
                        alt={`${example.name} ${product.title.toLowerCase()} concept`}
                      />
                    )}{" "}
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="case-study-section" aria-labelledby="case-breakdown-title">
            <p className="collection-kicker">03 / THE COLLECTION BREAKDOWN</p>
            <h3 id="case-breakdown-title">The complete presentation.</h3>
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
                        alt={`${example.name} ${item.title.toLowerCase()} concept`}
                      />
                    )}
                  </button>
                </article>
              ))}
            </div>
          </section>
          <div className="case-compact-footer">
            <p>
              Tap a concept to inspect it. Curated examples; products are not available to purchase.
            </p>
            <details className="case-evidence">
              <summary>Concept sources & prototype notes</summary>
              <div>
                <p>
                  {example.liveVerified
                    ? "Lunarie’s figurine is a verified saved ARTOY production output from its earlier coloured artwork. The new demo sketch is an AI-created reinterpretation, not that historic upload. World, packaging and supporting panels are curated AI visuals."
                    : `${example.name}’s figurine and supporting panels and demo sketch are curated AI visuals based on its earlier artwork and approved collectible. They are illustrative examples, not a verified live upload-to-series run.`}
                </p>
                <p>
                  The creator studio completed an eight-image live run from the Lunarie demo sketch
                  on 14 October 2026. These showcase panels remain curated examples. Reference views
                  and packaging are visual concepts, not manufacturing drawings. No physical unit
                  has been manufactured or tested.
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
                  Concept preview. Explore the details, then return to the collection.
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
