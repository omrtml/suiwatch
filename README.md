# Portfolio Checker / SuiWatch

A small Vue 3 + Vite project for checking on-chain portfolio details and (planned) airdrop eligibility on Sui. The app includes a lightweight server component, wallet integration, and Tailwind CSS for the UI.

This repository contains an app used to inspect portfolio information and to prototype an airdrop eligibility checker and claim UI.

---

## Features

- Vue 3 + TypeScript frontend (Vite)
- Tailwind CSS-based styling
- Wallet integration (universal connector in `src/walletConfig.ts`) and a reusable `WalletButton` component
- Small Express-style server in `server/` for API endpoints (ai endpoints and future airdrop endpoints)
- Planned: Airdrop checker endpoints + UI to check eligibility and guide claim flows

---

## Quick start

Prerequisites:

- Node.js 18+ (or an LTS you prefer)
- npm (or yarn/pnpm — commands below use npm)

Install dependencies:

```bash
npm install
```

Start the dev server (frontend):

```bash
npm run dev
```

Type-check (optional):

```bash
npx vue-tsc -p tsconfig.json --noEmit
```

Start the local backend (server):

```bash
node server/index.js
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Project layout

- `src/` – Vue app files
  - `App.vue` – main layout
  - `main.ts` – app entry
  - `components/` – reusable UI components (e.g., `WalletButton.vue`, `PortfolioDashboard.vue`, `AdviceButton.vue`)
  - `composables/` – Vue composition helpers
  - `walletConfig.ts` – wallet connector configuration
- `server/` – server-side endpoints
  - `index.js` – server entry; add airdrop endpoints here (or add `server/airdrop.js`)
- `api/` – edge or serverless endpoints used by the frontend (contains `ai.js` and `_health.js`)
- `public/`, `img/`, `assets/` – static assets

---

## Airdrop checker (MVP plan)

We plan two tiers for the airdrop checker:

1. MVP (fast): load a snapshot file (JSON/CSV) published by the airdrop team into the server (memory/Redis) and perform address lookups. This provides O(1) lookups, is simple, and fast to implement.

2. Robust (longer): use an indexer or RPC+event history to compute eligibility from on-chain state and events. This supports more complex rules (NFT ownership at block height, tx history), but requires an indexer or heavier RPC usage.

Server endpoints (examples):

- `POST /api/airdrop/check` — body: `{ address, airdropId? }` → returns eligibility & details
- `POST /api/airdrop/claim` — if the airdrop requires an authenticated server-side step (preferred approach is client-signed claim TXs so server never holds keys)

Implementation notes:

- Snapshot format: `{ address: string, amount: string, proof?: any }[]` — store in `server/snapshots/` for local testing.
- Cache lookups in memory or Redis with a TTL.
- Rate-limit the API to avoid scraping.

---

## How to add a local snapshot for testing

1. Create a JSON file at `server/snapshots/sample-airdrop.json` with an array of records:

```json
[
  { "address": "0xabc...", "amount": "100.0", "meta": { "tier": "early" } }
]
```

2. Add a small lookup route in `server/index.js` that imports that JSON and performs a case-insensitive lookup.

If you want, I can scaffold that endpoint and a sample snapshot to speed up the MVP.

---

## Development notes

- Tailwind: the project uses Tailwind CSS utilities. If you change class names with arbitrary values (like `scale-[1.02]`) make sure your Tailwind config allows arbitrary values or replace with standard utilities.
- Type-check the Vue/TS code with `npx vue-tsc` before committing large changes.

---

## Contributing

1. Fork the repo
2. Create feature branches
3. Open a PR with a clear description and screenshots for UI changes

Please open issues for bugs and feature requests. If you want me to implement the airdrop checker MVP, tell me and I’ll scaffold the server endpoint + `AirdropChecker.vue` UI.

---

## License

This repo does not include a license file yet — add a `LICENSE` if you want a specific license. Default: All rights reserved.

---

If you'd like, I can now:

- scaffold the airdrop-check endpoint and a `server/snapshots/sample-airdrop.json` file, and
- add a `src/components/AirdropChecker.vue` UI and wire it to the endpoint.

Tell me which of those you'd like me to do next.
# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
