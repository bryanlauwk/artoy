# ARTOY

Turn character artwork into a playable universe and collectible concepts.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-perfect-clone-71659.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b284805-8524-4524-898a-e7ed5693973e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## The Lost Fragments

The studio uses one curated explore-and-dash adventure for every character. Uploaded artwork is playable immediately; generation produces a single full-body **Game Character** asset that replaces the original-art hero. Artwork colors and fragments personalize the same authored world without generating new mechanics.

Recover three art fragments, dash through roaming inklings, then return to the portal before 90 seconds expire. Use WASD/arrows and Space, or tap/drag and the touch controls. P pauses. All characters are available without progression locks.

Run `npm run test:game` with Node 22.18+ or Node 24 for the gameplay regression checks. See [the module audit and design contract](docs/game-module-audit.md) for the findings, implementation and validation limits.
