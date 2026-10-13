import { useState } from "react";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import lunarieOriginal from "@/assets/artoy/case-study/lunarie-original-v1.webp";
import lunarieFigurine from "@/assets/artoy/case-study/lunarie-figurine-v1.webp";
import lunarieSheet from "@/assets/artoy/case-study/lunarie-concepts-v1.webp";
import booboiOriginal from "@/assets/artoy/booboi.png";
import booboiFigurine from "@/assets/artoy/game/booboi-collectible-v1.webp";
import booboiSheet from "@/assets/artoy/case-study/booboi-concepts-v1.webp";
import jaygyiiOriginal from "@/assets/artoy/jaygyii.png";
import jaygyiiFigurine from "@/assets/artoy/game/jaygyii-collectible-v1.webp";
import jaygyiiSheet from "@/assets/artoy/case-study/jaygyii-concepts-v1.webp";

const examples = [
  {
    id: "lunarie",
    name: "Lunarie",
    original: lunarieOriginal,
    figurine: lunarieFigurine,
    sheet: lunarieSheet,
    motifs: "Pink hair, cap, headphones and skull motif.",
    liveVerified: true,
  },
  {
    id: "booboi",
    name: "BooBoi",
    original: booboiOriginal,
    figurine: booboiFigurine,
    sheet: booboiSheet,
    motifs: "Bear ears, yellow cap, blue hoodie and camera details.",
    liveVerified: false,
  },
  {
    id: "jaygyii",
    name: "Jaygyii",
    original: jaygyiiOriginal,
    figurine: jaygyiiFigurine,
    sheet: jaygyiiSheet,
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
  return (
    <svg
      className="case-sheet-panel"
      viewBox={`${column * 512} ${row * 512} 512 512`}
      preserveAspectRatio={wide ? "xMidYMid slice" : "xMidYMid meet"}
      role="img"
      aria-label={alt}
    >
      <image href={src} width="1536" height="1024" />
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
  { title: "Packaging Concept", note: "Box / story card", column: 1 },
  { title: "Collect the Series", note: "Three related themed editions", column: 2 },
];
export function Community() {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState<{
    title: string;
    column: number | null;
    row: number;
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
              01 / THE CHARACTER & ITS WORLD
            </p>
            <div className="case-world-grid">
              <figure className="case-source">
                <img
                  src={example.original}
                  alt={`${example.name} original character artwork`}
                  width="768"
                  height="768"
                  loading="lazy"
                />
                <figcaption>Original artwork</figcaption>
              </figure>
              <figure className="case-world">
                <ConceptPanel
                  src={example.sheet}
                  column={0}
                  row={0}
                  alt={`${example.name} illustrated universe`}
                  wide
                />
                <figcaption>Illustrated Universe</figcaption>
              </figure>
            </div>
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
            <h3 id="case-breakdown-title">Explore your character figurine.</h3>
            <div className="case-product-grid">
              {breakdown.map((item) => (
                <article className="case-product" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.note}</p>
                  <button
                    className="case-inspect"
                    aria-label={`Inspect ${example.name} ${item.title.toLowerCase()}`}
                    onClick={() => setPreview({ title: item.title, column: item.column, row: 1 })}
                  >
                    <ConceptPanel
                      src={example.sheet}
                      column={item.column}
                      row={1}
                      alt={`${example.name} ${item.title.toLowerCase()} concept`}
                    />{" "}
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
                    ? "Lunarie’s figurine is a verified saved ARTOY production output. The remaining scene and breakdown panels are curated AI visuals using that same character and figurine as references."
                    : `${example.name}’s figurine and six supporting panels are curated AI visuals, using the original artwork and approved collectible as references. They are illustrative examples, not a verified live upload-to-series run.`}
                </p>
                <p>
                  Full live collection testing is pending: the latest upload returned generation
                  unavailable. Reference views and packaging are visual concepts, not manufacturing
                  drawings. No physical unit has been manufactured or tested.
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
                {preview.column === null ? (
                  <img src={example.figurine} alt={`${example.name} ${preview.title}`} />
                ) : (
                  <ConceptPanel
                    src={example.sheet}
                    column={preview.column}
                    row={preview.row}
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
