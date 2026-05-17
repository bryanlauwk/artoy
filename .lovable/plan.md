# Cohesive artwork-driven refresh

Comparing the current preview against the reference, the hero now blends well, but the rest of the page still reads as stacked "panel cards" on a flat background. Several artwork assets render but feel under-used (cropped, hidden behind dark overlays, or framed inside heavy borders). The waitlist section is missing the two mascot artworks that frame the form in the reference. The plan tightens visual cohesion so the whole page feels like one continuous painted canvas — like the hero does now.

## Section-by-section changes

**Global / page shell**
- Replace the repeating "rounded panel container" wrapper with edge-to-edge sections separated by soft ambient gradients (radial pink/purple/cyan glows that bleed between sections).
- Add a faint vignette + grain layer on `<body>` so the painted artwork sits on texture instead of pure flat dark.
- Standardize section vertical rhythm (consistent top/bottom padding, consistent eyebrow + title typography).

**How It Works**
- Rebuild the 4-step row to match the reference: each step is a wide preview card (artwork on top, number + label + caption below), with arrow connectors between them.
- Use distinct visuals per step (upload → analyze → generate → launch) instead of reusing small circular thumbs.

**Creator Universes**
- Make the character portrait the dominant element: full-bleed top image (~360px) with a gradient scrim so the name/verified badge sits cleanly on top.
- Tighten the 4-icon feature row (smaller chips, single row, no card-in-card border).
- Scene preview becomes a flush-bottom image with the title overlaid top-left and the Play Now pill bottom-right (no inner border).
- Add a subtle outer glow per card tinted to that universe's accent (pink / amber / cyan).

**Playable Experiences**
- Ensure all 5 tiles render their artwork (currently several look empty). Force consistent aspect (4:5), add a soft inner gradient and a centered play button that scales on hover.
- Replace the boxed section wrapper with an open horizontal strip so the tiles feel like a gallery, not a panel.

**Why Creators Love Artoy**
- Keep the 4-up icon grid but drop the outer panel; use icon tiles with a subtle gradient fill matching the brand accents (heart=pink, users=purple, sparkles=cyan, bag=amber).

**Testimonials**
- Replace the boxed container with a free-floating row on the ambient background.
- Use circular avatar artwork with a thin gradient ring; quote text larger, handle + role smaller.

**Waitlist (primary conversion target)**
- Restore the mascot framing from the reference: black cat artwork bleeding in from the left, Nova-with-cat artwork bleeding in from the right, form centered.
- Brighter purple→pink gradient background section with soft painted edges (not a hard rounded box).
- Add a "Let's build your universe together" handwritten-style accent near the right mascot.
- Keep benefit chips (Early Access / Exclusive Rewards / Priority Support / Creator Community) under the CTA.

**Nav + Footer**
- Nav: add a subtle backdrop blur + bottom hairline so it sits on the artwork without a hard bar.
- Footer: simplify to brand + socials + copyright on the ambient bg, no panel.

## Technical notes

- All work stays in `src/components/artoy/*` and `src/styles.css`. No new dependencies.
- Add reusable utility classes in `styles.css` for the ambient section glow and grain overlay so each section can opt in consistently.
- Reuse existing assets in `src/assets/artoy/`; no new image generation needed.
- Verify on desktop (1528px), tablet, and mobile after each section using browser screenshots.

## Out of scope

- No backend / waitlist submission wiring changes.
- No new copy beyond minor caption tweaks needed for layout.
- No new artwork generation unless a section is visibly missing a needed asset after implementation.
