# Replace social-proof sections with an Upload Mockup + Viral Unlock Popup

Drop the made-up Testimonials and "Why creators love ARTOY" sections. Replace with a single, action-oriented section that mocks the actual product flow: upload art → see preview → click "Generate" → a popup blocks with two paths (Pay to unlock OR Refer 3 friends to unlock free). This is the viral loop and the core value demo.

## Changes

### 1. Remove from landing
- Delete `src/components/artoy/Testimonials.tsx`
- Delete `src/components/artoy/WhyCreators.tsx`
- Remove their imports + usage from `src/routes/index.tsx`

### 2. New section: `TryItNow.tsx` (Upload Mockup + Key Features)

Layout: two-column inside a `panel-surface` (matches existing pattern).

**Left column — Upload mockup (interactive)**
- Big dashed drop-zone card with cloud-upload icon, "Drop your character art" + "PNG, JPG up to 20MB" + "Browse files" pill.
- Below it, a thumbnail strip of 3 sample characters ("Try a sample") — Nova / Mochi / Hexx using existing avatar assets.
- When user clicks Browse, drops a file, or clicks a sample → switch to **Preview state**:
  - Shows the chosen character on the left
  - Shows 4 auto-generated experience tiles on the right with shimmer/loading then revealed (reuse exp-game / exp-pet / exp-toy / exp-cards thumbnails as the "AI generated" output)
  - Big primary button: **"Generate my universe →"**
- Clicking "Generate my universe" opens the **Unlock dialog** (see #3).

**Right column — Key value features (4 items, icon-left text-right)**
Replaces the WhyCreators content but reframed around the demo:
1. **Upload once, get 5 experiences** — Game, pet, toy, cards, wallpaper auto-generated in your art style.
2. **Your IP, your revenue** — Every drop is yours. Sell digital or physical without inventory.
3. **Built-in fandom loop** — Fans play, collect, and refer friends to unlock more.
4. **Ship in minutes, not months** — No code, no 3D, no studio. Just upload.

### 3. New component: `UnlockDialog.tsx` (the viral popup)

Uses existing shadcn `Dialog`. Opens after clicking "Generate my universe".

Headline: **"Your universe is ready ✨"**
Sub: "Unlock all 5 experiences + HD downloads"

Two side-by-side option cards:

- **Pay to unlock** — `$9` one-time, "Instant access. No referrals needed." Primary CTA: "Unlock with payment".
- **Refer 3 friends, unlock free** — Shows a referral link `artoy.app/r/nova-7421` with a Copy button, plus Share-to-X / IG / TikTok / WhatsApp icons. Progress bar `0 / 3 friends joined`. Caption: "When 3 friends join the waitlist with your link, your universe unlocks free — and you get added to the Founders' wall."

Footer microcopy: "Either way, you keep 100% of your IP."

No real payment or referral backend — both buttons are visual/mock for now (Pay → toast "Payments coming soon, you've been notified"; Copy link → toast "Link copied"; Share icons → `window.open` to share URLs with prefilled text).

### 4. Page order in `src/routes/index.tsx`
```
Hero
HowItWorks
Universes
Experiences
TryItNow          ← NEW (replaces WhyCreators + Testimonials)
Waitlist
```

## Technical notes

- New files: `src/components/artoy/TryItNow.tsx`, `src/components/artoy/UnlockDialog.tsx`.
- Reuse existing assets: `avatar-1/2/3.png` for samples, `exp-game/pet/toy/cards.png` for generated output.
- Dialog: `@/components/ui/dialog`, toast: `sonner`.
- File-upload state managed locally with `useState` — accept image via `<input type="file" accept="image/*">` and render with `URL.createObjectURL`. No upload to server.
- Share intents use plain `window.open` URLs for X/WhatsApp/Telegram; IG/TikTok fall back to copy-link toast (no public share intent).
- Mobile: stack columns; dialog stays single-column.

## Out of scope
- Real payment integration (Stripe) — placeholder only.
- Real referral tracking — placeholder link + mock progress.
- Backend storage of uploads.
- Animations beyond the existing shimmer/fade utilities.
