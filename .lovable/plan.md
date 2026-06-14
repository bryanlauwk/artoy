## Goal
1. Pixel Social Sim is no longer one of the AI thumbnail tiles. It gets its own section, rendered **after** the 5 experiences row and the 3 merch row.
2. The section is an **actually playable** top-down pixel mini-game using the uploaded character as the avatar — not a static AI image.

## Changes

### 1. `src/routes/api/generate-universe.ts`
- Remove the `Pixel Social Sim` entry from `ITEMS`. API returns back to 5 experiences + 3 merch (8 assets).

### 2. `src/components/artoy/TryItNow.tsx`
- Remove `Pixel Social Sim` from `EXP_PLACEHOLDERS` and `ACCENTS`.
- Revert experiences grid from `lg:grid-cols-6` back to `sm:grid-cols-5`. Drop the `★ Ultimate` badge logic.
- Update header copy: "5 playable experiences + 3 merch mockups + 1 playable mini-game".
- Below the Merch row, add a new section "5 › Ultimate playable experience" rendering `<PixelSocialSim avatarSrc={preview} />`. Only shown when `preview` is set.

### 3. New: `src/components/artoy/PixelSocialSim.tsx`
A self-contained playable mini-game (no backend). Built with a single `<canvas>` + `requestAnimationFrame` + keyboard/touch input. No new dependencies.

**Mechanics:**
- Top-down pixel world (logical 320×200, scaled to fit a 16:10 frame, `image-rendering: pixelated`).
- Cozy town square: grass tiles, dirt path, 3 shop fronts (drawn from CSS rects), trees, lanterns, a fountain.
- Player avatar = the uploaded `avatarSrc` rendered as a small circular sprite (32×32) with a tiny shadow. We do not require a real pixel sprite — using the user's source image gives the "your character in the game" payoff immediately.
- 3 NPCs that pace short patrol loops, each with a floating heart/❤ when close.
- 8 coin pickups scattered on the map (rotating yellow ♦).
- HUD top-left: ❤❤❤ hearts + 🪙 coin counter; top-right: "Press E to chat".
- Press **E** near an NPC → speech bubble cycles flavor lines ("Cute outfit!", "Trade hearts?", "Welcome to town!"). Walking over coins increments counter + small toast. Collect all 8 → confetti banner "You filled the town with joy ✨".
- Controls: Arrow keys / WASD on desktop. On-screen D-pad + A button for touch (rendered only when `matchMedia('(pointer:coarse)')`).
- Pause + Reset buttons in a small HUD bar above the canvas.

**Implementation notes:**
- Pure client component, no SSR concerns (window-guarded refs). All drawing in one `useEffect` with a `cancelAnimationFrame` cleanup.
- Avatar image loaded via `new Image()`; falls back to a colored circle if not loaded yet.
- Tilemap is a static const array; collision = AABB against shop/tree rects.
- Keeps file under ~300 lines.

## Out of scope
- No multiplayer, no save state, no real sprite-sheet animation (just bobbing offset on movement).
- No changes to merch row, FEATURES, or other landing sections.

## Files
- Edit: `src/routes/api/generate-universe.ts`, `src/components/artoy/TryItNow.tsx`
- Create: `src/components/artoy/PixelSocialSim.tsx`
