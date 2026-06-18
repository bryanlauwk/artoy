# Meccha Chameleon v2 — Per-Character Stages, Depth & Progression

Rebuild the mini-game from a single recolored level into 3 genuinely different stages (Nova / Mochi / Hexx) with light gameplay depth, a best-time scoreboard, and a sequential unlock flow. Tuned for **easy first-try wins** — it is a marketing demo, not a real game.

## 1. Per-character stages (the big lift)

Each character gets its own self-contained `Stage` definition (layout, palette zones, obstacles, gem positions, seeker behavior, soundtrack accent). The engine becomes stage-agnostic and reads everything from this config.

| Stage | Theme | Layout | Seeker behavior | Twist mechanic |
|---|---|---|---|---|
| **Nova — Cyan Plaza** | Tutorial-easy. Open plaza with 3 large color zones (cyan / navy / white tile). | Wide open arena, gems centered in zones. | Single drone, slow horizontal sweep (current behavior, slowed 15%). | None — pure paint-and-grab to teach the loop. |
| **Mochi — Pastel Town** | Easy+. Narrow streets with pastel pink/cream patches and small obstacle tiles you can hide behind. | 2 horizontal "alleys" separated by a row of square obstacles (block movement + block line-of-sight). | One drone with a slow circular sweep. | **Line-of-sight blocking**: obstacles fully break the seeker beam — you can hide instead of paint. |
| **Hexx — Arcade Alley** | Medium. Neon punk with sharp color jumps and a faster seeker. | Diagonal color stripes (orange / magenta / black). | Two slow drones with offset sweeps; vision cone slightly narrower. | **Speed-paint pads**: standing on a glowing pad doubles paint speed (telegraphed clearly). |

All three stages stay winnable on first try because: hearts = 3, blend threshold is forgiving (≥72% pickup / ≥78% safe stays), seekers move slowly, and the win condition is OR-gated (3 gems *or* 60s survive).

### Implementation

- New file `src/components/artoy/meccha/stages.ts` exports `STAGES: Record<SampleId, Stage>` with `{ bg, seeker, accent, gems, obstacles, seekers[], paintPads[], soundtrackHint }`.
- Engine in `PixelSocialSim.tsx` is refactored to iterate `stage.seekers[]` (array, not single), respect `stage.obstacles[]` for both player collision and line-of-sight (cone hit-test gets segment-vs-rect occlusion), and apply `paintPads[]` multiplier to the paint lerp factor.
- 3 new background assets generated per stage (replacing current `*-paint-bg.png`) with the actual layout baked in (color zones + obstacle silhouettes drawn into the bg so floor sampling still drives blend). Obstacles also drawn at runtime on top with a subtle shadow so they read as 3D blockers, not floor.

## 2. Gameplay depth (light, demo-safe)

Three additions, no new buttons:

1. **Paint stamina** — Holding SPACE drains a small stamina bar (5s of continuous paint), refills when not painting. Forces brief movement between paint sessions; can't just freeze on one tile forever. Bar lives next to the Blend meter.
2. **Combo bonus** — Collecting a gem while still ≥85% blended adds a small "perfect" tag and shortens that stage's clock for scoring purposes (visual only — no harder timing pressure).
3. **End-of-round scorecard** — Replaces the current win/lose card with: stage name, time taken, gems collected, hearts remaining, "perfect" count, final **Style Score** (simple formula). This is the number that gets saved.

## 3. Score & best time

- Per-character best result in `localStorage` under `meccha.bests.v1`: `{ nova: {bestMs, bestScore, runs}, mochi: ..., hexx: ... }`.
- HUD chip shows current character's best ("Best: 32s · 940 ★") above the canvas.
- Scorecard shows "New best!" when beaten, with a subtle confetti burst.
- "Reset records" link in the How-to-play overlay.

No backend — pure client-side, fits the demo posture.

## 4. Sequential unlock flow

Each stage unlocks the next once cleared (any win). Replaces the current "all 3 cards always available" with progressive reveal:

- Nova is always playable (the tutorial stage).
- Mochi unlocks after a Nova win.
- Hexx unlocks after a Mochi win.
- Locked character cards in `TryItNow.tsx` show a lock icon + "Clear {prev} to unlock" hover; clicking still loads the universe + merch (so they always see the full generation pipeline) but the section-5 game panel shows a locked state.
- Unlock state stored in the same `meccha.bests.v1` blob.
- Once Hexx is cleared, a fourth chip appears: **"Mirror Mode"** — same Hexx stage, seekers swapped to spawn from bottom, gems shuffled. Pure replay candy.

## 5. Polish carry-over

Keep everything from the current v1 that already works: tutorial overlay, audio beeps, danger ring, gem proximity halo, screen shake, blend meter, palette-driven chameleon, gated reveal after steps 3 + 4. Only one tutorial tweak: append a short per-stage hint screen on first visit ("Mochi tip: hide behind crates", "Hexx tip: stand on glowing pads to paint faster").

## 6. Out of scope (explicit)

- No multiplayer, leaderboards, accounts.
- No new server functions, no DB writes — `localStorage` only.
- No new mini-games — still Meccha Chameleon, still WASD + paint.
- No changes to sections 1–4 of the demo, the universe generator, or any other page.
- No animated sprite sheets — keep the canvas-drawn chameleon.

## Files touched

- **New**: `src/components/artoy/meccha/stages.ts`, `src/components/artoy/meccha/scoring.ts`, `src/components/artoy/meccha/storage.ts`.
- **New assets**: `src/assets/artoy/sim/{nova,mochi,hexx}-stage-bg.png` (3, regenerated to bake in layout). Old `*-paint-bg.png` deleted.
- **Rewritten**: `src/components/artoy/PixelSocialSim.tsx` — engine becomes stage-driven, multi-seeker, obstacle-aware, with stamina + scoring + bests.
- **Edited**: `src/components/artoy/TryItNow.tsx` — character cards show lock state + "Best" chip; section-5 panel respects unlock state.
- **Edited**: `scripts/check-legacy-pixelsim.mjs` — update asset allowlist to `*-stage-bg.png`.

## Acceptance

- Each character clearly feels different within 10 seconds of play (different layout silhouette, different seeker pattern, one unique mechanic).
- A first-time visitor wins Nova on attempt 1 ≥ 90% of the time.
- Best time + score persist across reload.
- Mochi and Hexx are locked until prior stage is cleared, with clear UI.
- Old single-stage code paths and assets are removed; legacy-scan script still passes.
