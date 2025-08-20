# LUDUS Platform - TODOs & Roadmap (derived from OpGrapes + repo scan)

This file collects prioritized tasks to bring the repository to LDS1.2 / OpGrapes quality and to complete documentation merging.

Top-level checklist
- [x] Add CI (GitHub Actions) for build, lint, test, and smoke checks (server + client)
- [ ] Add Storybook for React components and run component tests (Vitest)
- [ ] Add Playwright E2E suites and CI run
- [x] Add security checks: dependency audit on CI (dependabot/CI job added)
- [ ] Add a CONTRIBUTING.md and PR template

Priority 1 — Safety, reproducible dev env
- [ ] Ensure `.env.example` fully lists required keys (done) and remove any secrets from repo
- [ ] Document PowerShell / Windows dev commands in README (done)
- [ ] Add `cross-env` (done) and validate server `dev` works on Windows
- [ ] Add `concurrently` dev script (done) and verify `npm run dev` from repo root

Schema & runtime fixes (in-progress)
- [x] Remove duplicate Mongoose index declarations that caused runtime warnings (Page.slug, Wallet.user, AdminRole.name)
		- Verified: server starts and logs show no duplicate-index warnings after edits
		- Persisted `url` on the `Page` model (removed virtual that conflicted with real path)
		- Added migration and maintenance scripts under `server/scripts/`:
			- `migrate-populate-pages-url.js` (populate missing/incorrect `url` values)
			- `reindex-pages-url.js` (create sparse unique index safely)
			- `migrate-and-reindex-pages-url.js` (combined safe script; dry-run by default, `--yes` to apply)

Next immediate moves (priority)
- Restart server under Node 18 locally or via your normal dev flow and run the health check to confirm behavior consistently:

```powershell
cd "e:/LDS GIt/ludus-platform/server"
# start server and watch logs
node src/app.js
# or run in background and probe health
Start-Process -NoNewWindow -FilePath node -ArgumentList 'src/app.js'; Start-Sleep -s 1; (Invoke-WebRequest -UseBasicParsing http://localhost:5000/health).Content
```

-- After verification, add a small smoke test and CI step that runs the health check after starting the server (CI already runs a simple smoke step for server health).
 
A — Reduce lint warnings (in-progress)
- [x] Remove or mark unused parameters (e.g., `next`) and clean up unused variables across `server/src` to lower ESLint warnings (server now largely clean)
	- Owner: TBD
	- Notes: server-side cleanup applied; inline suppressions remain for intentional lazy requires.
	- Next: sweep client ESLint warnings and tighten CI rules once client is clean.
	- Update: client build made cross-platform by adding `cross-env` to `client/package.json`.

Priority 2 — Tests & quality
- [x] Run and stabilize server unit tests (Jest) — basic health test passing
- [ ] Create lightweight tests for critical flows: auth, payments (moyasar), booking
- [ ] Add linting & formatting (ESLint + Prettier) with config and CI

Priority 3 — Docs & consistency
- [ ] Add Storybook and document all UI components
- [ ] Merge remaining `.md` docs into a single `docs/` collection (API, Deploy, Ops)
- [ ] Publish `LUDUS_DOCUMENTATION_INDEX.md` updated to point to merged docs

Priority 4 — OpGrapes feature mapping (implementation tasks)
- [ ] Social & Personalization: Verify Apple Sign-in support and advanced preference filters
- [ ] Geo-Map & Wallet: Implement Wallet model, admin credit issuance, and Map UI (client has Google Maps loader)
- [ ] Ratings: Ensure rating enforcement flow is present and tested
- [ ] RBAC: Harden admin role checks and add tests for permission escalation

Low risk improvements (quick wins)
- [ ] Replace console.log in production code with a logger (winston/pino) and use Sentry for errors
- [ ] Add a GitHub Action to run `npm test` in `server` and `client`
- [ ] Add small smoke test that hits `GET /health` on server after start

Notes & assumptions
- The codebase is a CRA frontend + Express backend (not yet migrated to Next.js). OpGrapes specifies Next.js & Firebase — that's a major migration and should be scoped separately.
- I will run server tests next and produce a focused list of test failures and fixes.

Owner / Next steps
- Choose an owner for CI + tests work (CI workflow already added; I can iterate on jobs and add Storybook/Playwright as next PRs).

Immediate next task (started now):
- Run client unit tests in CI mode and report failures/warnings so we can schedule fixes.

High priority pending:
- Run `server/scripts/migrate-and-reindex-pages-url.js` against a staging DB (use secure `MONGODB_URI`; the script is dry-run by default). Do NOT run on production without a backup and maintenance window.

Security / Secrets
- If you pasted real secrets into chat or committed them, rotate them immediately (DB credentials, JWT secrets, API keys).
- Add required secrets in GitHub repository Settings → Secrets → Actions. The CI workflow reads these values via `${{ secrets.* }}` for server test and smoke steps.
- Use the committed `.env.example` as a template for local `.env` (do NOT commit your real `.env`).
