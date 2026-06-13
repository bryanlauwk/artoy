
## 1. Streamline drop → generate (`TryItNow.tsx`)
- Remove the `UnlockDialog` gate. Auto-fire `/api/generate-universe` the moment a character is uploaded or a sample is picked.
- Replace the "Generate my universe" button with auto-trigger; show a small "Regenerate" / "Try another character" pair after results land.
- Keep payment/referral messaging as a subtle inline note under the results (no blocking modal). Delete `UnlockDialog.tsx`.

## 2. Add Merch Preview row
- Extend `/api/generate-universe` with 3 additional merch prompts (Figurine, Acrylic Stand, T-Shirt) running in parallel with the 5 experiences. Tag each result `kind: "experience" | "merch"`.
- In `TryItNow.tsx`, render results in two labeled rows inside the same panel:
  - **Generated Experiences** — 5 tiles (existing).
  - **Merch Preview** — 3 tiles with mock prices (RM129 / RM39 / RM89) and a "Launch Drop" CTA, matching row 4 of the reference image.

## 3. Remove waitlist CTA
- Delete `<Waitlist />` from `src/routes/index.tsx` and remove `Waitlist.tsx`.
- Hero primary CTA: "Join the Waitlist" → "Try it now" anchored to `#try`. Replace "2,000+ creators on the waitlist" with a neutral "Built for artists & creators" line.
- Remove `#waitlist` links from `Nav.tsx`, `Universes.tsx`, `SiteFooter.tsx`.

## 4. Unify siloed sections into one continuous Creator Universe flow
Modeled on the attached reference (row-per-creator: upload → generate → experiences → merch).
- Merge `Universes` + `Experiences` into a single **CreatorUniverses** component rendered as horizontal rows (one per creator). Each row: Artist portrait card | AI suggestions checklist | Generated experiences (4 tiles) | Merch preview (3 tiles with mock prices).
- Drop the standalone `Experiences.tsx` panel — its grid duplicates what `TryItNow` shows live.
- Wrap the whole CreatorUniverses block in a single `panel-surface` so it reads as one cohesive section.
- Resulting page order: Hero → HowItWorks → CreatorUniverses (unified) → TryItNow (live demo + merch) → Footer.

## 5. Fix HowItWorks step 3 alignment
- Normalize all 4 steps to identical visual shape: one hero thumbnail at `aspect-[4/3]` on top, then number + title + desc below.
- Step 3 currently uses a 4-thumb mini-grid that breaks the rhythm. Replace it with a single composite tile showing a 2×2 mosaic of the 4 experience thumbs at the same `aspect-[4/3]` footprint — still communicates "multiple outputs", but visually aligned.
- Move connector arrows to thumbnail vertical center (drop `pt-12`).

## Out of scope
- Real payment, real referral tracking, persistent storage.
- Hero typography / color-token redesign.

## Technical notes
- `generate-universe` route: append 3 merch entries to the prompts array; return one flat `results` list with `kind` field. Frontend splits into two rows.
- `CreatorUniverses` reuses existing `WORLDS` data; uses existing scene/feature thumbnails as static showcase tiles (no AI calls — only `TryItNow` is live).
- Files changed: `TryItNow.tsx`, `routes/api/generate-universe.ts`, `Hero.tsx`, `Nav.tsx`, `SiteFooter.tsx`, `HowItWorks.tsx`, `routes/index.tsx`. New: `CreatorUniverses.tsx`. Deleted: `UnlockDialog.tsx`, `Waitlist.tsx`, `Universes.tsx`, `Experiences.tsx`.
