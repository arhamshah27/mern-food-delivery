# Implementation Guide — Online Food Ordering (MERN)

Single-restaurant food ordering website where **the admin panel controls everything the customer sees**.
This guide is the build spec. `CLAUDE.md` tells the agent how to work; this file tells it **what** to build and **how**.

---

## 0. Summary

| Item | Decision |
| --- | --- |
| Stack | MongoDB Atlas + Mongoose · Express (Node 20) · React 18 + Vite · Tailwind |
| Repo | Monorepo: `client/` and `server/`, root scripts via `concurrently` |
| Roles | `owner` (the brief's admin), `shop_manager`, `delivery_partner`, `customer` |
| Auth | bcryptjs (cost 10) + JWT in httpOnly cookie; permission middleware |
| Payments | Cash on Delivery + Razorpay **test mode** |
| Live status | React Query polling (10 s status, 5 s map) |
| Map tracking | react-leaflet + OpenStreetMap tiles, browser geolocation, OSRM route/ETA, Nominatim geocoding |
| Images | Multer (memory) → Cloudinary |
| Deploy | Client → Vercel, API → Render, DB → MongoDB Atlas M0 |
| Money | Stored as Number in **rupees**, always rounded with `round2()`; Razorpay gets `Math.round(total * 100)` paise |

**Golden rules**

1. Nothing customer-visible is hard-coded: restaurant name, logo, banners, categories, dishes, prices, add-ons, availability, tax %, delivery charge, free-delivery threshold, minimum order, opening hours, payment methods, delivery radius, coupons — all from MongoDB.
2. The server is the only source of truth for money. Client totals are previews.
3. Every `/api/admin/*` and `/api/delivery/*` route is protected by `auth` + `authorize(permission)`. Client-side guards are UX only.
4. Public GET endpoints send `Cache-Control: no-store`. Admin edits are visible on the customer's next load.

---

## 1. Repository layout

```
food-ordering/
├─ client/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  ├─ vercel.json
│  ├─ .env.example
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx                 # all routes
│     ├─ index.css
│     ├─ api/
│     │  ├─ client.js            # axios instance
│     │  ├─ queryClient.js
│     │  └─ hooks/               # one file per domain: usePublic, useAuth, useCart, useOrders, useAdmin*, useDelivery
│     ├─ context/AuthContext.jsx
│     ├─ store/cart.js           # zustand, persisted
│     ├─ routes/
│     │  ├─ ProtectedRoute.jsx
│     │  └─ RoleRoute.jsx
│     ├─ utils/
│     │  ├─ format.js            # money(), dateTime()
│     │  ├─ pricing.js           # preview only (mirrors server)
│     │  └─ loadRazorpay.js
│     ├─ components/
│     │  ├─ layout/ (Navbar, Footer, CustomerLayout, AdminLayout, DeliveryLayout)
│     │  ├─ ui/ (Button, Input, Select, Modal, Badge, Spinner, Toggle, EmptyState, ConfirmDialog, ImageUpload, DataTable)
│     │  ├─ menu/ (DishCard, VegBadge, CategoryChips, SearchBar, VegFilter, AddonPicker)
│     │  ├─ cart/ (CartLine, CartSummary, QuantityStepper)
│     │  ├─ orders/ (StatusTracker, OrderCard, OrderItemsTable)
│     │  └─ map/ (TrackingMap, PinPicker, LiveFleetMap, leafletIcons.js)
│     ├─ pages/
│     │  ├─ Home.jsx  Menu.jsx  DishDetails.jsx  Cart.jsx  Checkout.jsx
│     │  ├─ Orders.jsx  OrderDetail.jsx  Profile.jsx
│     │  ├─ Login.jsx  Register.jsx  NotFound.jsx  Forbidden.jsx
│     │  ├─ Onboard.jsx          # invite accept
│     │  └─ PartnerApply.jsx
│     ├─ admin/
│     │  ├─ AdminLogin.jsx  Dashboard.jsx
│     │  ├─ MenuItems.jsx  MenuItemForm.jsx
│     │  ├─ Categories.jsx  AddonGroups.jsx  Banners.jsx  Coupons.jsx
│     │  ├─ Orders.jsx  OrderDetail.jsx  LiveMap.jsx
│     │  ├─ Settings.jsx
│     │  ├─ Staff.jsx  Applications.jsx
│     └─ delivery/
│        ├─ DeliveryHome.jsx     # online toggle + assigned orders
│        ├─ DeliveryOrder.jsx    # map + actions + GPS sharing
│        └─ PendingReview.jsx
├─ server/
│  ├─ package.json
│  ├─ .env.example
│  ├─ jest.config.js
│  ├─ src/
│  │  ├─ server.js               # starts http server
│  │  ├─ app.js                  # express app (exported for tests)
│  │  ├─ config/
│  │  │  ├─ env.js               # zod-validated env
│  │  │  ├─ db.js
│  │  │  ├─ cloudinary.js
│  │  │  ├─ razorpay.js
│  │  │  └─ permissions.js
│  │  ├─ models/ (User, Category, MenuItem, AddonGroup, Banner, Settings, Order, Cart, Coupon)
│  │  ├─ middleware/ (auth.js, authorize.js, validate.js, upload.js, noStore.js, errorHandler.js, rateLimits.js)
│  │  ├─ validators/             # zod schemas per domain
│  │  ├─ services/
│  │  │  ├─ pricing.js
│  │  │  ├─ orderStatus.js       # state machine
│  │  │  ├─ geo.js               # haversine, OSRM, Nominatim
│  │  │  ├─ payments.js          # Razorpay helpers
│  │  │  ├─ settings.js          # getSettings() singleton
│  │  │  └─ tokens.js            # invite tokens
│  │  ├─ routes/
│  │  │  ├─ index.js
│  │  │  ├─ public.routes.js  auth.routes.js  me.routes.js  cart.routes.js
│  │  │  ├─ orders.routes.js  payments.routes.js  onboarding.routes.js
│  │  │  ├─ delivery.routes.js
│  │  │  └─ admin/ (index.js, dashboard, menuItems, categories, addonGroups, banners, coupons, orders, settings, staff, partners, tracking, upload)
│  │  ├─ controllers/            # mirror routes
│  │  ├─ utils/ (AppError.js, asyncHandler.js, round2.js, orderNumber.js)
│  │  └─ scripts/
│  │     ├─ seed.js
│  │     └─ simulateRider.js
│  └─ tests/ (auth.test.js, pricing.test.js, permissions.test.js, orders.test.js)
├─ docs/screenshots/
├─ .gitignore
├─ package.json
├─ README.md
├─ CLAUDE.md
└─ DECISIONS.md
```

---

## 2. Root setup

### 2.1 `.gitignore`

```
node_modules/
dist/
build/
.env
.env.*
!.env.example
coverage/
.DS_Store
*.log
.vercel
```

### 2.2 Root `package.json`

```json
{
  "name": "food-ordering",
  "private": true,
  "scripts": {
    "install:all": "npm install && npm --prefix server install && npm --prefix client install",
    "dev": "concurrently -n server,client -c blue,green \"npm --prefix server run dev\" \"npm --prefix client run dev\"",
    "seed": "npm --prefix server run seed",
    "test": "npm --prefix server test",
    "build": "npm --prefix client run build",
    "lint": "npm --prefix client run lint"
  },
  "devDependencies": { "concurrently": "^8.2.2" }
}
```

### 2.3 `server/.env.example`

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food_ordering
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
OSRM_URL=https://router.project-osrm.org
NOMINATIM_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=food-ordering-hackathon/1.0 (you@example.com)
SEED_OWNER_EMAIL=owner@demo.com
SEED_PASSWORD=Demo@1234
```

### 2.4 `client/.env.example`

```
VITE_API_URL=http://localhost:5000/api
```

---

## 3. Server

### 3.1 `server/package.json`

```json
{
  "name": "food-ordering-server",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/scripts/seed.js",
    "simulate-rider": "node src/scripts/simulateRider.js",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest --runInBand"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.4.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "razorpay": "^2.9.4",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "mongodb-memory-server": "^10.0.0",
    "nodemon": "^3.1.4",
    "supertest": "^7.0.0"
  }
}
```

Node 20 has global `fetch`; use it for OSRM/Nominatim (no axios on the server).

### 3.2 `src/config/env.js`

```js
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  OSRM_URL: z.string().default('https://router.project-osrm.org'),
  NOMINATIM_URL: z.string().default('https://nominatim.openstreetmap.org'),
  NOMINATIM_USER_AGENT: z.string().default('food-ordering-hackathon/1.0'),
  SEED_OWNER_EMAIL: z.string().default('owner@demo.com'),
  SEED_PASSWORD: z.string().default('Demo@1234'),
});

export const env = schema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
export const features = {
  cloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
  razorpay: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
};
```

If Cloudinary keys are missing, the upload endpoint returns 503 with a clear message, and the admin form still accepts a pasted image URL. If Razorpay keys are missing, `paymentMethods.online` is treated as false.

### 3.3 `src/config/db.js`

```js
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.MONGO_URI) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
```

### 3.4 `src/config/permissions.js`

```js
export const ROLES = ['owner', 'shop_manager', 'delivery_partner', 'customer'];
export const STAFF_ROLES = ['owner', 'shop_manager', 'delivery_partner'];

export const PERMISSIONS = {
  owner: ['*'],
  shop_manager: [
    'dashboard:read',
    'menu:write', 'menu:availability',
    'banners:write', 'coupons:write',
    'settings:read',
    'staff:read', 'partners:review', 'partners:suspend',
    'orders:read', 'orders:status', 'orders:assign', 'orders:refund',
    'tracking:read',
  ],
  delivery_partner: ['delivery:own'],
  customer: [],
};

export function can(role, permission) {
  const list = PERMISSIONS[role] || [];
  return list.includes('*') || list.includes(permission);
}

export function permissionsFor(role) {
  return PERMISSIONS[role] || [];
}
```

Owner-only permissions (never given to managers): `settings:write`, `staff:invite`, `staff:manage_managers`.

### 3.5 Utilities

`src/utils/AppError.js`
```js
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export const badRequest = (m, d) => new AppError(400, m, d);
export const unauthorized = (m = 'Please log in') => new AppError(401, m);
export const forbidden = (m = 'You do not have access to this') => new AppError(403, m);
export const notFound = (m = 'Not found') => new AppError(404, m);
export const conflict = (m, d) => new AppError(409, m, d);
```

`src/utils/asyncHandler.js`
```js
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

`src/utils/round2.js`
```js
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
```

`src/utils/orderNumber.js`
```js
export function makeOrderNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FO-${ymd}-${rand}`;
}
```

### 3.6 Models (Mongoose)

All schemas use `{ timestamps: true }`.

**User** (`models/User.js`)
```js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const pointSchema = new mongoose.Schema({ lat: Number, lng: Number, at: Date }, { _id: false });

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
});

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: ['licence', 'id_proof', 'photo'], required: true },
  url: { type: String, required: true },
}, { _id: false });

const deliveryProfileSchema = new mongoose.Schema({
  vehicleType: { type: String, enum: ['bike', 'scooter', 'cycle'] },
  vehicleNumber: String,
  licenceNumber: String,
  documents: [documentSchema],
  shift: { type: String, enum: ['morning', 'evening', 'full_day'], default: 'full_day' },
  isOnline: { type: Boolean, default: false },
  lastLocation: pointSchema,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ['owner', 'shop_manager', 'delivery_partner', 'customer'], default: 'customer', index: true },
  status: { type: String, enum: ['invited', 'pending', 'active', 'rejected', 'suspended'], default: 'active', index: true },
  inviteTokenHash: { type: String, select: false },
  inviteExpiresAt: Date,
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addresses: [addressSchema],
  deliveryProfile: deliveryProfileSchema,
}, { timestamps: true });

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};
userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash || '');
};
userSchema.methods.toSafeJSON = function () {
  const o = this.toObject();
  delete o.passwordHash; delete o.inviteTokenHash; delete o.__v;
  return o;
};

export default mongoose.model('User', userSchema);
```

**Category**
```js
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  imageUrl: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
```

**AddonGroup**
```js
const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
});
const addonGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },           // "Extra toppings", "Drinks"
  selectionType: { type: String, enum: ['single', 'multi'], default: 'multi' },
  isRequired: { type: Boolean, default: false },
  minSelect: { type: Number, default: 0 },
  maxSelect: { type: Number, default: 0 },           // 0 = no limit
  options: [optionSchema],
}, { timestamps: true });
```

Validation rule (in zod and pre-save): `single` ⇒ `maxSelect = 1`; `isRequired` ⇒ `minSelect >= 1`; `maxSelect` is 0 or ≥ `minSelect`.

**MenuItem**
```js
const menuItemSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  imageUrl: String,
  isVeg: { type: Boolean, required: true },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  addonGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AddonGroup' }],
  isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });
menuItemSchema.index({ name: 'text', description: 'text' });
```

**Banner**
```js
{ title: String (required), subtitle: String, imageUrl: String (required), linkUrl: String, sortOrder: Number (0), isActive: Boolean (true) }
```

**Settings** (single document; `services/settings.js` creates it if missing)
```js
const hoursSchema = new mongoose.Schema({
  day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
  open: { type: String, default: '10:00' },               // "HH:mm" local time
  close: { type: String, default: '22:00' },
  isClosed: { type: Boolean, default: false },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'My Restaurant' },
  tagline: String,
  logoUrl: String,
  phone: String,
  email: String,
  address: String,
  restaurantLocation: { lat: Number, lng: Number },
  deliveryRadiusKm: { type: Number, default: 8 },
  taxPercent: { type: Number, default: 5 },
  deliveryCharge: { type: Number, default: 40 },
  freeDeliveryAbove: { type: Number, default: 500 },     // 0 = never free
  minOrderValue: { type: Number, default: 149 },
  isTemporarilyClosed: { type: Boolean, default: false },
  paymentMethods: { cod: { type: Boolean, default: true }, online: { type: Boolean, default: true } },
  timezone: { type: String, default: 'Asia/Kolkata' },
  openingHours: { type: [hoursSchema], default: () => [0,1,2,3,4,5,6].map((day) => ({ day })) },
}, { timestamps: true });
```

**Coupon**
```js
{ code: { type: String, unique: true, uppercase: true, trim: true }, description: String,
  type: { enum: ['percent','flat'] }, value: Number, minOrder: { default: 0 }, maxDiscount: { default: 0 /* 0 = no cap */ },
  expiresAt: Date, usageLimit: { default: 0 /* 0 = unlimited */ }, usedCount: { default: 0 }, isActive: { default: true } }
```

**Cart**
```js
{ user: { ref: 'User', unique: true }, items: [{ menuItem: { ref: 'MenuItem' }, quantity: Number (1..20), addonOptionIds: [ObjectId] }] }
```

**Order**
```js
const orderAddonSchema = new mongoose.Schema({ groupName: String, name: String, price: Number }, { _id: false });
const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String, isVeg: Boolean, imageUrl: String,
  unitPrice: Number,          // dish price + add-ons, per unit
  quantity: Number,
  addons: [orderAddonSchema],
  lineTotal: Number,
}, { _id: false });

const STATUSES = ['pending_payment', 'placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  customerName: String, customerPhone: String,
  items: [orderItemSchema],
  address: { label: String, line1: String, line2: String, city: String, pincode: String, lat: Number, lng: Number },
  deliveryType: { type: String, enum: ['asap', 'scheduled'], default: 'asap' },
  scheduledFor: Date,
  notes: String,
  paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: String,
  refundId: String,
  cashCollected: { type: Boolean, default: false },
  subtotal: Number, discount: { type: Number, default: 0 }, tax: Number, deliveryCharge: Number, total: Number,
  couponCode: String,
  status: { type: String, enum: STATUSES, default: 'placed', index: true },
  statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, byRole: String, note: String, _id: false }],
  delivery: {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assignedAt: Date, acceptedAt: Date,
  },
  tracking: {
    lastLocation: { lat: Number, lng: Number, at: Date },
    path: [{ lat: Number, lng: Number, at: Date, _id: false }],
    distanceKm: Number,
    etaMinutes: Number,
  },
  expiresAt: Date,  // for pending_payment orders
}, { timestamps: true });
orderSchema.index({ createdAt: -1 });
```

### 3.7 Middleware

`middleware/auth.js`
```js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { unauthorized, forbidden } from '../utils/AppError.js';

export const COOKIE = 'fo_token';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function cookieOptions() {
  const prod = env.NODE_ENV === 'production';
  return { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax', maxAge: 7 * 24 * 3600 * 1000, path: '/' };
}

// Loads user if a valid cookie exists; never throws.
export async function optionalAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return next();
  try {
    const { sub } = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(sub);
  } catch { /* ignore */ }
  next();
}

// Requires a logged-in user whose status allows app use.
export async function auth(req, _res, next) {
  try {
    const token = req.cookies?.[COOKIE];
    if (!token) throw unauthorized();
    const { sub } = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(sub);          // re-read role + status every request
    if (!user) throw unauthorized();
    if (user.status === 'suspended') throw forbidden('Your account is suspended');
    req.user = user;
    next();
  } catch (e) {
    next(e.status ? e : unauthorized());
  }
}

export function requireActive(req, _res, next) {
  if (req.user.status !== 'active') return next(forbidden('Your account is not active yet'));
  next();
}
```

`middleware/authorize.js`
```js
import { can } from '../config/permissions.js';
import { forbidden } from '../utils/AppError.js';

export const authorize = (...perms) => (req, _res, next) => {
  if (!req.user) return next(forbidden());
  if (req.user.status !== 'active') return next(forbidden('Your account is not active'));
  const ok = perms.some((p) => can(req.user.role, p));
  return ok ? next() : next(forbidden());
};

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(forbidden());
```

`middleware/validate.js`
```js
import { badRequest } from '../utils/AppError.js';
export const validate = (schema, where = 'body') => (req, _res, next) => {
  const r = schema.safeParse(req[where]);
  if (!r.success) return next(badRequest('Validation failed', r.error.flatten()));
  req[where] = r.data;
  next();
};
```
Note: `req.query` is a getter in Express 4 — for query validation assign to `req.validatedQuery` instead of `req.query`.

`middleware/upload.js`
```js
import multer from 'multer';
import { badRequest } from '../utils/AppError.js';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(badRequest('Only JPG, PNG or WEBP up to 2 MB')),
});
```

`middleware/noStore.js`
```js
export const noStore = (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); };
```

`middleware/errorHandler.js`
```js
export function notFoundHandler(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'Already exists', details: err.keyValue });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large (max 2 MB)' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Something went wrong' : err.message, details: err.details });
}
```

`middleware/rateLimits.js`
```js
import rateLimit from 'express-rate-limit';
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });
export const locationLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 });
```

### 3.8 `app.js` and `server.js`

```js
// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { razorpayWebhook } from './controllers/payments.controller.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_URL.split(','), credentials: true }));

// Webhook needs the raw body for signature verification — mount BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
```

```js
// server.js
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { startOrderExpiryJob } from './services/payments.js';

await connectDB();
startOrderExpiryJob();
app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));
```

### 3.9 Services

**`services/settings.js`**
```js
import Settings from '../models/Settings.js';
export async function getSettings() {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
}
```

**Opening hours** (`services/settings.js`, same file)
```js
// Returns { isOpen, reason } for a given Date (defaults to now) in the restaurant timezone.
export function isOpenAt(settings, date = new Date()) {
  if (settings.isTemporarilyClosed) return { isOpen: false, reason: 'Temporarily closed' };
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: settings.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date);
  const wd = parts.find((p) => p.type === 'weekday').value;            // "Mon"
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(wd);
  const hhmm = `${parts.find((p) => p.type === 'hour').value}:${parts.find((p) => p.type === 'minute').value}`;
  const h = settings.openingHours.find((x) => x.day === day);
  if (!h || h.isClosed) return { isOpen: false, reason: 'Closed today' };
  const open = h.open <= hhmm && hhmm < h.close;   // assumes no past-midnight closing; document in DECISIONS.md
  return { isOpen: open, reason: open ? null : `Open ${h.open}–${h.close}` };
}
```

Delivery slots for scheduled orders: every 30 minutes from max(now + 45 min, today's open) to today's close − 30 min, today only. Endpoint `GET /api/public/slots` returns them; checkout shows them; server re-validates with `isOpenAt(settings, scheduledFor)`.

**`services/pricing.js`** — the single source of truth
```js
import MenuItem from '../models/MenuItem.js';
import Coupon from '../models/Coupon.js';
import { round2 } from '../utils/round2.js';
import { conflict, badRequest } from '../utils/AppError.js';

/**
 * @param {Array<{menuItemId:string, quantity:number, addonOptionIds:string[]}>} cartItems
 * @param {object} settings  Settings document
 * @param {string|null} couponCode
 * @param {{strict:boolean}} opts strict=true throws on any problem (checkout); false collects warnings (cart preview)
 */
export async function priceCart(cartItems, settings, couponCode = null, { strict = false } = {}) {
  const ids = cartItems.map((i) => i.menuItemId);
  const dishes = await MenuItem.find({ _id: { $in: ids } }).populate('addonGroups');
  const byId = new Map(dishes.map((d) => [d._id.toString(), d]));
  const lines = []; const warnings = [];

  for (const ci of cartItems) {
    const dish = byId.get(String(ci.menuItemId));
    if (!dish || dish.isDeleted) { warnings.push({ menuItemId: ci.menuItemId, message: 'Dish no longer exists' }); continue; }
    if (!dish.isAvailable) { warnings.push({ menuItemId: ci.menuItemId, message: `${dish.name} is out of stock` }); continue; }

    const chosen = new Set((ci.addonOptionIds || []).map(String));
    const addons = [];
    for (const g of dish.addonGroups) {
      const picked = g.options.filter((o) => chosen.has(o._id.toString()));
      const unavailable = picked.find((o) => !o.isAvailable);
      if (unavailable) warnings.push({ menuItemId: ci.menuItemId, message: `${unavailable.name} is unavailable` });
      const valid = picked.filter((o) => o.isAvailable);
      if (g.isRequired && valid.length < Math.max(1, g.minSelect)) warnings.push({ menuItemId: ci.menuItemId, message: `Choose ${g.name}` });
      if (g.maxSelect > 0 && valid.length > g.maxSelect) warnings.push({ menuItemId: ci.menuItemId, message: `Too many choices for ${g.name}` });
      valid.forEach((o) => addons.push({ groupName: g.name, name: o.name, price: o.price, optionId: o._id.toString() }));
    }
    const qty = Math.min(Math.max(parseInt(ci.quantity, 10) || 1, 1), 20);
    const unitPrice = round2(dish.price + addons.reduce((s, a) => s + a.price, 0));
    lines.push({
      menuItem: dish._id, name: dish.name, isVeg: dish.isVeg, imageUrl: dish.imageUrl,
      unitPrice, quantity: qty, addons: addons.map(({ optionId, ...a }) => a), lineTotal: round2(unitPrice * qty),
      addonOptionIds: addons.map((a) => a.optionId),
    });
  }

  if (strict && warnings.length) throw conflict('Some items in your cart need attention', warnings);

  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  let discount = 0; let coupon = null; let couponError = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
    couponError = validateCoupon(coupon, subtotal);
    if (couponError) { if (strict) throw badRequest(couponError); coupon = null; }
    else discount = computeDiscount(coupon, subtotal);
  }
  const afterDiscount = round2(subtotal - discount);
  const tax = round2(afterDiscount * (settings.taxPercent / 100));
  const freeDelivery = settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove;
  const deliveryCharge = lines.length === 0 || freeDelivery ? 0 : round2(settings.deliveryCharge);
  const total = round2(afterDiscount + tax + deliveryCharge);
  const belowMinimum = subtotal < settings.minOrderValue;
  if (strict && belowMinimum) throw badRequest(`Minimum order is ₹${settings.minOrderValue}`);

  return { lines, subtotal, discount, tax, deliveryCharge, total, couponCode: coupon?.code || null, couponError,
           warnings, belowMinimum, minOrderValue: settings.minOrderValue, taxPercent: settings.taxPercent,
           freeDeliveryAbove: settings.freeDeliveryAbove };
}

export function validateCoupon(c, subtotal, now = new Date()) {
  if (!c || !c.isActive) return 'Invalid coupon';
  if (c.expiresAt && c.expiresAt < now) return 'Coupon expired';
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return 'Coupon usage limit reached';
  if (subtotal < c.minOrder) return `Add ₹${round2(c.minOrder - subtotal)} more to use this coupon`;
  return null;
}

export function computeDiscount(c, subtotal) {
  let d = c.type === 'percent' ? subtotal * (c.value / 100) : c.value;
  if (c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
  return round2(Math.min(d, subtotal));
}
```

**`services/orderStatus.js`** — state machine
```js
import { can } from '../config/permissions.js';

// from -> allowed next statuses
export const TRANSITIONS = {
  pending_payment: ['placed', 'cancelled'],
  placed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function canTransition(order, next, user) {
  if (!TRANSITIONS[order.status]?.includes(next)) return `Cannot move from ${order.status} to ${next}`;
  const isPartner = user.role === 'delivery_partner';
  if (isPartner) {
    if (String(order.delivery?.partner) !== String(user._id)) return 'This order is not assigned to you';
    if (!['out_for_delivery', 'delivered'].includes(next)) return 'Delivery partners can only start or complete delivery';
    if (next === 'out_for_delivery' && !order.delivery?.acceptedAt) return 'Accept the order first';
    return null;
  }
  if (!can(user.role, 'orders:status')) return 'Not allowed';
  if (next === 'out_for_delivery' && !order.delivery?.partner) return 'Assign a delivery partner first';
  return null;
}

export function pushStatus(order, status, user, note) {
  order.status = status;
  order.statusHistory.push({ status, at: new Date(), by: user?._id, byRole: user?.role || 'system', note });
}
```

**`services/geo.js`**
```js
import { env } from '../config/env.js';

export function haversineKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Returns { distanceKm, etaMinutes, geometry:[[lat,lng],...] | null }. Never throws.
export async function routeBetween(from, to) {
  try {
    const url = `${env.OSRM_URL}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=simplified&geometries=geojson`;
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(url, { signal: ctrl.signal }); clearTimeout(t);
    const j = await r.json();
    const route = j.routes?.[0];
    if (!route) throw new Error('no route');
    return {
      distanceKm: Math.round(route.distance / 100) / 10,
      etaMinutes: Math.max(1, Math.round(route.duration / 60)),
      geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  } catch {
    const km = haversineKm(from, to);
    return { distanceKm: Math.round(km * 10) / 10, etaMinutes: Math.max(1, Math.round((km / 20) * 60)), geometry: null };
  }
}

const geoCache = new Map();
export async function searchAddress(q) {
  const key = q.trim().toLowerCase();
  if (geoCache.has(key)) return geoCache.get(key);
  const url = `${env.NOMINATIM_URL}/search?format=json&limit=5&countrycodes=in&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { 'User-Agent': env.NOMINATIM_USER_AGENT } });
  const j = await r.json();
  const out = j.map((x) => ({ label: x.display_name, lat: Number(x.lat), lng: Number(x.lon) }));
  geoCache.set(key, out);
  return out;
}
```

Cache the OSRM result on the order: only recompute route when the partner has moved > 150 m since the last computation, or every 60 s.

**`services/tokens.js`**
```js
import crypto from 'crypto';
export const newToken = () => crypto.randomBytes(32).toString('hex');
export const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');
```

**`services/payments.js`**
```js
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { env, features } from '../config/env.js';
import { pushStatus } from './orderStatus.js';

export const razorpay = features.razorpay ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET }) : null;

export function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  const expected = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqual(expected, signature);
}
export function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return safeEqual(expected, signature || '');
}
function safeEqual(a, b) {
  const A = Buffer.from(a); const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

// Idempotent: safe to call from both /verify and the webhook.
export async function markPaid(order, paymentId) {
  if (order.paymentStatus === 'paid') return order;
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = paymentId;
  order.expiresAt = undefined;
  if (order.status === 'pending_payment') pushStatus(order, 'placed', null, 'Payment received');
  await order.save();
  return order;
}

export async function refundIfPaid(order) {
  if (order.paymentMethod !== 'online' || order.paymentStatus !== 'paid' || !razorpay) return;
  const refund = await razorpay.payments.refund(order.razorpayPaymentId, { amount: Math.round(order.total * 100) });
  order.refundId = refund.id;
  order.paymentStatus = 'refunded';
}

export function startOrderExpiryJob() {
  setInterval(async () => {
    const stale = await Order.find({ status: 'pending_payment', expiresAt: { $lt: new Date() } });
    for (const o of stale) { o.paymentStatus = 'failed'; pushStatus(o, 'cancelled', null, 'Payment not completed in 15 minutes'); await o.save(); }
  }, 60 * 1000).unref();
}
```

### 3.10 Validators (zod, `src/validators/*.js`)

Write a zod schema for every POST/PUT/PATCH body. Key ones:

```js
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const money = z.coerce.number().min(0).max(100000);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number'),
  password: z.string().min(8).max(72).regex(/[A-Za-z]/).regex(/\d/, 'Password needs a number'),
});
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

export const addressSchema = z.object({
  label: z.string().trim().max(20).default('Home'),
  line1: z.string().trim().min(3).max(120), line2: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().min(2).max(60), pincode: z.string().regex(/^\d{6}$/),
  lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180),
  isDefault: z.boolean().optional().default(false),
});

export const cartItemSchema = z.object({ menuItemId: objectId, quantity: z.coerce.number().int().min(1).max(20), addonOptionIds: z.array(objectId).default([]) });
export const quoteSchema = z.object({ items: z.array(cartItemSchema).max(50), couponCode: z.string().trim().optional().nullable() });

export const checkoutSchema = quoteSchema.extend({
  address: addressSchema,                  // full address object (saved or new)
  saveAddress: z.boolean().optional().default(false),
  deliveryType: z.enum(['asap', 'scheduled']),
  scheduledFor: z.coerce.date().optional(),
  paymentMethod: z.enum(['cod', 'online']),
  notes: z.string().trim().max(200).optional(),
}).refine((d) => d.deliveryType === 'asap' || d.scheduledFor, { message: 'Pick a delivery time', path: ['scheduledFor'] });

export const menuItemSchema = z.object({
  name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).default(''),
  category: objectId, price: money, imageUrl: z.string().url().optional().or(z.literal('')),
  isVeg: z.boolean(), isAvailable: z.boolean().default(true), isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0), addonGroups: z.array(objectId).default([]),
});

export const settingsSchema = z.object({ /* every Settings field; taxPercent 0..50, deliveryCharge 0..1000, HH:mm regex for hours, deliveryRadiusKm 1..50 */ });
export const statusSchema = z.object({ status: z.enum(['preparing', 'out_for_delivery', 'delivered', 'cancelled']), note: z.string().max(200).optional() });
export const locationSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
export const inviteSchema = z.object({ name: z.string().trim().min(2), email: z.string().email(), phone: z.string().regex(/^[6-9]\d{9}$/) });
export const acceptInviteSchema = z.object({ token: z.string().length(64), password: registerSchema.shape.password, phone: z.string().optional() });
export const partnerApplySchema = registerSchema.extend({
  vehicleType: z.enum(['bike', 'scooter', 'cycle']), vehicleNumber: z.string().trim().max(15).optional(),
  licenceNumber: z.string().trim().max(20).optional(), shift: z.enum(['morning', 'evening', 'full_day']),
});  // documents arrive as multipart files: licence, id_proof, photo
export const rejectSchema = z.object({ reason: z.string().trim().min(3).max(200) });
```

Bicycle partners do not need vehicle/licence numbers; for `bike`/`scooter` both are required (`superRefine`).
### 3.11 Routes and controller behaviour

`routes/index.js`
```js
import { Router } from 'express';
import { noStore } from '../middleware/noStore.js';
import publicRoutes from './public.routes.js';
import authRoutes from './auth.routes.js';
import meRoutes from './me.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './orders.routes.js';
import paymentRoutes from './payments.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import deliveryRoutes from './delivery.routes.js';
import adminRoutes from './admin/index.js';

const r = Router();
r.use(noStore);                     // every API response is uncached
r.use('/public', publicRoutes);
r.use('/auth', authRoutes);
r.use('/me', meRoutes);
r.use('/cart', cartRoutes);
r.use('/orders', orderRoutes);
r.use('/payments', paymentRoutes);
r.use('/onboard', onboardingRoutes);
r.use('/delivery', deliveryRoutes);
r.use('/admin', adminRoutes);
export default r;
```

All responses are JSON. Lists return `{ items, total, page, pageSize }` where paginated. Errors return `{ message, details? }`.

#### Public — `/api/public` (no auth)

| Method & path | Behaviour |
| --- | --- |
| `GET /home` | `{ settings: publicSettings, isOpen, openReason, banners (isActive, sort), categories (isActive, sort), popular (isPopular && !isDeleted, limit 8, populated addonGroups ids only) }` |
| `GET /settings` | Public subset: restaurantName, tagline, logoUrl, phone, address, restaurantLocation, deliveryRadiusKm, taxPercent, deliveryCharge, freeDeliveryAbove, minOrderValue, paymentMethods (online forced false when Razorpay keys missing), openingHours, isOpen, openReason, razorpayKeyId |
| `GET /menu?q=&veg=veg\|nonveg\|all&category=` | Active categories, each with `items` (not deleted; **include** unavailable items so the UI shows "Out of stock"). Search: case-insensitive regex on name/description (escape the input) — simpler than text index for partial words. Categories with no matching items are omitted. |
| `GET /menu/:id` | Dish + populated `addonGroups` + category name. 404 if deleted. |
| `GET /slots` | Today's scheduled delivery slots (see 3.9). |
| `GET /geo/search?q=` | Nominatim proxy, min 3 chars, cached. |
| `POST /geo/check` | `{lat,lng}` → `{ distanceKm, deliverable }` against settings radius. |

#### Auth — `/api/auth`

| Method & path | Behaviour |
| --- | --- |
| `POST /register` | authLimiter + validate. Creates `customer`, status `active`. Sets cookie. Returns `{ user }`. 409 if email exists. |
| `POST /login` | authLimiter. For **customers only** (staff with role ≠ customer get 403 "Use the staff login"). |
| `POST /staff-login` | Same, but only roles owner/shop_manager/delivery_partner. Status rules: `active` → cookie + user; `pending` partner → cookie + user (client shows "under review" screen); `invited` → 403 "Accept your invite first"; `rejected` → 403 with `rejectionReason`; `suspended` → 403. |
| `POST /logout` | Clears cookie. |
| `GET /me` | optionalAuth. `{ user: safeUser | null, permissions: [] }`. |

#### Me — `/api/me` (auth)

`PUT /` (name, phone) · `GET /addresses` · `POST /addresses` · `PUT /addresses/:id` · `DELETE /addresses/:id` · `PATCH /addresses/:id/default`. When one address becomes default, unset the others.

#### Cart — `/api/cart`

| Method & path | Behaviour |
| --- | --- |
| `POST /quote` | Public. Body `{items, couponCode}` → `priceCart(..., {strict:false})`. Client calls this whenever the cart changes (debounced 300 ms). This is how live tax/delivery from Settings reach the cart. |
| `GET /` | auth. Saved cart items. |
| `PUT /` | auth. Replace saved cart (`items`). Called after login (merge guest cart: same dish + same add-on set → add quantities) and debounced on change. |

#### Orders — `/api/orders` (auth, customer)

`POST /` — place a **COD** order:
1. `settings = getSettings()`; if `!paymentMethods.cod` → 400.
2. Opening check: ASAP → `isOpenAt(settings)`; scheduled → `scheduledFor` must be in today's slots and `isOpenAt(settings, scheduledFor)`. Else 409.
3. Radius: `haversineKm(settings.restaurantLocation, address) <= deliveryRadiusKm` else 409 "We don't deliver to this address yet".
4. `priced = priceCart(items, settings, couponCode, {strict:true})`.
5. Create order: snapshot lines/address/customerName/phone, `paymentMethod:'cod'`, `paymentStatus:'pending'`, `status:'placed'`, history entry. If coupon used → `Coupon.updateOne({_id}, {$inc:{usedCount:1}})`.
6. If `saveAddress` → push to user's addresses. Clear saved cart. Return `{ order }` 201.

`GET /my` — user's orders, newest first, paginated (10). Exclude `pending_payment` older than expiry? Show them as "Payment pending" with a Retry button.

`GET /:id` — owner of the order only (else 404). Includes `statusHistory`, `delivery.partner` populated with `name, phone` (phone only while `out_for_delivery`).

`GET /:id/tracking` — owner only. If status is not `out_for_delivery` → `410 { status }`. Else `{ status, restaurant: settings.restaurantLocation, destination: {lat,lng}, partner: {name, phone, lastLocation}, path, distanceKm, etaMinutes, route: geometry }` (geometry cached on the order in memory or recomputed via `routeBetween` with the throttling rule).

`POST /:id/cancel` — customer may cancel only while `placed`. Refund if paid. (Optional but cheap.)

#### Payments — `/api/payments`

| Method & path | Behaviour |
| --- | --- |
| `POST /create-order` | auth. Same validation as COD steps 1–4 but requires `paymentMethods.online` and Razorpay configured. Create Order with `status:'pending_payment'`, `paymentMethod:'online'`, `expiresAt = now + 15 min`. Then `razorpay.orders.create({ amount: Math.round(total*100), currency:'INR', receipt: orderNumber, notes:{ orderId } })`; save `razorpayOrderId`. Return `{ orderId, razorpayOrderId, amount, currency, keyId, prefill:{name,email,contact} }`. |
| `POST /verify` | auth. Body `{ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }`. Load order (must belong to user and match razorpayOrderId). Verify signature → `markPaid`. Increment coupon usage, clear cart. Return `{ order }`. Bad signature → 400 and `paymentStatus:'failed'`. |
| `POST /failed` | auth. `{ orderId, reason }` → `paymentStatus:'failed'` (order stays `pending_payment` until expiry so the user can retry). |
| `POST /retry/:orderId` | auth. If still `pending_payment` and not expired, create a new Razorpay order for the same amount and return checkout params. |
| `POST /webhook` | Raw body, mounted in `app.js`. Verify `x-razorpay-signature`. Handle `payment.captured` (find by `payload.payment.entity.order_id` → `markPaid`), `payment.failed` (set failed), `refund.processed` (set refunded). Always 200 after verification so Razorpay doesn't retry forever. |

#### Onboarding — `/api/onboard` (public)

| Method & path | Behaviour |
| --- | --- |
| `GET /invite/:token` | Hash token, find `status:'invited'`, not expired → `{ name, email, role }`; else 410. |
| `POST /accept` | Validate; find by token hash; set password, phone; `status:'active'`; clear token fields; set cookie; return user. |
| `POST /partner/apply` | `multipart/form-data`: fields per `partnerApplySchema` + files `licence`, `id_proof`, `photo` (`uploadImage.fields(...)`). Upload files to Cloudinary folder `partners/`. Create user `role:'delivery_partner'`, `status:'pending'`, `deliveryProfile`. Set cookie. If email exists with `rejected` partner → allow re-apply (reset to pending). |

#### Delivery — `/api/delivery` (auth + `authorize('delivery:own')`)

| Method & path | Behaviour |
| --- | --- |
| `GET /me` | Profile + `isOnline` + today stats `{ delivered, cashToCollect, cashCollected }`. |
| `PATCH /online` | `{ isOnline }`. Going offline with an active order → 409. |
| `GET /orders` | Orders where `delivery.partner = me` and status in `preparing, out_for_delivery`; plus `?history=1` for today's delivered. Includes customer name, phone, address, items count, total, paymentMethod, paymentStatus. |
| `PATCH /orders/:id/accept` | Must be assigned to me and `preparing`; sets `delivery.acceptedAt`. |
| `PATCH /orders/:id/status` | `{ status: 'out_for_delivery' \| 'delivered' }` → `canTransition` → `pushStatus`. On `delivered` for COD, require `cashCollected` true in body (or call cash endpoint first) then `paymentStatus:'paid'`. Clear `tracking` path? Keep it for history. |
| `PATCH /orders/:id/cash-collected` | COD only; sets `cashCollected:true`. |
| `PATCH /orders/:id/location` | locationLimiter + validate. Only when status `out_for_delivery` and assigned to me. Set `tracking.lastLocation`, push to `path` with `$push: { $each:[pt], $slice:-50 }`, update `deliveryProfile.lastLocation`. Recompute distance/ETA per throttle rule. Return `{ ok, distanceKm, etaMinutes }`. |

#### Admin — `/api/admin` (all routes: `auth`, then per-route `authorize`)

```js
// routes/admin/index.js
const r = Router();
r.use(auth);
r.use((req, _res, next) => req.user.role === 'customer' ? next(forbidden()) : next());
r.use('/dashboard', authorize('dashboard:read'), dashboard);
r.use('/menu-items', menuItems);         // GET: orders:read OR menu:write; writes: menu:write; availability: menu:availability
r.use('/categories', categories);        // menu:write for writes
r.use('/addon-groups', addonGroups);     // menu:write
r.use('/banners', authorize('banners:write'), banners);
r.use('/coupons', authorize('coupons:write'), coupons);
r.use('/orders', orders);                // orders:read / orders:status / orders:assign / orders:refund
r.use('/settings', settings);            // GET settings:read, PUT settings:write (owner)
r.use('/staff', staff);                  // see below
r.use('/partners', partners);            // partners:review / partners:suspend
r.use('/tracking', authorize('tracking:read'), tracking);
r.use('/upload', authorize('menu:write', 'banners:write', 'settings:write'), upload);
```

| Area | Endpoints and rules |
| --- | --- |
| Dashboard | `GET /dashboard?range=today\|7d\|30d` → `{ ordersCount, revenue (sum total where status != cancelled and != pending_payment), avgOrderValue, byStatus:{...}, topDishes:[{name, quantity, revenue}] (unwind items, group by name, sort quantity desc, limit 5), revenueByDay:[{date, revenue, orders}] (for 7d/30d), activeDeliveries, pendingApplications }`. Use the restaurant timezone for "today" (`$dateToString` with `timezone`). |
| Menu items | `GET /?q=&category=&availability=&page=` (includes unavailable, excludes deleted) · `GET /:id` · `POST /` · `PUT /:id` · `DELETE /:id` (soft: `isDeleted:true`) · `PATCH /:id/availability {isAvailable}` · `PATCH /:id/popular {isPopular}` |
| Categories | `GET /` · `POST /` · `PUT /:id` · `DELETE /:id` → 409 if non-deleted items exist ("Move or delete its N dishes first") · `PATCH /reorder {ids:[...]}` sets sortOrder by index |
| Add-on groups | `GET /` · `POST /` · `PUT /:id` (replace options array; keep existing option `_id`s when sent so carts stay valid) · `DELETE /:id` → also `$pull` from menuItems.addonGroups · `PATCH /:id/options/:optionId/availability` |
| Banners | CRUD + `PATCH /reorder` + `PATCH /:id/active` |
| Coupons | CRUD; code uppercase unique; show usedCount |
| Orders | `GET /?status=&date=&q=&page=` (q matches orderNumber/customerName/phone) · `GET /:id` (populated user, partner) · `PATCH /:id/status {status, note}` → `canTransition`; on `cancelled` → `refundIfPaid` · `PATCH /:id/assign {partnerId}` (partner must be `delivery_partner`, `active`, `isOnline`; order must be `placed` or `preparing`; resets `acceptedAt`) · `POST /:id/refund` · `GET /partners/available` (active + online partners with count of current orders and lastLocation) |
| Settings | `GET /` (settings:read) · `PUT /` (settings:write, owner only) |
| Staff | `GET /` (staff:read) list staff with filters role/status · `POST /invite` (**owner only**: role shop_manager; creates user status invited, token 48 h; returns `{ inviteUrl: CLIENT_URL + '/onboard?token=' + token }`) · `POST /:id/resend-invite` (owner) · `PATCH /:id/status {status:'active'\|'suspended'}` — owner can change anyone except self; shop_manager may only change delivery_partners (permission `partners:suspend`). Suspending a partner sets `isOnline:false` and unassigns their `preparing` orders (`delivery.partner = null`) — orders already `out_for_delivery` stay and are flagged for the manager. Never allow suspending/demoting the last active owner. |
| Partners | `GET /?status=pending\|active\|rejected\|suspended` · `GET /:id` (documents) · `PATCH /:id/approve` → status active, reviewedBy/At · `PATCH /:id/reject {reason}` → status rejected |
| Tracking | `GET /live` → all `out_for_delivery` orders: `{ orderId, orderNumber, customerName, destination, partner:{name, phone, lastLocation}, etaMinutes }` + restaurant location |
| Upload | `POST /` single `image` field → Cloudinary `upload_stream` to folder `food-ordering/<env>` → `{ url }`. 503 when Cloudinary not configured. |

Cloudinary upload helper:
```js
import { v2 as cloudinary } from 'cloudinary';
export function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder, resource_type: 'image', transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] },
      (err, res) => (err ? reject(err) : resolve(res.secure_url))).end(buffer);
  });
}
```

### 3.12 Seed script (`src/scripts/seed.js`)

Idempotent: `--reset` flag drops collections first; without it, upserts by unique keys. Creates:

| Data | Details |
| --- | --- |
| Settings | name "Spice Route Kitchen", tagline, phone, address in Bengaluru (Indiranagar), `restaurantLocation {lat:12.9719, lng:77.6412}`, radius 8 km, tax 5 %, delivery ₹40, free above ₹499, min order ₹149, hours 11:00–23:00 all days, both payment methods on |
| Users (password `SEED_PASSWORD`, default `Demo@1234`) | owner@demo.com (owner), manager@demo.com (shop_manager), rider@demo.com (delivery_partner, active, bike, online, lastLocation at restaurant), rider2@demo.com (delivery_partner, **pending**, with placeholder document URLs), customer@demo.com (customer, one default address ~3 km away with lat/lng) |
| Categories (5) | Starters, Main Course, Biryani, Pizzas & Burgers, Desserts & Drinks |
| Add-on groups (4) | "Extra toppings" (multi, max 3: Extra cheese ₹40, Jalapeños ₹25, Olives ₹30) · "Choose a drink" (single, optional: Coke ₹50, Lime soda ₹45, Masala chaas ₹40) · "Spice level" (single, required: Mild ₹0, Medium ₹0, Hot ₹0) · "Add a side" (multi: Raita ₹30, Salan ₹30, Fries ₹70) |
| Dishes (~20) | Mix veg/non-veg, 6 marked popular, 1 marked unavailable (to demo "Out of stock"), each with a free Unsplash image URL (`https://images.unsplash.com/photo-...?w=800`), add-on groups attached sensibly |
| Banners (3) | "Free delivery above ₹499", "Weekend Biryani Fest", "Try our new Pizzas" |
| Coupons (2) | WELCOME50 (flat ₹50, min ₹299), FEAST20 (20 %, max ₹120, min ₹499) |
| Orders (~12) | Spread across the last 7 days with mixed statuses and items, so the dashboard has data on first run; one `out_for_delivery` assigned to rider@demo.com with a tracking path |

Print a table of logins at the end.

### 3.13 Rider simulator (`src/scripts/simulateRider.js`)

`npm run simulate-rider -- <orderId>`: logs in as rider@demo.com via `/api/auth/staff-login` (keep cookie from `set-cookie`), ensures the order is accepted and `out_for_delivery`, fetches the route from restaurant to destination via OSRM (fallback: straight line in 20 steps), then `PATCH /api/delivery/orders/:id/location` every 3 s along the points, and finally marks it delivered (with cash collected for COD). Use `API_URL` env (default `http://localhost:5000/api`).

### 3.14 Server tests (`server/tests`)

Use `mongodb-memory-server`; `beforeAll` connect, seed minimal data. Minimum set:

1. `pricing.test.js` — subtotal/add-ons/tax/delivery/free-delivery/coupon cap/min order/out-of-stock warnings.
2. `permissions.test.js` — customer → 403 on `/api/admin/menu-items`; shop_manager → 403 on `PUT /api/admin/settings` and `POST /api/admin/staff/invite`; delivery_partner → 403 on admin; owner → 200.
3. `auth.test.js` — register hashes password (stored value starts with `$2`), login, `/me`, pending partner can't access `/api/delivery/orders`.
4. `orders.test.js` — COD order recomputes price even if client sends wrong totals; invalid transition rejected; partner can't update someone else's order.

---

## 4. Client

### 4.1 `client/package.json`

```json
{
  "name": "food-ordering-client",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.jsx"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.51.0",
    "axios": "^1.7.3",
    "clsx": "^2.1.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.424.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.52.2",
    "@hookform/resolvers": "^3.9.0",
    "react-hot-toast": "^2.4.1",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.26.0",
    "recharts": "^2.12.7",
    "zod": "^3.23.8",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.9",
    "vite": "^5.4.0"
  }
}
```

`vite.config.js`: React plugin, `server.port 5173`, proxy `/api` → `http://localhost:5000` (then `VITE_API_URL` can be `/api` in dev, avoiding cookie issues).

`vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Import `leaflet/dist/leaflet.css` in `main.jsx`. Fix default marker icons in `components/map/leafletIcons.js` (Vite breaks Leaflet's default icon paths): create `L.divIcon`s for restaurant (🍽 style circle), home, and rider (scooter) using inline SVG/HTML, so no image assets are needed.

### 4.2 Design system

| Token | Value |
| --- | --- |
| Primary | Tailwind `orange-600` (#ea580c), hover `orange-700` |
| Veg badge | green-600 square with dot; non-veg red-600 square with triangle (Indian convention) |
| Font | Inter via Google Fonts |
| Radius | `rounded-xl` cards, `rounded-lg` inputs |
| Admin | Neutral `slate` sidebar layout, white content, sticky top bar with role badge |
| Delivery app | Mobile-first, big buttons (min 48 px height), bottom action bar |

Every page handles loading (skeletons), empty, and error states. Toasts for every mutation result.

### 4.3 API layer

`api/client.js`
```js
import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });
api.interceptors.response.use((r) => r, (err) => {
  const message = err.response?.data?.message || 'Network error';
  return Promise.reject(Object.assign(err, { message, details: err.response?.data?.details, status: err.response?.status }));
});
```

`api/queryClient.js`
```js
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, refetchOnWindowFocus: true, retry: 1 } },
});
```

Query keys (keep consistent so admin mutations can invalidate them):
`['home']`, `['settings']`, `['menu', filters]`, `['dish', id]`, `['me']`, `['orders','my']`, `['order', id]`, `['tracking', id]`, `['admin', <area>, params]`, `['delivery', ...]`.

After **any** admin mutation: `queryClient.invalidateQueries({ queryKey: ['admin', area] })` **and** invalidate the public keys (`['home']`, `['menu']`, `['settings']`, `['dish']`) so an admin previewing the site in the same tab sees it too.

### 4.4 Auth context and guards

`AuthContext` loads `GET /auth/me` on start → `{ user, permissions, can(p), login, staffLogin, logout, refresh }`. `can(p)` mirrors the server map (permissions come from `/auth/me`).

```jsx
// routes/RoleRoute.jsx
export default function RoleRoute({ roles, permission, children }) {
  const { user, loading, can } = useAuth();
  const loc = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to={roles?.includes('customer') ? '/login' : '/admin/login'} state={{ from: loc }} replace />;
  if (user.role === 'delivery_partner' && user.status === 'pending') return <Navigate to="/delivery/pending" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  if (permission && !can(permission)) return <Navigate to="/403" replace />;
  return children;
}
```

After login redirect by role: customer → previous page or `/`; owner/shop_manager → `/admin`; delivery_partner → `/delivery` (or `/delivery/pending`).

### 4.5 Routes (`App.jsx`)

| Path | Page | Guard |
| --- | --- | --- |
| `/` | Home | public |
| `/menu` | Menu (query params `q`, `veg`, `category`) | public |
| `/dish/:id` | DishDetails | public |
| `/cart` | Cart | public |
| `/checkout` | Checkout | customer |
| `/orders` · `/orders/:id` | My orders · detail + tracker + map | customer |
| `/profile` | Profile + addresses | customer |
| `/login` · `/register` | customer auth | public |
| `/onboard?token=` | Invite accept | public |
| `/partner/apply` | Delivery partner application | public |
| `/admin/login` | Staff login (all staff roles) | public |
| `/admin` | Dashboard | `dashboard:read` |
| `/admin/menu` · `/admin/menu/new` · `/admin/menu/:id` | Menu items | `menu:write` |
| `/admin/categories` · `/admin/addons` | | `menu:write` |
| `/admin/banners` · `/admin/coupons` | | `banners:write` / `coupons:write` |
| `/admin/orders` · `/admin/orders/:id` | | `orders:read` |
| `/admin/live-map` | Live fleet map | `tracking:read` |
| `/admin/staff` | Staff list, invite (owner) | `staff:read` |
| `/admin/applications` | Partner applications | `partners:review` |
| `/admin/settings` | Settings (read-only for manager) | `settings:read` |
| `/delivery` · `/delivery/orders/:id` · `/delivery/pending` | Delivery app | role delivery_partner |
| `/403` · `*` | Forbidden · Not found | |

Admin sidebar items are filtered by `can(permission)`.

### 4.6 Cart store (`store/cart.js`)

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const keyOf = (menuItemId, addonOptionIds) => `${menuItemId}:${[...addonOptionIds].sort().join(',')}`;

export const useCart = create(persist((set, get) => ({
  items: [],            // { key, menuItemId, name, imageUrl, isVeg, quantity, addonOptionIds, addonLabels, unitPricePreview }
  couponCode: null,
  add: (line) => set((s) => {
    const key = keyOf(line.menuItemId, line.addonOptionIds);
    const found = s.items.find((i) => i.key === key);
    return { items: found
      ? s.items.map((i) => i.key === key ? { ...i, quantity: Math.min(i.quantity + line.quantity, 20) } : i)
      : [...s.items, { ...line, key }] };
  }),
  setQty: (key, quantity) => set((s) => ({ items: quantity <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => i.key === key ? { ...i, quantity: Math.min(quantity, 20) } : i) })),
  remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
  setCoupon: (couponCode) => set({ couponCode }),
  clear: () => set({ items: [], couponCode: null }),
  count: () => get().items.reduce((n, i) => n + i.quantity, 0),
}), { name: 'fo_cart' }));
```

`useCartQuote()` hook: `useQuery({ queryKey: ['quote', items, couponCode], queryFn: POST /cart/quote, placeholderData: keepPreviousData })`. The Cart and Checkout pages display the **server quote** (subtotal, discount, tax with %, delivery charge or "FREE", total, "Add ₹X for free delivery", min-order warning, warnings per line with a "Remove" action). When logged in, also sync to `PUT /cart` (debounced 1 s) and merge on login.

### 4.7 Page specs

**Home** — hero banner carousel (auto-advance 5 s, from `/public/home`), open/closed pill with hours, category tiles (click → `/menu?category=id`), "Popular dishes" grid (DishCard), footer with restaurant name/phone/address from settings. Document title = restaurantName.

**Menu** — sticky search bar (debounced 300 ms, synced to URL) + Veg / Non-veg / All segmented control + category chips that scroll to sections. Sections per category with DishCards. Empty state "No dishes match". DishCard: image, veg badge, name, price, short description, "Add" button (opens the dish modal/page if it has add-on groups, otherwise adds directly), grey overlay + "Out of stock" badge + disabled button when `!isAvailable`. If restaurant is closed, show a banner "We're closed — opens at 11:00" and disable Add.

**DishDetails** — large image, veg badge, name, description, base price, AddonPicker per group: radio for `single`, checkboxes for `multi` (disable unchecked boxes when max reached), "Required" tag, unavailable options disabled with "(unavailable)". Quantity stepper. Sticky footer: "Add to cart · ₹{(base + addons) × qty}" updating live. Validate required groups before adding.

**Cart** — lines with add-on labels, stepper, remove, line total; coupon input with Apply/Remove (shows server's `couponError`); summary from quote; "Proceed to checkout" (redirect to login if needed, returning to `/checkout`).

**Checkout** — three cards:
1. Address: saved addresses as radio cards; "Add new address" opens a form with `PinPicker` (Leaflet map, search box using `/public/geo/search`, draggable marker, "Use my location" button) → calls `/public/geo/check` and shows "3.2 km away · We deliver here" or a red error. Save-address checkbox.
2. Delivery time: ASAP (shows "~35–45 min") or Scheduled (slot dropdown from `/public/slots`).
3. Payment: radio cards for enabled methods only — "Cash on Delivery" and "Pay online (UPI / Card / Netbanking)" with a "Test mode" tag.
Summary panel + "Place order". COD → `POST /orders` → clear cart → `/orders/:id?placed=1`. Online → see 6.2.

**My orders** — list cards: orderNumber, date, items summary, total, status badge, payment badge. Detail: `StatusTracker` (4 steps with timestamps from `statusHistory`; cancelled shows a red banner), items table, bill breakdown, address, partner name/phone when out for delivery, and **TrackingMap** when `out_for_delivery`. Poll `GET /orders/:id` every 10 s (`refetchInterval: (q) => ['delivered','cancelled'].includes(q.state.data?.status) ? false : 10000`).

**Profile** — name/phone form; addresses list with edit/delete/set default (edit uses PinPicker).

**Register / Login** — react-hook-form + zod; show server errors inline. Links: "Are you staff? Staff login" and "Deliver with us" → `/partner/apply`.

**Onboard** — reads token, `GET /onboard/invite/:token` (shows "Welcome Priya, you've been invited as Shop Manager"), password + confirm → accept → `/admin`. Expired → friendly message "Ask the owner to resend your invite".

**PartnerApply** — multi-section form: personal (name, email, phone, password), vehicle (type, number, licence — hidden for cycle), shift, document uploads with preview (licence, ID proof, photo). Submit as `FormData`. Success → `/delivery/pending`.

**Admin Dashboard** — stat tiles (Orders today, Revenue today, Avg order value, Active deliveries, Pending applications — link), range toggle Today / 7 days / 30 days, Recharts bar chart of revenue by day (7d/30d), horizontal bar "Top 5 dishes by quantity", orders-by-status chips linking to filtered order list. Auto-refresh every 30 s.

**Admin Menu items** — DataTable: thumbnail, name, category, price, veg, **Available toggle (inline, optimistic)**, Popular toggle, actions edit/delete (ConfirmDialog). Filters: search, category, availability. Form page: all fields, ImageUpload (upload to `/admin/upload`, or paste URL), add-on group multi-select, live preview card of how the dish will look on the site.

**Admin Categories** — list with drag-free reorder (up/down arrows → `/reorder`), active toggle, image, edit modal. Delete shows the 409 message when dishes exist.

**Admin Add-ons** — group cards; editor modal: name, single/multi, required, min/max, options table (name, price, available toggle, remove, add row).

**Admin Banners** — card grid with image preview, active toggle, reorder arrows, edit modal.

**Admin Coupons** — table + form; shows used/limit and expiry.

**Admin Orders** — tabs by status with counts (New = placed, Preparing, Out for delivery, Delivered, Cancelled, Payment pending), search, date filter; auto-refresh every 10 s; play a short beep + toast when a new `placed` order appears (compare ids). Detail page: customer, address with mini map, items with add-ons, bill, payment method/status (+ Razorpay payment id), status history timeline, action bar showing only allowed next statuses, "Assign partner" select (available partners with current load and distance from restaurant), "Cancel order" (confirm; mentions refund for paid orders).

**Admin Live map** — `LiveFleetMap`: restaurant marker, a rider marker per active delivery, line to each destination, side list with ETA; polls `/admin/tracking/live` every 5 s.

**Admin Staff** (owner and manager view) — tabs Shop Managers / Delivery Partners; status badges; owner sees "Invite Shop Manager" button → modal → shows copyable invite link; actions suspend/reactivate (rules as server), resend invite.

**Admin Applications** — pending partners list; detail drawer with documents (click to enlarge), vehicle details; Approve / Reject (reason required).

**Admin Settings** — sections: Restaurant (name, tagline, logo upload, phone, email, address), Location & delivery (PinPicker for restaurant location, radius slider with circle drawn on the map), Charges (tax %, delivery charge, free-delivery threshold, minimum order), Hours (7 rows: open/close time inputs + closed checkbox; "Temporarily closed" master switch), Payments (COD / Online toggles; Online disabled with tooltip if server reports Razorpay not configured). Read-only (disabled inputs + notice) for shop_manager. Save → toast "Live on the website now".

**Delivery app** — `DeliveryHome`: big Online/Offline switch (requests location permission when switching online), today's stats, list of assigned orders (Accept button). `DeliveryOrder`: map with route to customer, customer name with tap-to-call `tel:` link, address with "Open in Google Maps" deep link (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`), items, amount to collect for COD, action bar: Accept → Start delivery (status out_for_delivery, starts GPS sharing) → "Cash collected" checkbox (COD) → Mark delivered. GPS sharing uses the hook below and shows "Sharing location · last sent 4 s ago". `PendingReview`: status card (pending/rejected with reason and "Re-apply" link).

### 4.8 Map components

`useShareLocation(orderId, enabled)`:
```js
export function useShareLocation(orderId, enabled) {
  const [last, setLast] = useState(null); const [error, setError] = useState(null);
  const lastSent = useRef(0);
  useEffect(() => {
    if (!enabled || !('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(async (pos) => {
      const now = Date.now();
      if (now - lastSent.current < 10000) return;               // throttle 10 s
      lastSent.current = now;
      const body = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try { await api.patch(`/delivery/orders/${orderId}/location`, body); setLast(new Date()); setError(null); }
      catch (e) { setError(e.message); }
    }, (err) => setError(err.message), { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [orderId, enabled]);
  return { last, error };
}
```

`TrackingMap({ orderId })`: `useQuery(['tracking', orderId], refetchInterval 5000)`; on 410 stop polling and render nothing. Renders `MapContainer` (height 320 px, `scrollWheelZoom={false}`), OSM `TileLayer` with attribution `&copy; OpenStreetMap contributors`, markers for restaurant / destination / rider, `Polyline` for `route` (or straight dashed line when null), `FitBounds` helper (`useMap().fitBounds`) on first load only, and an overlay card "Arriving in ~8 min · 2.1 km away · Ravi (bike)". Animate the rider marker by updating its position (no extra library).

`PinPicker({ value, onChange, center })`: map + draggable marker + search box + "Use my location"; on change calls `onChange({lat,lng})`; optional `radiusKm` prop draws a `Circle` around `center`.

---

## 5. Order status lifecycle

```
pending_payment ──(paid)──► placed ──► preparing ──► out_for_delivery ──► delivered
       │                      │            │
       └──(15 min / fail)──► cancelled ◄───┘ (owner/manager; refund if paid)
```

| Transition | Who | Side effects |
| --- | --- | --- |
| pending_payment → placed | system (verify/webhook) | paymentStatus paid |
| placed → preparing | owner, shop_manager | — |
| assign partner (placed/preparing) | owner, shop_manager | delivery.partner, assignedAt; partner sees order |
| partner accepts | assigned partner | delivery.acceptedAt |
| preparing → out_for_delivery | assigned partner (after accept) or owner/manager | GPS sharing starts; customer map appears |
| out_for_delivery → delivered | assigned partner or owner/manager | COD: cashCollected + paymentStatus paid; map closes |
| placed/preparing → cancelled | owner, shop_manager (customer: placed only) | refundIfPaid; partner unassigned |

Customer-facing labels: placed "Order placed", preparing "Preparing", out_for_delivery "Out for delivery", delivered "Delivered", cancelled "Cancelled", pending_payment "Payment pending".

---

## 6. Payments (Razorpay test mode)

### 6.1 Setup

1. Create a Razorpay account → switch to **Test Mode** → Settings → API Keys → generate `key_id` / `key_secret`.
2. Webhooks → add `https://<render-api>/api/payments/webhook`, events `payment.captured`, `payment.failed`, `refund.processed`, set a secret → `RAZORPAY_WEBHOOK_SECRET`.
3. Locally the webhook isn't reachable — `/verify` alone is enough; optionally use `ngrok http 5000`.

### 6.2 Client flow

```js
// utils/loadRazorpay.js
export const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true); s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

// in Checkout.jsx
async function payOnline(payload) {
  const ok = await loadRazorpay();
  if (!ok) return toast.error('Could not load payment gateway');
  const { data } = await api.post('/payments/create-order', payload);
  const rzp = new window.Razorpay({
    key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.razorpayOrderId,
    name: settings.restaurantName, description: `Order ${data.orderNumber}`, image: settings.logoUrl,
    prefill: data.prefill, theme: { color: '#ea580c' },
    handler: async (resp) => {
      const { data: v } = await api.post('/payments/verify', { orderId: data.orderId, ...resp });
      clearCart(); navigate(`/orders/${v.order._id}?placed=1`);
    },
    modal: { ondismiss: () => { api.post('/payments/failed', { orderId: data.orderId, reason: 'dismissed' }); navigate(`/orders/${data.orderId}`); } },
  });
  rzp.on('payment.failed', (r) => { api.post('/payments/failed', { orderId: data.orderId, reason: r.error?.description }); toast.error('Payment failed — retry or choose Cash on Delivery'); });
  rzp.open();
}
```

The order detail page for `pending_payment` shows "Complete payment" (calls `/payments/retry/:id` then opens Checkout again) and "Switch to Cash on Delivery" (optional endpoint `POST /orders/:id/switch-to-cod` if still pending and COD enabled).

### 6.3 Test credentials (put in README)

| Method | Value |
| --- | --- |
| Card (success) | 4111 1111 1111 1111 · any future expiry · any CVV · any name; OTP page → Success |
| UPI success / failure | `success@razorpay` / `failure@razorpay` |
| Netbanking | pick any bank → Success / Failure on the mock page |

---

## 7. Onboarding flows (implementation notes)

**Shop Manager invite**
1. Owner → Admin Staff → "Invite Shop Manager" → `POST /admin/staff/invite`.
2. Server: if email exists → 409. Else create `{ role:'shop_manager', status:'invited', inviteTokenHash: hash(t), inviteExpiresAt: now+48h, invitedBy }`. Return `inviteUrl`.
3. UI shows the link with a Copy button (no email server needed; mention optional SMTP in README).
4. Manager opens `/onboard?token=…` → `GET /onboard/invite/:token` → set password → `POST /onboard/accept` → logged in → `/admin` with a dismissible checklist card ("Review the menu", "Check opening hours", "Review partner applications") stored in localStorage.

**Delivery Partner application**
1. `/partner/apply` → `POST /onboard/partner/apply` (multipart). User `status:'pending'`.
2. Partner can log in via staff login → redirected to `/delivery/pending`.
3. Owner/manager → Admin Applications → Approve (`status:'active'`) or Reject (reason).
4. Approved partner logs in → `/delivery`, toggles Online (location permission asked), receives assignments.
5. Suspension rules in 3.11 (Staff).

---

## 8. Deployment

| Piece | Host | Settings |
| --- | --- | --- |
| DB | MongoDB Atlas M0 | Database user; Network Access 0.0.0.0/0; db name `food_ordering` |
| API | Render → New Web Service | Root directory `server`, build `npm install`, start `npm start`, Node 20, health check path `/api/health`, env vars from `server/.env.example` with `NODE_ENV=production`, `CLIENT_URL=https://<app>.vercel.app` |
| Client | Vercel → Import repo | Root directory `client`, framework Vite, env `VITE_API_URL=https://<api>.onrender.com/api` |
| Payments | Razorpay dashboard | Webhook URL + secret (6.1) |

Steps: (1) Atlas cluster + URI → (2) Render service + env → (3) run seed against prod once (`MONGO_URI=<prod> npm run seed` locally) → (4) Vercel project + env → (5) update Render `CLIENT_URL` with the final Vercel URL → (6) Razorpay webhook → (7) smoke test every role on the live URL.

Production cookie: `secure:true; sameSite:'none'` (already in `cookieOptions()`), `trust proxy` set. **Fallback** if third-party cookie blocking breaks login in some browsers: serve the client from Express — build client, copy `client/dist` to `server/public`, add `app.use(express.static('public'))` and a catch-all `app.get(/^\/(?!api).*/, (req,res)=>res.sendFile(...index.html))`, deploy only to Render. Document whichever you used in README and DECISIONS.md.

Render free instances sleep after ~15 min: add a free uptime monitor on `/api/health` every 10 min, and open the site before the demo.

Optional CI — `.github/workflows/ci.yml`: on push/PR, Node 20, `npm run install:all`, `npm test`, `npm run build`.

---

## 9. README template (fill in real values)

```md
# Spice Route Kitchen — Online Food Ordering

Live: https://<app>.vercel.app · API: https://<api>.onrender.com/api/health

Single-restaurant ordering site where the admin panel controls everything: menu, prices, add-ons, availability, banners, hours, tax, delivery charge, payment methods, delivery radius, coupons and staff.

## Features
- Customer: home, menu (search + veg filter), dish add-ons, cart with live tax/delivery, checkout (COD + Razorpay test), order tracking with live map
- Admin: dashboard, menu/categories/add-ons/banners/coupons CRUD, availability toggle, orders, settings, staff & partner onboarding, live fleet map
- Roles: Owner, Shop Manager, Delivery Partner, Customer

## Test logins (password: Demo@1234)
| Role | Email | Login page |
| Owner (admin) | owner@demo.com | /admin/login |
| Shop Manager | manager@demo.com | /admin/login |
| Delivery Partner | rider@demo.com | /admin/login |
| Pending applicant | rider2@demo.com | /admin/login |
| Customer | customer@demo.com | /login |

## Razorpay test payment
Card 4111 1111 1111 1111, any future expiry, any CVV · UPI success@razorpay

## Run locally
1. Node 20+, MongoDB (local or Atlas)
2. `npm run install:all`
3. `cp server/.env.example server/.env` and `cp client/.env.example client/.env`, fill values
4. `npm run seed`
5. `npm run dev` → client http://localhost:5173, API http://localhost:5000
6. Optional: `npm --prefix server run simulate-rider -- <orderId>` to watch live map tracking

## Tech stack / Architecture / Screenshots
(stack table, short architecture description, screenshots from docs/screenshots: home, menu, dish, cart, checkout, tracking map, admin dashboard, menu items, settings, orders, staff, applications, delivery app)
```

---

## 10. Build order with acceptance checks

Each phase ends with: tests/build pass → manual check → commit with the given message → push.

| # | Phase | Done when | Commit |
| --- | --- | --- | --- |
| 1 | Scaffold | `npm run dev` serves both; `/api/health` OK; `.env` ignored | `chore: scaffold monorepo with client and server` |
| 2 | Models, permissions, seed | `npm run seed` prints logins; collections populated | `feat(db): mongoose models, permissions map and seed data` |
| 3 | Auth + guards | register/login/logout/me; staff-login status rules; permission tests pass | `feat(auth): bcrypt + jwt cookie auth with role permissions` |
| 4 | Public API + Home + Menu | home & menu render from DB; search + veg filter | `feat(web): home and menu pages driven by database` |
| 5 | Dish details + cart + quote | add-on price live; cart totals from server quote | `feat(cart): dish add-ons, cart and server-side quote` |
| 6 | Admin shell + menu CRUD + upload + availability | toggle → customer sees Out of stock after reload | `feat(admin): menu items CRUD, image upload, availability` |
| 7 | Categories, add-ons, banners, coupons admin | each change visible on site | `feat(admin): categories, add-ons, banners and coupons` |
| 8 | Settings admin | tax/delivery/hours/closed/payment toggles affect cart & checkout | `feat(admin): restaurant settings` |
| 9 | Profile + addresses + PinPicker + checkout COD | order placed, server recomputes | `feat(orders): checkout with cash on delivery` |
| 10 | Razorpay | test card pays; verify + webhook + refund on cancel | `feat(payments): razorpay test mode checkout and refunds` |
| 11 | Orders admin + status machine + my orders tracker | status changes reflect within 10 s | `feat(orders): admin order management and live status` |
| 12 | Onboarding (invite + partner apply/review) + staff page | full flows work for both roles | `feat(staff): shop manager invites and partner onboarding` |
| 13 | Delivery app + assignment | partner accepts, starts, delivers; COD cash | `feat(delivery): delivery partner app and assignment` |
| 14 | Map tracking + live fleet map + simulator | customer map moves with simulator | `feat(tracking): live map order tracking` |
| 15 | Dashboard | numbers match seeded data | `feat(admin): dashboard metrics and charts` |
| 16 | Polish: responsive, empty/error states, 403/404 | 360 px works | `style: responsive polish and empty states` |
| 17 | Deploy + README + screenshots | live URL works for every role | `docs: README, screenshots and deployment` |

### Final acceptance checklist (run manually, every item)

- [ ] Change a dish price in admin → customer menu, dish page and cart quote show the new price.
- [ ] Toggle a dish unavailable → "Out of stock" on menu/dish, can't add, checkout with it in cart → 409 message.
- [ ] Edit/deactivate a banner and a category → home page changes.
- [ ] Add an add-on option with a price → dish page price changes when selected.
- [ ] Change tax % and delivery charge → cart totals change.
- [ ] Set today's hours to closed / "temporarily closed" → site shows closed and checkout blocked.
- [ ] Turn off Online payment → only COD shown at checkout.
- [ ] Shrink delivery radius → far address rejected at checkout.
- [ ] Customer and delivery partner get 403 on every `/admin` page and `/api/admin/*` call.
- [ ] Shop Manager cannot save Settings or invite managers; can do everything else in admin.
- [ ] Passwords in MongoDB start with `$2` (bcrypt).
- [ ] Razorpay test card payment completes; cancelling the paid order shows "Refunded".
- [ ] Invite link onboards a Shop Manager; expired/used link rejected.
- [ ] Partner application → approve → partner goes online → gets assigned → accepts → map tracking on customer page → delivered.
- [ ] Order status on My Orders updates within 10 s without manual refresh.
- [ ] Dashboard today's orders/revenue/top dishes are correct.
- [ ] `git log --all -- '*.env'` returns nothing; `.env.example` files exist.
- [ ] README has setup steps, every login, screenshots, live URL.

