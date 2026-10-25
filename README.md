# 🍽️ Baroda Gourmet — Online Food Ordering & Fleet Delivery Platform

A full-stack, enterprise-grade gourmet food ordering and real-time fleet delivery application built for restaurant operations across Vadodara.

---

## 🌟 Key Architecture & Highlights

- **Server-Side Pricing Engine (`services/pricing.js`)**: Single source of truth for subtotal, dynamic add-on recalculations, promo coupon deductions, packing/taxes, and delivery charges. Frontend calculations are strictly optimistic previews.
- **Strict Finite State Machine (`services/orderStatus.js`)**: Enforces deterministic order lifecycle transitions:
  `pending_payment` ➔ `placed` ➔ `preparing` ➔ `out_for_delivery` ➔ `delivered` (or `cancelled`).
- **4-Tier Role-Based Access Control (RBAC)**:
  1. `owner`: Full privileges, restaurant settings, staff manager invitations, applications review.
  2. `shop_manager`: Menu CRUD, food availability toggles, order assignments, driver onboarding reviews.
  3. `delivery_partner`: Mobile delivery portal (`/delivery`), GPS tracking stream, order acceptance, COD cash collection.
  4. `customer`: Public food catalogue, dietary filters (veg/non-veg), live cart quotations, real-time map tracking.
- **Real-Time GPS Fleet Tracking**:
  - Customer live order map powered by **OpenStreetMap** and **Leaflet** with moving rider telemetry.
  - Operations control map (`/admin/fleet`) monitoring all couriers en route.
  - Automated rider route simulator (`npm run simulate-rider`).
- **Payments Integration**:
  - Cash on Delivery (COD) with verification and driver cash-in-hand tracking.
  - Razorpay Online Payments with simulated test fallback mode when credentials are absent.
- **Theme Engine**: Complete high-contrast Light and Dark mode toggle with zero unreadable text or clipped badges.

---

## 👥 Seeded Test Credentials

All accounts are pre-configured in the database (Password for all: `Demo@1234`):

| Role | Email | Password | Access Portals |
|---|---|---|---|
| **Restaurant Owner** | `owner@demo.com` | `Demo@1234` | Full Admin (`/admin`), Settings, Staff Invites |
| **Shop Manager** | `manager@demo.com` | `Demo@1234` | Admin Operations (`/admin`), Orders, Menu, Driver Reviews |
| **Delivery Partner** | `rider@demo.com` | `Demo@1234` | Driver Mobile Portal (`/delivery`), GPS Tracker |
| **Pending Applicant** | `rider2@demo.com` | `Demo@1234` | Application Under Review (`/delivery/pending`) |
| **Customer** | `customer@demo.com` | `Demo@1234` | Web Shop (`/`, `/menu`, `/cart`, `/my-orders`) |
| **Super Admin** | `admin@barodagourmet.com` | `Admin@123` | Legacy Admin Fallback |

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- Node.js v18+
- MongoDB database (local or MongoDB Atlas connection string)

### 2. Environment Configuration
Ensure `.env` files exist based on the provided templates:

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/vite-project/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Seeding
To populate restaurant dishes, add-ons, coupons, banners, settings, and test logins:
```bash
cd backend
npm run seed
```

### 4. Running the Development Servers
In separate terminals:

**Backend (API Server on port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (Client on port 5173):**
```bash
cd frontend/vite-project
npm run dev
```

Visit the app at [http://localhost:5173](http://localhost:5173).

---

## 🛵 Live Rider Route Simulation

To test live GPS telemetry and real-time customer map tracking:
```bash
cd backend
npm run simulate-rider -- <orderId-or-orderNumber>
```
*The simulation authenticates as `rider@demo.com`, verifies the order assignment, accepts the dispatch, switches status to `out_for_delivery`, streams live GPS coordinates along the delivery route every 3 seconds, collects COD cash, and marks the delivery completed.*

---

## 📋 Comprehensive Acceptance Verification

- [x] **Dynamic Pricing**: Changing a dish price in admin reflects on menu, dish detail, and server cart quote.
- [x] **Food Availability**: Toggling an item out of stock disables adding to cart and shows high-contrast badge.
- [x] **Categories & Add-ons**: Add-on groups update total dish price in real-time.
- [x] **Store Operations**: Changing restaurant hours or temporarily closing blocks checkout with server validation.
- [x] **RBAC Protection**: Customers and delivery partners receive `403 Forbidden` on admin endpoints. Shop managers cannot modify settings or invite managers.
- [x] **Staff Onboarding**: Single-use cryptographic invite links onboard shop managers (`/onboard?token=...`).
- [x] **Partner Applications**: Public partner registration (`/partner/apply`) goes to review dashboard (`/admin/applications`).
- [x] **Live Polling**: Order tracking and My Orders poll automatically every 10 seconds.
- [x] **Interactive Leaflet Maps**: OpenStreetMap markers render customer, kitchen, and courier pins with route polylines.
- [x] **Clean Production Builds**: Frontend builds in under 1 second with Vite and zero lint/compilation errors.
