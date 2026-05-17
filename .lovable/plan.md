# Plan: Build ARTOY landing page

Convert the uploaded `artoy_landing.html` mockup into the real app as a single-page landing on `/`, faithful to its dark cyber/playful aesthetic (pink → purple → cyan gradient, glow, glassmorphism).

## Scope

- Single-page marketing landing (sections: Hero, How it works, Universes, Game demo, Playable experiences, Why creators, Waitlist, Footer). Sections live on `/` with smooth-scroll hash anchors — matches the mockup's single-scroll design intent.
- No backend. Waitlist form is presentational (shows a success message on submit), same as the mockup.

## Design system

Update `src/styles.css`:
- Replace token values with ARTOY palette in `oklch`: background `#060813`, panels, text, muted, plus brand accents `--pink #ff4fbd`, `--purple #8b5cf6`, `--cyan #26e1d1`, `--orange #ffb84d`.
- Add gradient + glow custom properties (`--gradient-brand`, `--shadow-glow`) and register `--color-pink/purple/cyan/orange` in `@theme inline` so Tailwind utilities like `text-pink`, `bg-purple` work.
- Body background: radial gradients + base color, as in mockup.
- Use Inter via Google Fonts (link in `__root.tsx` head).

## Routes

- `src/routes/index.tsx`: replace placeholder with full landing page (composed of small section components colocated in `src/components/artoy/`).
- `src/routes/__root.tsx`: update meta (title "ARTOY — Turn Your Art Into A Playable Universe", description, og tags) and add Inter font link.

## Components (in `src/components/artoy/`)

- `Nav.tsx`, `Hero.tsx`, `HowItWorks.tsx`, `Universes.tsx`, `GameDemo.tsx`, `Experiences.tsx`, `WhyCreators.tsx`, `Waitlist.tsx`, `Footer.tsx`.
- Use existing shadcn `Button`, `Input`, `Card` where appropriate, restyled via the new tokens / custom variants (gradient brand button).
- Keep emoji-based visuals from the mockup (no external image hosts).

## Out of scope

- No real waitlist storage, no auth, no Lovable Cloud.
- No image generation — the mockup uses emoji/CSS art only.

## Technical notes

- Tailwind v4 tokens defined in `src/styles.css` `@theme inline` + `:root`.
- Smooth scroll via `html { scroll-behavior: smooth }` already standard; add to base layer.
- Responsive: collapse grids to single column under `md`, matching mockup breakpoints.
