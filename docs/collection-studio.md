# ARTOY collectible studio

## Current journey

Upload a PNG/JPG/WebP (up to 8MB) or choose a sample. Generate an initial collection of five images: Character Identity, Illustrated Universe, Character Figurine, Miniature World and Acrylic Charm. The character identity is generated first; the remaining four use it plus the original artwork as references. If identity generation fails, the remaining concepts use the original artwork. Partial success remains usable.

The output is a responsive cream-paper collection board with live headings: character/world, collectible concepts, and collection breakdown. Choose one of the three collectible concepts. Product Views, Packaging Concept and Collect the Series each generate one optional image only when explicitly requested. Every expansion references the original artwork and that exact selected product image. Results are retained per concept, so switching products never mixes their breakdowns.

The initial request costs at most five provider requests. A requested expansion adds one. No automatic game, motion or relic generation remains; the playable component is disconnected from the homepage/studio bundle. Historical game code and assets remain archived in the repository. The count reflects image requests, not a provider pricing guarantee.

## API

`POST /api/generate-universe`

Initial: `{ imageDataUrl, mode: "initial" }`. Omitted mode remains equivalent to initial.

Expansion: `{ imageDataUrl, mode: "detail", conceptLabel, conceptImageDataUrl, expansion }`. The concept label must match a supported merch concept. Expansion is `product-views`, `packaging` or `series`. Both references must be PNG/JPEG/WebP base64 data URLs within the length limit. Invalid modes or expansion references are rejected before image generation.

The previously production-verified Lovable multimodal JSON generation endpoint/model are retained. Responses carry `X-ARTOY-Generation-Contract: collection-json-v2`. Provider errors remain sanitized. Network failures and provider rejection remain isolated to each initial output. Client cancellation stops waiting and ignores late responses; it cannot guarantee cancellation of provider work already underway.

## Product boundaries

The generated views are concept illustrations, not CAD or manufacturing drawings. Packaging and series are inspiration previews, not purchasable products. Matching views and editions are conditioned on the selected product but still require visual review for fidelity. Image text is not used as the UI: headings and explanations are rendered in the webpage.

Results are retained only in the current session. Download favorites before refreshing or resetting. Waitlist signup does not save images.

## Verification

- Regression fixtures verify five initial requests, three merch outputs, shared identity conditioning, one request per expansion, correct reference order, malformed input rejection, partial results and safe errors.
- React StrictMode DOM fixture verifies initial partial results, no automatic expansions, selected-reference requests, per-product result isolation, failure/retry, cancel/stale response guards, disabled concurrent generation, reset and absence of gameplay controls.
- No paid generation was performed for this change. The new prompts require a live post-publish visual review.
- Real Chromium launch was blocked by environment socket restrictions. DOM checks do not verify mobile geometry or visual appearance. CSS supplies single-column mobile layout and retains keyboard focus styles.
- Merge to main only; publication is handled manually by the owner in Lovable.
