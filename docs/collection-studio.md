# ARTOY creator studio — current journey

The homepage contains one curated collection showcase with Lunarie, BooBoi and Miko toggles. The studio is upload-only. No sample selector, sample fallback, repeated gallery or waitlist capture is mounted inside it. Navigation and the hero open the same studio. The homepage no longer asks visitors to select a file before repeating that task in a modal.

Upload one PNG, JPEG or WebP up to 8MB. Name the character before generation. The collection name remains editable after generation without regenerating images; renaming only affects future packaging lettering, not images already generated.

## Image budget and sequence

Complete presentation is selected by default and explicitly labelled as eight images. The first API request creates five core images: Character Identity, Illustrated Universe, Character Figurine, Miniature World and Acrylic Charm. Identity is generated first; the next four use it and the uploaded artwork as references. If identity fails, the original artwork remains the reference.

Once the core results arrive, the studio displays them immediately and requests three presentation images for the successful Miniature World: Product Views, Packaging Concept and Collect the Series. If the miniature failed, the first successful collectible is used. If no collectible succeeded, no presentation calls are made. The selected product remains locked while this request completes.

Unchecking Complete presentation generates only the five core images. The user can request individual expansions later. Initial-image retries and individual expansions each make one provider request; there is no automatic retry of an entire collection. The request count is not a pricing guarantee.

## Presentation

The rich illustrated universe occupies a full-width first row with its complete image visible. A compact uploaded-artwork-to-character strip follows, then a three-product grid and a three-panel collection breakdown. Every image opens a large inspection dialog; downloads are separate from selection and inspection. Mobile uses a two-column studio grid with a full-width final item; the homepage retains its three-item comparison overview with enlargement.

Prompts specify interconnected hand-inked worlds on warm ivory with selective watercolour; layered miniature scenes; and substantial closed cuboid gift boxes with a character-derived emblem, character wordmark, illustrated world and picture of the exact selected product. A renamed character affects future requests; existing package text remains unchanged. Views and series use the same selected product reference. These are concepts, not manufacturing specifications or purchasable products.

## API

`POST /api/generate-universe`, response header `X-ARTOY-Generation-Contract: collection-json-v3`.

- Core: `{ imageDataUrl, mode: "initial", characterName }`; omitted mode stays equivalent to initial.
- Complete breakdown: `{ imageDataUrl, mode: "detail", conceptLabel, conceptImageDataUrl, expansion: "complete", characterName }`.
- Individual breakdown: same detail payload, with `expansion` set to `product-views`, `packaging` or `series`.
- Retry one failed core image: `{ imageDataUrl, mode: "retry", itemLabel, identityImageDataUrl? }`.

All modes, item labels and reference data URLs are validated before provider calls. Errors remain sanitized; successful images survive partial failures. Cancellation ignores late responses and prevents subsequent client stages, but cannot guarantee cancellation of provider work already underway. Images remain in the current session; download before refreshing or replacing the collection.

## Verification boundary

Provider requests are mocked in regression tests. They verify the five-plus-three budget, reference order, shared identity, chosen-miniature consistency, packaging lettering and isolated failures. A React StrictMode interaction fixture checks naming without regeneration, inspection, individual retries, detail scoping, cancellation, lower-usage mode, failed-breakdown recovery and absence of duplicate samples. TypeScript, changed-file ESLint and the production build are checked.

The curated homepage assets were created with built-in image generation and visually reviewed. They are not evidence of the new live eight-image workflow. A current paid-provider visual run and physical fabrication remain separate checks. Publication is manual in Lovable.

## Live preview check — 14 October 2026

The unpublished Lovable preview on main commit `124aa718b2954b2b607e665fee085dacd85ffd48` accepted `lunarie-sketch-v2.webp`, a user-editable name of Lunarie and Complete presentation enabled. All five core images and all three Miniature World breakdown images completed without retries. The character's pink bob, cap, headphones, black jacket and skull motif remain visible across the figure, miniature, charm and related outputs. The source sketch and identity are close in style; the physical product transformation is the stronger before/after comparison.

The first live box had a substantial shape and matching miniature but weak, small lettering. The packaging prompt was refined to request a large high-contrast top wordmark, saturated side/emblem and a full-colour illustrated front. Completed packaging has a single-image redesign action; core images and other breakdown panels are retained during that request. Changing a name does not itself consume generation requests or alter an existing box image.

Desktop preview inspection confirms the full-width world, the renamed Miko toggle, loaded packaging artwork, image enlargement and an upload-only studio. The live eight-image check supersedes the earlier provider-unavailable outcome. It is one successful run, not a guarantee of future provider availability, output fidelity or manufacturing readiness. Phone-specific browser geometry and a physical prototype remain unverified. No public publication was performed.
