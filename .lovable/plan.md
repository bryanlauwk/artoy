# Fix: Generation fails with "temporarily unavailable"

## What I found

- The app's generation endpoint (`/api/generate-universe`) currently returns **402 — AI credits rejected** for every image request. I reproduced it directly with a test image: all 5 assets fail with `402: Asset generation unavailable`.
- Your workspace balance shows **5.00 daily credits remaining**, but the AI image service still refuses the calls. This means the AI usage pool for this period is exhausted or held (the monthly AI allowance and top-ups are fully consumed), so live generation stays blocked until credits refresh or are topped up.
- In short: **the code is fine — the account is out of usable AI credit for image generation right now.**

## Plan

### 1. Make the demo resilient (the real fix)
Pre-bake the generated results for the 3 sample characters (Nova, Mochi, Hexx) so the demo works even with zero AI credit:

- Generate the 5 assets (character portrait, illustrated world, figurine, miniature world, acrylic charm) once per sample character, save them as static images in the project.
- When a visitor picks a sample character, show the pre-baked universe instantly — no AI call, no cost, no failure.
- Live AI generation is then used **only for visitor-uploaded art**, where a credit error is acceptable and expected.

### 2. Clearer error message for uploads
When a visitor uploads their own art and generation fails for credit reasons, show an honest, friendly message ("Live generation is paused right now — try one of the sample characters below, or leave your email and we'll notify you") instead of a generic error, and keep the email capture visible.

### 3. Your action (outside the app)
To restore live generation for uploads: top up workspace credits (Settings → Plans & credits) or wait for the daily/monthly credit refresh. This is a billing step only you can do.

## Technical notes

- New script generates the 15 sample assets (3 characters × 5 items) via the existing `generateCollection` in `src/lib/universe-generation.ts`, saved under `src/assets/artoy/prebaked/`.
- `TryItNow.tsx` / `useCreatorSession.ts`: sample selection short-circuits to pre-baked results; uploads keep the live `/api/generate-universe` path.
- Error copy updated in the 402 branch of the session hook; email capture panel shown alongside the error.
- No changes to the AI model, prompts, or the mini-game.
