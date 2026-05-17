# Reference-alignment pass

Comparing the latest reference (ARTOY_LP-3.png) with the live build, the reference is actually more **contained and tighter** than what I built in the last pass — most sections sit inside a single soft dark panel with denser padding, and the section bodies are more minimal. Cohesion comes from the painted artwork inside the panels, not from edge-to-edge layouts. I'll re-introduce that pattern where the reference uses it, simplify several sections, and add a few small interaction affordances visible in the reference.

## Changes

**Section container pattern**
- Reintroduce a unified `panel-surface` wrapper for: How It Works, Playable Experiences, Why Creators, Testimonials.
- Keep Hero, Creator Universes, and Waitlist edge-to-edge (matches reference).
- Tighten vertical padding so the page is denser and the eye flows faster to the waitlist.

**How It Works**
- Drop the per-step card bordering — steps live flat inside one panel.
- Big light-purple numerals "1 2 3 4" instead of "01"-style with accent colors.
- Step layout: small thumbnail(s) on top → number → uppercase title → caption.
- Step 3 ("Generate experiences") shows 4 mini thumbs in a row with GAME / TOY / PET / CARD labels (matches reference exactly).
- Plain arrow connectors between steps.
- Centered title only — drop the subtitle line.

**Creator Universes**
- Keep current card style (portrait-dominant, feature chips, scene preview, accent glow).
- Add left/right carousel arrows flanking the cards (visual control, scrolls the row).
- Tighten the scene preview height; move title to a translucent top strip and Play Now to a smaller pill.
- Eyebrow goes back to small uppercase "CREATOR UNIVERSES" with thin subtitle "Real art. AI-generated experiences." (drop the bold large heading I added).

**Playable Experiences**
- Wrap in panel-surface, eyebrow + thin subtitle (drop the bold large heading).
- Tile aspect closer to 1:1 (was 4:5 — too tall).
- Keep hover play button and accent glows.

**Why Creators Love ARTOY**
- Wrap in panel-surface, centered eyebrow title.
- Layout each item icon-LEFT, text-RIGHT (currently icon-on-top stacked).
- Smaller icon tiles; remove the over-large blurred accent blob behind each card.

**Testimonials**
- Wrap in panel-surface, centered eyebrow title.
- Avatar LEFT, quote text RIGHT (currently big quote mark on top with avatar below).
- Add left/right carousel arrows on the outside of the row.

**Waitlist**
- Keep current mascot-flanked layout; reduce inner padding so it feels less ballooned.
- Slightly smaller heading.

**Hero**
- Slightly reduce the headline clamp top so the hero fits in viewport without scrolling on 1366×768.

## Out of scope

- No new artwork generation.
- No new components.
- No copy rewrites beyond the small heading/eyebrow swaps above.
- No functional carousel logic (arrows are visual to match reference; can be wired later).
