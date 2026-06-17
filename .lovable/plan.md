# Simplify the live demo & make the mini-game character-aware

## Goals

1. Remove the "Drop your character art" upload CTA — the live demo pipeline becomes **sample-only** (Nova / Mochi / Hexx).
2. Tie the Pixel Social Sim to the selected sample so the **world art changes** when the user switches character — without regenerating anything at runtime.
3. Keep the orchestration single-path and predictable: pick sample → universe generates (existing API) → mini-game loads the matching pre-baked scene with that avatar.

## Section-by-section changes

### 1. `src/components/artoy/TryItNow.tsx`

- Delete the file-upload block entirely: remove `fileRef`, `<input type="file">`, the dashed dropzone button, `fileToDataUrl`, and the `onFile` handler.
- Replace the empty state with a clean "Pick a character to start" panel that shows only the 3 sample cards (Nova / Mochi / Hexx), each larger and clearly clickable. Copy: "Tap a character — your full universe + playable mini-game generate instantly."
- Track which sample is active via a new `selectedSampleId: "nova" | "mochi" | "hexx" | null` state alongside `preview`. `onSample` sets both, then runs generation.
- "Try another character" button resets `selectedSampleId` and `preview` back to the picker (keeps current behavior, just without the upload path).
- Update the section copy from "Drop your art. Get your universe." → "Pick a character. Get your universe." and tweak the sub-copy line that mentions "drop" / "upload".
- Pass `sampleId={selectedSampleId}` into `<PixelSocialSim />` alongside `avatarSrc`.
- The `5 ›` section header still reads "Ultimate playable experience", but the side chip changes to "Live mini-game · {name}'s town".

### 2. Pre-baked per-sample mini-game assets

Generate **3 backgrounds + 3 NPC sprite strips**, one set per sample, so the sim world visibly matches the chosen character without any runtime AI:

```
src/assets/artoy/sim/
  nova-bg.png         (cyan/violet sci-fi plaza)
  nova-npcs.png       (3 NPCs styled to Nova's universe + coin)
  mochi-bg.png        (pink/peach pastel town — current baked look)
  mochi-npcs.png
  hexx-bg.png         (orange/magenta neon arcade alley)
  hexx-npcs.png
```

- All 6 files generated with the same 1280×800 / 1920×1080 layout grid and the same sprite-cell coordinates already used in `PixelSocialSim.tsx` so existing `COLLIDERS`, `SPR_*` rects, and walk band don't need recalibration.
- The current `sim-bg.png` / `sim-npcs.png` are kept as the `mochi-*` variant (renamed) so we don't redo working art.

### 3. `src/components/artoy/PixelSocialSim.tsx`

- Add `sampleId?: "nova" | "mochi" | "hexx" | null` to `Props` (default `"mochi"` so a fallback always renders).
- Replace the static `import bgUrl / spritesUrl` with a lookup map:
  ```
  const SCENES = {
    nova:  { bg: novaBg,  sp: novaNpcs,  npcNames: ["Vex","Lume","Ori"], accent: "var(--cyan)" },
    mochi: { bg: mochiBg, sp: mochiNpcs, npcNames: ["Mochi","Pip","Juno"], accent: "var(--pink)" },
    hexx:  { bg: hexxBg,  sp: hexxNpcs,  npcNames: ["Bolt","Ash","Riko"], accent: "var(--orange)" },
  }
  ```
- `NPCS_INIT()` becomes a function of `sampleId` — same positions/sprite rects, but `name`, `lines`, and `accent` swap so dialog feels native to that universe.
- When `sampleId` changes, reload `bgRef` / `spritesRef` images and call the existing `reset()` flow so the new world appears fresh (coins refilled, player at spawn).
- HUD glow ring color and quest-complete card gradient pull from the active scene's `accent` instead of being hard-coded pink.
- Everything else (collisions, input, particles, mobile D-pad) stays untouched.

### 4. Out of scope

- No changes to `generate-universe.ts`, `Hero`, `HowItWorks`, `CreatorUniverses`, `Nav`, or copy outside `TryItNow`.
- No multiplayer / save state / animated walk cycles.
- No new AI calls — the per-sample sim art is generated once at build-time via `imagegen` and committed as static assets.

## Result

- One input surface: 3 sample cards. No upload, no failure path for bad files.
- Selecting a sample drives **both** the AI-generated experience/merch rows **and** the mini-game's background, NPCs, dialog accents, and avatar — so the demo visibly responds to the character choice end-to-end.
- Mini-game stays a fixed base layer (no per-play regeneration); only the scene set swaps.
