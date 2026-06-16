## Diagnosis

The current `PixelSocialSim` has two real problems:

1. **Not playable in practice.** Keyboard listeners live on `window`, but until the user clicks somewhere on the page (or the canvas), focus stays in the upload control. There's no "click to start" affordance, no `tabIndex` on the canvas, no auto-focus, and the canvas competes with page scroll on arrow keys. End user effect: dropped art, scrolled down, mashed arrow keys → nothing moves.
2. **Looks half-baked.** Town visuals are drawn with raw `ctx.fillRect` primitives in generic crayon colors (green grass, sky blue, brown path, basic house silhouettes). It does not read as "the same universe" as the AI-generated experiences above it — it reads as a placeholder.

Plus a structural concern the user called out: regenerating the entire scene from scratch each time is wasteful. The scene should be a **stable base layer**; only the avatar should be the per-session swap-in.

## Goal

Mini-game becomes a polished, on-brand, instantly-playable demo. The world is pre-baked art (one beautifully crafted background + a pre-rendered sprite pack), not procedural rectangles. The avatar is the only thing that comes from the user's upload.

## Changes

### 1. Pre-generate the game art ONCE — bake into the repo

Generate two static assets via the imagegen tool and commit them under `src/assets/artoy/sim/`:

- `sim-bg.png` (1024×640, 16:10) — top-down cozy plaza scene matching ARTOY's neon-pop universe: vibrant pink / purple / cyan palette, deep night-sky gradient, three glowing storefronts (Cafe / Shop / Inn) with neon signage, lantern-lit dirt path, a glowing fountain, soft bloom, painterly-pixel hybrid (Eastward / Sea of Stars vibe — not flat 8-bit). This is the **single base layer**.
- `sim-npcs.png` (512×128, transparent) — a 4-frame sprite strip: 3 NPC chibi characters + 1 coin sprite, each 128×128, on-brand colors (pink/cyan/yellow), painterly with crisp outline. Standalone PNG with transparent background.

These ship in the bundle, so the mini-game loads instantly and does not consume AI credits on every play.

A collision map is hand-authored in code as a list of rects calibrated to the baked background coordinates (storefront footprints, fountain, trees). No procedural drawing of world geometry.

### 2. Rewrite `src/components/artoy/PixelSocialSim.tsx`

Visual layer:
- Logical canvas 640×400 (2× current). Draw order: `sim-bg.png` (full-bleed, `image-rendering: pixelated` off — we want the painterly look), then dynamic entities (coins, NPCs, avatar) on top.
- NPCs and coins are drawn from `sim-npcs.png` sprite strip via `ctx.drawImage` slice, with a subtle bob + soft drop shadow. No more rectangle bodies.
- Avatar: render the user's uploaded image inside a soft circular mask with a neon-pink rim glow matching the brand (`var(--pink)`). Light walk-bob when moving.
- Coin pickup → small particle burst (4 sparkle dots fading out) instead of just disappearing.
- NPC proximity → painted speech-bubble (rounded rect, tail, on-brand pink border) rather than a text label.

Playability fixes:
- Canvas gets `tabIndex={0}` and a wrapper that auto-focuses on mount + on click. Keyboard listeners attach to the canvas wrapper, not `window`, so arrow keys don't fight page scroll.
- On first render, show a soft "Click / tap to play" overlay until the user focuses the game. Once focused, overlay fades.
- `preventDefault` on arrow/WASD only while the canvas wrapper is the active element (so page scroll still works elsewhere).
- Movement uses a small acceleration + max-speed model (feels less stiff than the current constant 1.2 px/frame). Diagonal still normalized.
- Collision rects come from a single hand-tuned `COLLIDERS` array tied to the baked background; player is clamped to a walkable polygon (sky band still off-limits).
- D-pad + A button for touch keep working, but restyled to match the brand (pink/cyan, rounded-square, active glow).
- Goal feedback: HUD coin counter animates on pickup; on completion the existing "Quest complete" panel stays, but with a brand-matched gradient and confetti-particle burst from the player position.

Orchestration / base-layer design:
- All world state (NPC patrol params, coin positions, colliders, speech lines) lives in a single `WORLD` const at the top of the file. Avatar is the only injected dependency. Treat the scene as a frozen base layer the user can re-skin by swapping characters — no per-session regeneration.
- File stays a single self-contained client component, ~350 lines, no new deps.

### 3. `src/components/artoy/TryItNow.tsx`

- No structural changes to layout. The "5 › Ultimate playable experience" section remains exactly where it is.
- Update its sub-copy from "WASD / ARROWS · E TO CHAT" hint to also mention "Click the game to focus" so users understand the focus model.
- Keep the section visible even when `preview` is null, using a default sample avatar (`a1`) so visitors who haven't uploaded yet can still try the playable demo. (Avatar still swaps to the user's upload the moment they drop art.)

### 4. Out of scope

- No multiplayer, save state, or real animated walk cycles (still bob-based).
- No changes to the AI generation API (`generate-universe.ts` stays 5 + 3 = 8 assets).
- No changes to Hero, HowItWorks, CreatorUniverses, or other sections.

## Files

- Create: `src/assets/artoy/sim/sim-bg.png`, `src/assets/artoy/sim/sim-npcs.png`
- Rewrite: `src/components/artoy/PixelSocialSim.tsx`
- Edit (minor): `src/components/artoy/TryItNow.tsx`

## Acceptance check

After build I will load the preview, focus the canvas, press arrow keys, and confirm: (a) avatar moves immediately, (b) page does not scroll while game is focused, (c) background is the baked on-brand scene (not the current crayon look), (d) sprites are the pre-rendered NPC pack, (e) collecting all 8 coins triggers the brand-styled completion panel.
