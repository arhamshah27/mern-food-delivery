# CLAUDE.md — Online Food Ordering (MERN hackathon build)

You are building, end to end and **without stopping to ask questions**, a single-restaurant food ordering website whose admin panel controls everything customers see. The full spec is in `IMPLEMENTATION.md`. Read it fully before writing code, and re-read the relevant section before each phase.

## How to work (autonomy rules)

1. **Do not ask the user questions.** When something is ambiguous, choose the simplest option consistent with `IMPLEMENTATION.md`, write a one-line entry in `DECISIONS.md` (`- <date> <area>: <decision> — <why>`), and continue.
2. Work through the phases in `IMPLEMENTATION.md` §10 **in order**. Do not start a phase until the previous one meets its "Done when" check.
3. Keep a live checklist in `PROGRESS.md` (phase list with `[ ]` / `[x]` and a short note of what was verified). Update it at the end of every phase. If you are resumed in a new session, read `PROGRESS.md` and `DECISIONS.md` first and continue from the first unchecked phase.
4. After each phase: run `npm test` (server) and `npm run build` (client), fix failures, then commit with the phase's message from §10 and push if a remote exists. Never leave the repo broken between phases.
5. If a command fails, read the error, fix the cause, retry. After three failed approaches to the same problem, choose a simpler fallback, log it in `DECISIONS.md`, and move on. Never stop the build waiting for input.
6. External services may be missing keys (Cloudinary, Razorpay, Atlas). Code must still run: use local MongoDB (`mongodb://127.0.0.1:27017/food_ordering`) or `mongodb-memory-server` for tests; Cloudinary missing → upload endpoint returns 503 and forms accept pasted image URLs; Razorpay missing → online payment hidden. Never block on credentials.
7. Do not invent features outside the spec until every phase and the final acceptance checklist (§10) is done. Extras then: Socket.IO push, GitHub Actions CI.
8. Long-running processes (dev servers) must be started in the background and stopped when you're done verifying; never leave a foreground server blocking the session.

## Non-negotiables

- **Nothing customer-visible is hard-coded.** Restaurant name/logo/contact, banners, categories, dishes, prices, add-ons, availability, popular flags, tax %, delivery charge, free-delivery threshold, minimum order, opening hours, closed switch, payment methods, delivery radius, restaurant location and coupons all come from MongoDB via the API. Before committing a UI phase, grep the client for rupee amounts or dish names in JSX.
- **Server computes all money** in `server/src/services/pricing.js`. Client totals are previews from `POST /api/cart/quote`. Orders snapshot names and prices.
- **Security:** bcryptjs (cost 10) for passwords; JWT in httpOnly cookie; every `/api/admin/*` and `/api/delivery/*` route uses `auth` + `authorize(permission)` from `config/permissions.js`; re-read user role/status from DB on every request; zod validation on every write; customers only see their own orders; partners only their assigned orders.
- **Secrets:** `.env` is never committed. `server/.env.example` and `client/.env.example` are kept up to date whenever a new env var is added. Before every commit run `git status` and make sure no `.env` file is staged.
- **Roles:** `owner` (the brief's admin), `shop_manager`, `delivery_partner`, `customer` — permission matrix in `IMPLEMENTATION.md` §3.4. Owner-only: settings write, inviting/suspending shop managers.
- **Statuses:** `pending_payment → placed → preparing → out_for_delivery → delivered`, `cancelled`. Transitions only through `services/orderStatus.js`.
- **Fresh data:** API responses send `Cache-Control: no-store`; React Query `staleTime: 0`; admin mutations invalidate admin and public query keys.

## Stack and versions

Node 20, Express 4, Mongoose 8, MongoDB; React 18 + Vite 5, React Router 6, TanStack Query 5, Zustand 4, Tailwind 3, react-hook-form + zod, react-leaflet 4 + Leaflet 1.9 (OpenStreetMap tiles), Recharts 2, Razorpay (test mode), Cloudinary, Jest + Supertest + mongodb-memory-server. ES modules (`"type": "module"`) in both packages. JavaScript (not TypeScript) to keep the build fast.

## Commands

```bash
npm run install:all                  # root + server + client
npm run dev                          # API :5000 + client :5173 (run in background when verifying)
npm run seed                         # seed demo data (add -- --reset to wipe first)
npm test                             # server tests
npm run build                        # client production build
npm --prefix server run simulate-rider -- <orderId>   # fake live delivery for the map
curl -s localhost:5000/api/health    # API check
```

Verification pattern for an API phase: start the server in the background, seed, hit endpoints with `curl -c cookies.txt -b cookies.txt` (log in as each role), check status codes and JSON, stop the server. For UI phases also run `npm run build` and, if Playwright is available, load the key pages headlessly and check for console errors.

## Code conventions

- Server: routes → controllers → services; controllers wrapped in `asyncHandler`; throw `AppError` helpers (`badRequest`, `forbidden`, `notFound`, `conflict`); one error handler. Money via `round2`. No business logic in routes.
- Client: data fetching only through hooks in `src/api/hooks/*` using TanStack Query; consistent query keys (§4.3); forms with react-hook-form + zod; toasts for every mutation; loading, empty and error states on every page; Tailwind only (no other CSS framework); mobile-first; accessible labels on inputs and buttons.
- Names: files `PascalCase.jsx` for components/pages, `camelCase.js` otherwise; API paths kebab-case.
- Keep components under ~250 lines; extract subcomponents.
- No `console.log` left in committed client code; server logs via morgan + `console.error` for 500s.
- Commits: Conventional Commits (`feat(scope): ...`, `fix(scope): ...`, `chore:`, `docs:`, `test:`, `style:`). Commit at least once per phase; split large phases into 2–3 commits (server, client, tests).

## Definition of done (whole project)

1. All 17 phases in `IMPLEMENTATION.md` §10 checked in `PROGRESS.md`.
2. Every item in the final acceptance checklist (§10) verified and noted in `PROGRESS.md`.
3. `npm test` and `npm run build` pass.
4. `README.md` follows §9 with real logins; screenshot placeholders listed in `docs/screenshots/README.md` if you cannot capture them (if Playwright is available, capture them with the seeded data at 1280×800 and 390×844).
5. Deployment config present (`client/vercel.json`, Render notes, health check). If deployment credentials are not available in the environment, leave clear step-by-step deploy instructions in README and log it in `DECISIONS.md` — do not stop.
6. No `.env` in git history; `.env.example` files complete.

## Gotchas (read before coding)

- Mount the Razorpay webhook route with `express.raw()` **before** `express.json()`.
- Express 4 `req.query` is read-only — store parsed query in `req.validatedQuery`.
- Cross-site cookies in production need `secure: true, sameSite: 'none'` and `app.set('trust proxy', 1)`; in dev use the Vite proxy (`/api` → `:5000`) so cookies are same-origin.
- Leaflet default marker icons break under Vite — use `L.divIcon` (see §4.1). Import `leaflet/dist/leaflet.css` once in `main.jsx`.
- Geolocation requires HTTPS or `localhost`.
- Nominatim requires a real `User-Agent` and ~1 request/second: debounce search 500 ms and cache on the server.
- OSRM public server can be slow: 2.5 s timeout and straight-line fallback (already in `services/geo.js`).
- Opening hours use the restaurant timezone (`Asia/Kolkata`) via `Intl.DateTimeFormat`, not server local time.
- Soft-delete dishes (`isDeleted`) so old orders stay valid; filter them out everywhere customer-facing.
- Same dish with different add-ons = separate cart lines (key = dishId + sorted option ids).
- Mongoose `populate('addonGroups')` before pricing; never trust client prices or option prices.
- `refetchInterval` must return `false` once an order is delivered/cancelled.

## Files you own beyond the spec

- `PROGRESS.md` — phase checklist + verification notes.
- `DECISIONS.md` — every judgement call, one line each.
- `docs/screenshots/` — README screenshots.
