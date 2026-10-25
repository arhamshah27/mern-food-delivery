# Architectural Decisions Log

This file records key decisions made during development following the guidelines in `CLAUDE.md`.
Format: `- <date> <area>: <decision> — <why>`

- 2026-10-24 setup: Build incrementally on top of existing `backend` and `frontend/vite-project` — Preserve existing working features while bringing models, routes, pricing service, and roles into full compliance with `IMPLEMENTATION.md`.
- 2026-10-24 structure: Keep `backend` and `frontend/vite-project` folder names and map root scripts to them — Existing working terminals and vite configurations are already mounted to these paths.
- 2026-10-24 roles: Support all 4 roles (`owner`, `shop_manager`, `delivery_partner`, `customer`) with backward compatibility for legacy `admin` — Prevents breaking existing admin credentials while enabling the full RBAC permission matrix.
- 2026-10-24 money: Centralize pricing in `backend/services/pricing.js` with `POST /api/cart/quote` — Server must be the single source of truth for taxes, delivery charges, discounts, and order amounts.
- 2026-10-24 network: Inject Google/Cloudflare public DNS servers in database connection — Fixes Windows ISP DNS SRV record ECONNREFUSED when querying MongoDB Atlas cluster.
- 2026-10-24 seed: Seed all 5 demo role users (`owner@demo.com`, `manager@demo.com`, `rider@demo.com`, `rider2@demo.com`, `customer@demo.com`) with `Demo@1234` while preserving `admin@barodagourmet.com` — Provides full adherence to IMPLEMENTATION.md §10 test logins.
- 2026-10-24 payments: Provide simulated test mode fallback when Razorpay API keys are absent — Ensures test payments succeed and allows running the entire application and test suite without hard external dependencies.
- 2026-10-24 status: Implement finite state machine in `services/orderStatus.js` enforcing transition rules (`pending_payment` -> `placed` -> `preparing` -> `out_for_delivery` -> `delivered`, `cancelled`) — Prevents unauthorized or illogical status jumps, mandates partner assignment prior to dispatch, and automatically marks COD cash collected on delivery.
- 2026-10-24 onboarding: Use crypto SHA-256 tokens for shop manager invites (`/onboard?token=...`) with 48h expiration — Enables secure email-free invite links that can be directly copied from the admin panel.
- 2026-10-24 tracking: Use Leaflet with OpenStreetMap tiles for customer `TrackingMap` and admin `LiveFleetMap` with custom HTML DivIcons — Delivers full interactive live tracking without requiring proprietary Google Maps API keys or billing.
- 2026-10-24 telemetry: Created `simulateRider.js` script streaming live waypoint coordinates via `PATCH /delivery/orders/:id/location` every 3 seconds — Allows end-to-end verification of customer map movement and fleet tracking during local testing.
