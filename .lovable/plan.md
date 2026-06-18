
# Replace mini-game with "Meccha Chameleon — Paint to Blend"

The current Pixel Social Sim is broken (WASD / click-to-move not landing) and the social-sim format no longer fits the demo story. Replace it with a new, far simpler, instantly-playable mini-game: **Meccha Chameleon**, a hide-and-seek paint game where the player paints their white body to match the stage and avoid being spotted by a roaming Seeker.

The mini-game stays the fixed base layer of the live demo — only the stage palette + avatar swap based on the selected character (Nova / Mochi / Hexx), exactly like today's orchestration.

## Game concept (one-screen, 60s round)

- The player avatar is a small white **chameleon blob** with the character's face inlaid on its head (same circular avatar mask used today).
- The stage is a **painted backdrop with 4–6 colored zones** (palette derived from the selected character's universe).
- A **Seeker** (single NPC) sweeps the stage with a cone-of-vision "flashlight".
- The player drags / WASDs the chameleon around. Holding **Space** (or tapping the on-screen Paint button) **samples the color of the floor tile underneath** and paints the chameleon's body that color.
- A **Blend Meter** (0–100%) compares the chameleon's current body color to the floor color directly beneath it.
  - ≥ 80% blend while inside the Seeker's cone = invisible.
  - < 80% blend while inside the cone = "Spotted!" → lose 1 of 3 hearts, brief flash, chameleon resets to white.
- Win condition: survive **60 seconds** OR collect all **3 hidden Paint Gems** (each gem completes a quest beat: "Blend on pink", "Blend on cyan", "Blend on shadow").
- Lose condition: 0 hearts.

End-of-round card reuses today's quest-complete styling (gradient pulled from the scene's accent), with "Play again" + "Try another character" buttons.

## Controls (all three work; this is the bug we're fixing)

- **WASD / Arrow keys**: move
- **Space / hold tap**: paint (sample floor color)
- **Click / tap-to-move**: move to point; **long-press** = paint while moving
- **Mobile**: on-screen D-pad + dedicated Paint button (already-styled chip)
- **Esc / outside click**: release input focus

Implementation notes (fixes today's broken input):
- Attach `keydown`/`keyup` to `window` unconditionally and gate by `activeRef` (today this is correct but breaks because `activateGame` only fires from pointer-down inside the canvas wrapper — many users click the section header first). Make the canvas wrapper auto-activate when it scrolls into view AND when it receives any pointer/keydown event globally that targets inside it. Also fall back to `document.activeElement` check so a focused wrapper always receives keys.
- Drop the `pointerCapture` + `setPointerCapture` path on desktop (it eats subsequent click events on some browsers); only use it for `pointer:coarse` devices.
- Click-to-move target ring is drawn first frame after pointer-down (not gated behind `dragging`).

## Stage / palette per character (build-time, no runtime AI)

Generate one **paint stage background** + one **Seeker sprite** per character. Each stage is a flat, top-down painted floor with 4–6 large colored zones plus 1–2 dark "shadow" zones for hiding.

```
src/assets/artoy/sim/
  nova-paint-bg.png      cyan / violet / deep-navy zones, sci-fi tiles
  nova-seeker.png        chrome drone with cyan light cone
  mochi-paint-bg.png     pink / peach / mint / cream zones, soft pastel
  mochi-seeker.png       round pastel seeker mascot with pink flashlight
  hexx-paint-bg.png      orange / magenta / black zones, neon arcade floor
  hexx-seeker.png        punk seeker with orange spotlight
```

Stage backgrounds are 1280×1280 (logical 640×640), authored as flat color fields so the in-game color-sampling reads a stable RGB per pixel. Seeker sprites are single 256×256 cells.

Old `nova-bg / nova-npcs / mochi-bg / mochi-npcs / hexx-bg / hexx-npcs` assets are no longer referenced and get deleted.

## Color-sampling mechanic (the core trick)

- On game start, draw the stage background once into an **offscreen canvas** the same logical size as the play area.
- Each frame, read the pixel under the chameleon's feet via `getImageData(px, py, 1, 1)` from the offscreen canvas (NOT the live one — avoids reading the player on top of itself).
- Player's "body color" is a separate state value, lerped toward the sampled color while Paint is held (≈ 0.15 per frame so painting feels physical, not instant).
- Blend % = `1 - (ΔE between body color and floor color) / maxΔE` mapped to 0–100.
- Seeker cone is a triangular polygon; "inside cone" = point-in-polygon test against the chameleon's center.

## Files

### Replace
- `src/components/artoy/PixelSocialSim.tsx` → fully rewritten as `MecchaChameleon` exporting the same component name + `SampleId` type so `TryItNow.tsx` imports don't change. Keeps the same outer panel chrome (HUD strip with hearts + gem count + blend meter + pause/reset/help, the focus-to-play overlay, mobile D-pad layout, end-of-round card).

### Edit
- `src/components/artoy/TryItNow.tsx`:
  - Update the section-5 chip from `Live mini-game · {name}'s town` → `Meccha Chameleon · {name}'s stage`.
  - No other behavioural change; `<PixelSocialSim avatarSrc={preview} sampleId={selectedSampleId} />` call stays identical (same exported component name).

### Create (assets)
- 6 new images listed above via `imagegen` at build time.

### Delete
- `src/assets/artoy/sim/{nova,mochi,hexx}-bg.png`
- `src/assets/artoy/sim/{nova,mochi,hexx}-npcs.png`
- `src/assets/artoy/sim/sim-bg.png`, `src/assets/artoy/sim/sim-npcs.png` (legacy, no longer referenced)

## Out of scope

- No multiplayer, no save/leaderboard, no animated walk cycles beyond the existing bob.
- No changes to `generate-universe.ts`, `Hero`, `HowItWorks`, `CreatorUniverses`, `Nav`, or any copy outside the section-5 chip.
- No re-themable Seeker AI beyond the one sweeping pattern (kept dead-simple so the demo always reads as playable).

## Result

- The mini-game becomes a single, original, instantly-readable mechanic ("paint to hide") that is on-brand for a creator-IP universe demo.
- Inputs work: WASD + arrows + click-to-move + tap + Space-to-paint, with a visible focus state so the user knows the game is live.
- Stage palette + avatar still swap per selected character, so the orchestration story ("pick a character → your universe + your playable mini-game") stays intact without per-play regeneration.
