# Adventure Engine — PoC

Outdoor escape-room PWA (pirate treasure hunt) that turns a real park into a GPS-driven adventure for kids.

## Workflow

- **This is a Proof of Concept — work directly on `main`.** Do not create feature branches or PRs; commit and push to `main`. (Deploys to GitHub Pages on push to `main`.)

## Stack & layout

- Vite + React + TypeScript, Zustand, Zod, react-router-dom (HashRouter), `idb`, `vite-plugin-pwa`. Tests: Vitest + Testing Library.
- Deployed to GitHub Pages at base `/poc/` (`https://adventure-engine.github.io/poc/`). Vite `base: '/poc/'`; routing is hash-based.
- Content is data-driven: one bundled scenario JSON (`src/scenarios/pirates.json`) with `locations[]` + `steps[]`. The engine (`src/engine/reducer.ts`) is a pure deterministic `(state, event) => state` reducer — keep it free of `Date.now()`/randomness; the store/UI pass timestamps in.
- On-site GPS coordinates are recorded via the hidden `/author` capture screen, then pasted into the scenario JSON.

## Commands

- `npm test` — run the suite. `npm run dev` — local dev. `npm run build` — production build (emits the PWA service worker + manifest).
