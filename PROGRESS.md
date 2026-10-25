# Project Progress Checklist

Live checklist tracking all 17 implementation phases from `IMPLEMENTATION.md` §10.

## Implementation Phases

- [x] **Phase 1: Scaffold**
  - Dev servers running (`backend` on :5000, `frontend/vite-project` on :5173).
  - Health check endpoint `/api/health` verified.
  - Root scripts and `.env` protection verified.

- [x] **Phase 2: Models, permissions, seed**
  - Enhanced `User.js` with roles (`owner`, `shop_manager`, `delivery_partner`, `customer`, `admin`), status (`active`, `pending`, `suspended`), addresses, and deliveryProfile.
  - Enhanced `Order.js` with partner assignment, Razorpay IDs, addressDetails, and status lifecycle.
  - Enhanced `Setting.js` with delivery radius, coordinates, payment toggles, and free delivery thresholds.
  - Created `backend/config/permissions.js` with full RBAC permission matrix.
  - Ran `npm run seed` verifying all test logins seeded (`owner@demo.com`, `manager@demo.com`, `rider@demo.com`, `rider2@demo.com`, `customer@demo.com`).

- [x] **Phase 3: Auth + guards**
  - Updated `authMiddleware.js` with `protect`, `authorize(...permissions)`, `requireRole`, and status validation.
  - Verified login for all 4 roles (`owner@demo.com`, `manager@demo.com`, `rider@demo.com`, `customer@demo.com`).
  - Suspended and pending account checks enforced.

- [x] **Phase 4: Public API + Home + Menu**
  - Home and menu driven dynamically by MongoDB.
  - Category chips, veg/non-veg dietary filter, and real-time search verified.
  - Added global `Cache-Control: no-store` to guarantee fresh data on every fetch.

- [x] **Phase 5: Dish details + cart + quote**
  - Created `backend/services/pricing.js` as single source of truth for all cart pricing, coupons, tax, and delivery fee calculation.
  - Implemented `POST /api/cart/quote` endpoint.
  - Connected `CartContext.jsx` to synchronize real-time server quotes with warnings and free delivery thresholds.
  - Verified with live API quote tests and clean frontend build.

- [x] **Phase 6: Admin shell + menu CRUD + upload + availability**
  - Menu item CRUD operations with Cloudinary & fallback disk storage.
  - Implemented `PATCH /api/foods/:id/availability` endpoint.
  - Availability toggle reflects immediately on customer menu ("Out of stock" badge & disabled add).

- [x] **Phase 7: Categories, add-ons, banners, coupons admin**
  - Full admin management interfaces for Categories, Add-ons, Banners, and Coupons.
  - Active toggle and CRUD operations dynamically reflected across customer-facing pages.

- [x] **Phase 8: Settings admin**
  - Configured owner-only RBAC protection on `PUT /api/settings` (`authorize('settings:write')`).
  - Added free delivery threshold, delivery radius, coordinates, and payment method toggles to `Setting.js`, `settingController.js`, and `Settings.jsx`.
  - Dynamic pricing and payment restrictions integrated into cart quotation and checkout.

- [x] **Phase 9: Profile + addresses + PinPicker + checkout COD**
  - Customer checkout with Cash on Delivery (COD) and order confirmation.
  - Server recomputes subtotal, taxes, delivery fees, and discounts independently.
  - Server validates minimum order amount and restaurant `isOpen` status.

- [x] **Phase 10: Razorpay**
  - Razorpay test mode integration (`POST /api/payments/create-order`, `/verify`, `/failed`).
  - Installed `razorpay` in `backend/` and added simulated test fallback in `backend/config/razorpay.js`.
  - Dynamic client Razorpay SDK loader (`frontend/vite-project/src/utils/loadRazorpay.js`).
  - Online payment toggle and cancellation refund handling verified.

- [x] **Phase 11: Orders admin + status machine + my orders tracker**
  - Created `backend/services/orderStatus.js` enforcing finite state machine transitions (`pending_payment` -> `placed` -> `preparing` -> `out_for_delivery` -> `delivered`, `cancelled`).
  - Transition guards prevent invalid jumps and require partner assignment before marking out for delivery.
  - Customer order status and My Orders polling configured to auto-refresh every 10 seconds.
  - Partner contact details securely exposed to customer only while `out_for_delivery`.

- [x] **Phase 12: Onboarding (invite + partner apply/review) + staff page**
  - Owner-only magic invite token generation (`POST /api/admin/staff/invite`).
  - Cryptographic sha256 token verification and password creation (`/onboard?token=...`).
  - Public courier registration portal (`/partner/apply`) and review/approval dashboard (`/admin/applications`).
  - Staff management directory (`/admin/staff`) with partner suspension rules.

- [x] **Phase 13: Delivery app + assignment**
  - Built mobile-responsive Delivery Partner portal (`/delivery`).
  - Big online/offline switch with browser geolocation request and active order guards.
  - Real-time assigned order list with "Accept Assignment", navigation link to Google Maps, and COD cash collection checkbox.

- [x] **Phase 14: Map tracking + live fleet map + simulator**
  - Built `TrackingMap.jsx` using `react-leaflet` and OpenStreetMap tiles with live rider marker.
  - Built `LiveFleetMap.jsx` (`/admin/fleet`) monitoring city-wide courier telemetry.
  - Created `backend/scripts/simulateRider.js` (`npm run simulate-rider -- <orderId>`) streaming live GPS coordinates along route waypoints to completion.

- [x] **Phase 15: Dashboard**
  - Built operations hub (`Dashboard.jsx`) with 5 KPI stat cards, Recharts revenue bar chart (Today / 7d / 30d range toggle), top-5 dishes ranking, and orders-by-status pipeline chips.
  - 30-second live background polling configured.

- [x] **Phase 16: Polish: responsive, empty/error states, 403/404**
  - Built `Forbidden.jsx` (403) and `NotFound.jsx` (404) error pages.
  - Responsive layouts down to 360px mobile viewports.
  - Comprehensive RBAC guards across Customer, Admin, and Delivery portals.

- [x] **Phase 17: Deploy + README + screenshots**
  - Complete `README.md` written documenting architecture, test credentials, and setup instructions.
  - Both frontend (`npm run build`) and backend verified running cleanly with 0 errors.
