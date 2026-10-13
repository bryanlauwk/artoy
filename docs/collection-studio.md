# ARTOY collectible studio

## Current journey

Upload a PNG/JPG/WebP (up to 8MB). Generate an initial collection of five images: Character Identity, Illustrated Universe, Character Figurine, Miniature World and Acrylic Charm. The character identity is generated first; the remaining four use it plus the original artwork as references. If identity generation fails, the remaining concepts use the original artwork. Partial success remains usable.

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

## Preview-aligned presentation

The result screen now uses a continuous ivory canvas, prominent character collection title, compact image-count chip, a shared character/world image row, collectible titles above their images and a selected-concept breakdown. The output no longer sits inside a second dark studio heading and progress strip. Product images remain actual generation results; the design preview is not substituted for them.

The homepage character gallery is replaced by three direct artwork-to-figurine pairs (Lunarie, BooBoi and Jaygyii), using the repository's existing matching collectible concepts. There are no character detail popups, View All control or additional creation CTA; the hero and navigation open upload. Mobile shows the pairs in one horizontally scrollable row to keep the section compact. Examples are clearly labelled as illustrative concepts.

These changes add no generation requests. The five-image initial collection and individually requested expansions remain the same. TypeScript, changed-file lint, production build and existing collection DOM checks apply. Real browser/mobile visual QA remains unverified because the local Chromium process is blocked by socket restrictions.

## UX consolidation

Homepage now has one artwork-to-collectible showcase, followed by a short text-only three-step explanation. The repeated bunny transformation strip, illustrated how-it-works cards and secondary section creation buttons are removed. Navigation retains one creation CTA rather than a second Create link.

The studio is upload-only: sample character cards, the repeated progress stepper and duplicate loading headline are removed. Examples remain visible on the homepage without generating anything. Each selected-product expansion has one generation action; cancellation is available once in the shared expansion status. No image-generation budget or request contract changed.
