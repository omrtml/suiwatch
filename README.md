# Portfolio Checker / SuiWatch

Portfolio Checker is a small, focused app for inspecting on-chain portfolios and checking eligibility for token distributions. The project bundles a user-facing interface, wallet integration, and a lightweight backend for lookup and helper APIs. A pool checker and airdrop checker are part of the core functionality.

This repository is intended as a practical tool for users to:

- Inspect balances and positions for an address
- Check pool participation and summarized pool metrics
- Verify airdrop eligibility via snapshot lookups or indexed rules
- Connect a wallet to perform interactive flows (lookups, claims, or transactions)

---

## Highlights

- Address lookup and portfolio summary
- Pool checker: view participation, share, and outcomes
- Airdrop checker: fast snapshot lookups and an interface for claim guidance
- Wallet-connect: connect an address and trigger wallet-driven actions
- Small server component for API endpoints and snapshot hosting

---

## Quick start

Prerequisites:

- Node.js and npm

Install dependencies:

```bash
npm install
```

Run the app in development:

```bash
npm run dev
```

Start the backend server (if needed):

```bash
node server/index.js
```

Build for production:

```bash
npm run build
```

---

## Layout (what's in the repo)

- `src/` — frontend source and components
- `server/` — backend endpoints and snapshot files
- `api/` — small edge/serverless endpoints used by the UI
- `public/`, `img/`, `assets/` — static assets

---

## Adding snapshots

To test or run airdrop checks locally, add JSON snapshot files under `server/snapshots/` and implement a simple lookup route that returns eligibility for an address.

If you want, I can scaffold a small example snapshot and the corresponding server route.

---

## Contributing & next steps

- Create branches for features and open PRs with clear descriptions.
- I can scaffold the airdrop-check endpoint and a simple `AirdropChecker` UI if you want to move to an MVP quickly.

---

## License

No license file is included yet. Add a `LICENSE` to specify reuse terms.

