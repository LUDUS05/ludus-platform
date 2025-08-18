# LUDUS Platform - TODOs & Roadmap (derived from OpGrapes + repo scan)

This file collects prioritized tasks to bring the repository to LDS1.2 / OpGrapes quality and to complete documentation merging.

Top-level checklist
- [ ] Add CI (GitHub Actions) for build, lint, test, and e2e (Playwright)
- [ ] Add Storybook for React components and run component tests (Vitest)
- [ ] Add Playwright E2E suites and CI run
- [ ] Add security checks: secret scanning, dependency audit on CI, Snyk/Dependabot
- [ ] Add a CONTRIBUTING.md and PR template

Priority 1 — Safety, reproducible dev env
- [ ] Ensure `.env.example` fully lists required keys (done) and remove any secrets from repo
- [ ] Document PowerShell / Windows dev commands in README (done)
- [ ] Add `cross-env` (done) and validate server `dev` works on Windows
- [ ] Add `concurrently` dev script (done) and verify `npm run dev` from repo root

Schema & runtime fixes (in-progress)
- [x] Remove duplicate Mongoose index declarations that caused runtime warnings (Page.slug, Wallet.user, AdminRole.name)
	- Verified: server starts and logs show no duplicate-index warnings after edits (see runtime output below)
	- Runtime snippet observed: "Skipping database connection (test mode or no MONGODB_URI)" then "{ port: 5000 } Server running"

Next immediate moves (priority)
- Restart server under Node 18 locally or via your normal dev flow and run the health check to confirm behavior consistently:

```powershell
cd "e:/LDS GIt/ludus-platform/server"
# start server and watch logs
node src/app.js
# or run in background and probe health
Start-Process -NoNewWindow -FilePath node -ArgumentList 'src/app.js'; Start-Sleep -s 1; (Invoke-WebRequest -UseBasicParsing http://localhost:5000/health).Content
```

- After verification, add a small smoke test and CI step that runs the health check after starting the server.
 
A — Reduce lint warnings (in-progress)
- [ ] Remove or mark unused parameters (e.g., `next`) and clean up unused variables across `server/src` to lower ESLint warnings.
	- Owner: TBD
	- Notes: I started this earlier and removed several unused imports; continue iteratively and tighten CI rules once cleared.
	- Progress: server-side cleanup applied — most `no-unused-vars` / `no-undef` issues in `server/src` have been fixed. ESLint now reports no errors or warnings in `server/src` after recent edits. Inline suppressions remain for intentional dev/test lazy requires (e.g., `mongodb-memory-server`).
	- Next: run server tests and then sweep client/other packages; tighten ESLint rules after both passes.
	- Update: making client scripts cross-platform by adding `cross-env` to `client/package.json` so Windows developers can run `npm run build` locally.

Priority 2 — Tests & quality
- [ ] Run and stabilize server unit tests (Jest) and fix failing tests
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
- Choose an owner for CI + tests work (I can implement the CI workflow if you want).

Security / Secrets
- If you pasted real secrets into chat or committed them, rotate them immediately (DB credentials, JWT secrets, API keys).
- Add required secrets in GitHub repository Settings → Secrets → Actions. The CI workflow reads these values via `${{ secrets.* }}` for server test and smoke steps.
- Use the committed `.env.example` as a template for local `.env` (do NOT commit your real `.env`).
