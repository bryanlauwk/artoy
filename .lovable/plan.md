## Goal
Make the "Unlock with payment" CTA actually generate the 5 IP-universe experiences via Lovable AI image generation (prototype, no real payment).

## Backend — AI generation
- Add `src/lib/ai-gateway.server.ts` with `createLovableAiGatewayProvider` helper (per Lovable AI Gateway pattern).
- Add server route `src/routes/api/generate-universe.ts` (POST):
  - Input: `{ imageDataUrl: string, characterName?: string }`.
  - Calls Lovable AI Gateway `/v1/images/generations` with `google/gemini-3.1-flash-image-preview` (image-to-image edit) 5 times in parallel — one per experience:
    1. Mini Game pixel sprite sheet
    2. Virtual Pet 3D-toy render
    3. Vinyl Toy product mockup
    4. Trading Card with frame + stats
    5. Wallpaper / key-art
  - Each request passes the uploaded character as input image + a tailored prompt that preserves the character's style.
  - Returns `{ results: [{ label, image: dataUrl }] }`. Surfaces 402/429/validation errors clearly.
- Ensure `LOVABLE_API_KEY` is provisioned (check via secrets; create if missing).

## Frontend — wire the CTA
- `UnlockDialog.tsx`:
  - Add prop `onUnlock: () => void | Promise<void>` and `isGenerating: boolean`.
  - "Unlock with payment" button → calls `onUnlock()` (no toast about "coming soon"), shows spinner while generating, closes on success.
  - Keep referral card visual-only.
- `TryItNow.tsx`:
  - On upload/sample-select, store the source image as a data URL (convert sample imports + uploaded file via FileReader).
  - "Generate my universe" still opens `UnlockDialog`.
  - New `handleUnlock`: POSTs to `/api/generate-universe` with the data URL → on success replaces the 4 placeholder output tiles with the AI-generated images (upgrade to 5 tiles incl. Wallpaper), shows a small "✦ AI generated" badge per tile, and surfaces errors via `sonner`.
  - Add loading shimmer state on the output grid while the request is in flight.

## Out of scope
- Real payment, real referral tracking, persistence/storage of generations.
