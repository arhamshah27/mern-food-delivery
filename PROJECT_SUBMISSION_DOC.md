# 🍽️ Baroda Gourmet — Project Submission & Evaluation Document

**Full-Stack MERN Gourmet Food Ordering & Real-Time Fleet Delivery Platform**

---

## 📌 1. Project Information & Live URLs

- **Project Title**: Baroda Gourmet Kitchen — Food Delivery & Fleet Tracking Platform
- **Live Deployment URL**: [https://mern-food-delivery-navy.vercel.app](https://mern-food-delivery-navy.vercel.app)
- **GitHub Repository**: [https://github.com/arhamshah27/mern-food-delivery](https://github.com/arhamshah27/mern-food-delivery)
- **Local Dev URLs**:
  - Frontend Client: `http://localhost:5173`
  - Backend API Server: `http://localhost:5000`

---

## 🔐 2. Environment Variables & Submission Credentials (`.env`)

Below are the exact environment variables configured for this project.

### Backend Environment Configuration (`backend/.env`):

```env
# Database Configuration (MongoDB Atlas Cloud Cluster)
MONGODB_URI=mongodb+srv://jiljil4512_db_user:jilmom12jildad34@cluster0.pumimrd.mongodb.net/brdweb

# Server Environment
PORT=5000
NODE_ENV=production

# JWT Authentication
JWT_SECRET=18d271be35629c28292cb237b88dc1d99df1a112231daa2543b3127ced10afaa66984252c3aa62024e5e9dc8300730cf025477621ff2ca2c1c228fda374c7f16
JWT_EXPIRES_IN=7d

# Client Application URL (For CORS & Onboarding Links)
CLIENT_URL=https://mern-food-delivery-navy.vercel.app

# Cloudinary Cloud Storage (Food item & banner media upload)
CLOUDINARY_CLOUD_NAME=dremj6c6s
CLOUDINARY_API_KEY=768275331992398
CLOUDINARY_API_SECRET=TDhZM5t6586pA7xUrLv--3X2s1Q

# HTTP Cookies
COOKIE_SECURE=true
COOKIE_SAMESITE=lax

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=rzp_test_Trion8p78Qwb7u
RAZORPAY_KEY_SECRET=sifRNyj0eN1446KLfcw0MU8a
```

### Credentials Breakdown & Purpose:

| Variable | Description & Access Details |
|---|---|
| `MONGODB_URI` | MongoDB Atlas hosted cluster connection string with read/write access to the `brdweb` database. Whitelisted to `0.0.0.0/0` for cloud deployment. |
| `JWT_SECRET` | 512-bit cryptographic hash secret used to sign and verify JSON Web Tokens for stateful authentication across user sessions. |
| `CLIENT_URL` | Root URL used by the backend to formulate single-use onboarding invite links (`/onboard?token=...`) and enforce CORS origin safety. |
| `CLOUDINARY_*` | Cloudinary API keys providing programmatic image uploading, resizing, optimization, and deletion for restaurant dishes and banners. |
| `RAZORPAY_*` | Razorpay sandbox test keys for processing credit/debit cards, UPI (`success@razorpay`), net banking, and generating digital payment orders. |

---

## 👥 3. Test Credentials & Role Access Matrix

The platform implements a streamlined **3-Role Access Model**:

| Role | Email | Password | Access Portals | Responsibilities |
|---|---|---|---|---|
| **Admin** | `owner@demo.com` | `Demo@1234` | `/admin`, `/admin/orders`, `/admin/fleet`, `/admin/menu` | Full system control, menu & dish management, inventory availability, order status updates, assigning delivery riders, staff invites, restaurant operational settings. |
| **Admin (Ops)** | `manager@demo.com` | `Demo@1234` | `/admin` | Operations administrator for order lifecycle management and rider onboarding reviews. |
| **Delivery Rider (Active)** | `rider@demo.com` | `Demo@1234` | `/delivery`, `/delivery/orders/:id` | Mobile-responsive courier portal: toggle duty status (Online/Offline), accept dispatches, view customer destination, stream GPS telemetry, collect COD cash, confirm deliveries. |
| **Delivery Rider (Pending)** | `rider2@demo.com` | `Demo@1234` | `/delivery/pending` | Demonstrates pending verification gate for riders awaiting admin approval. |
| **Customer** | `customer@demo.com` | `Demo@1234` | `/`, `/menu`, `/food/:id`, `/cart`, `/checkout`, `/my-orders` | Public food browsing, dietary filters, custom add-ons, cart checkout, online & COD payment, live interactive map tracking. |

---

## 🛠️ 4. Technical Architecture & Technology Stack

### Frontend Architecture:
- **Framework**: React 19 + Vite 8 Single Page Application (SPA).
- **Styling**: Tailwind CSS v4 with custom responsive design tokens and high-contrast Light/Dark mode.
- **Routing**: React Router v7 with protected route guards (`ProtectedRoute`, `AdminRoute`, `DeliveryRoute`).
- **State & Context**: `AuthContext`, `CartContext`, `ThemeContext`.
- **Mapping**: Leaflet + React-Leaflet with OpenStreetMap tiles for customer real-time tracking and admin fleet dispatch map.
- **HTTP Client**: Axios instance configured with automatic relative `"/api"` base URL for same-origin serverless routing in production.

### Backend Architecture:
- **Runtime & Framework**: Node.js v18+ with Express.js REST API.
- **Database Engine**: MongoDB Atlas with Mongoose ODM (strict schemas, validation, indexing).
- **Pricing Engine (`services/pricing.js`)**: Server-side single source of truth for pricing, add-ons calculation, coupon discounts, packaging, delivery fee, and GST.
- **State Machine (`services/orderStatus.js`)**: Deterministic finite state machine:
  `pending_payment` ➔ `placed` ➔ `preparing` ➔ `out_for_delivery` ➔ `delivered` (or `cancelled`).
- **File Storage**: Multer memory storage + Cloudinary API uploader.
- **Authentication**: JWT stored in HTTP-only cookies and Authorization headers, with bcryptjs password hashing.
- **Payment Verification**: SHA-256 HMAC cryptographic signature validation on Razorpay webhooks and callbacks.

### Deployment Architecture:
- **Hosting**: Unified Vercel Project utilizing Vercel Services (`vercel.json`).
- **Routing**: Top-level rewrites routing `/api/*` to Express Serverless service and `/*` to Vite Frontend SPA, serving the entire application under one unified domain with zero CORS restrictions.

---

## 🔄 5. Complete Step-by-Step System Workflows

### Workflow A: Customer Food Ordering & Checkout

1. **Browse Food Catalogue (`/` or `/menu`)**:
   - Customer filters dishes by Category (*Starters & Appetizers, Signature Main Course, Biryani & Rice Bowls, Artisanal Breads, Desserts & Beverages*).
   - Toggles the **Veg / Non-Veg** diet switch to instantly filter recipes.
   - Searches dishes by keywords or spice intensity.
2. **Customizing Add-Ons & Quantity (`/food/:id`)**:
   - Customer selects portion quantity.
   - Selects custom chef add-ons (e.g. *Extra Pure Desi Ghee, Spicy Mint Chutney, Crispy Roasted Papad, Boondi Raita*). Total price recalculates in real-time.
   - Clicks **Add to Cart** with immediate checkmark visual feedback.
3. **Cart Review & Coupon Application (`/cart`)**:
   - Customer reviews line items and customizations.
   - Applies promo codes (e.g. `WELCOME50` or `FLAT100`).
   - Server-side pricing engine verifies minimum order thresholds, coupon validity, and returns final computed bill.
4. **Checkout & Payment Execution (`/checkout`)**:
   - Customer enters delivery street address, area, landmark, and pincode.
   - Chooses payment method:
     - **Cash on Delivery (COD)**: Order created immediately with payment status `pending`.
     - **Online Payment (Razorpay)**: Razorpay checkout modal opens. Customer enters test payment (UPI: `success@razorpay` or Test Card: `4012 0000 0000 0002`). The signature is cryptographically verified by `/api/payment/verify`.
5. **Live GPS Order Tracking (`/orders/:id`)**:
   - Customer views live interactive map showing:
     - 🏪 Restaurant kitchen pin
     - 🏠 Customer drop-off pin
     - 🛵 Moving courier pin with route polyline
   - Automated polling every 10 seconds delivers instant order status progression.

---

### Workflow B: Admin Operations & Order Dispatch Control

1. **Accessing the Portal (`/admin` or `/admin/login`)**:
   - Login with `owner@demo.com` / `Demo@1234`.
2. **Order Management & Status Progression (`/admin/orders`)**:
   - Incoming orders display under **Placed** with blue badge.
   - Kitchen manager changes status to **Preparing** (Amber badge).
   - **Assigning a Delivery Rider**: On the order card, click the **Assign Rider** dropdown. All active, approved couriers appear (e.g., `rider@demo.com`). Select the rider to immediately link the order to their mobile dispatch queue.
3. **Live Fleet Surveillance (`/admin/fleet`)**:
   - Operations map displays all riders currently on duty, their battery levels, and their live GPS pins across Vadodara.
4. **Menu & Inventory Control (`/admin/menu`)**:
   - Create new dishes with title, description, price, prep time, veg/non-veg flag, and Cloudinary image upload.
   - **Availability Toggle**: Switch items *In Stock* or *Out of Stock* with immediate customer storefront enforcement.
5. **Rider Application Reviews (`/admin/applications`)**:
   - View pending rider applications submitted through the public portal (`/partner/apply`).
   - Review vehicle license plate, driver license number, and click **Approve** to activate the account.
6. **Staff Management (`/admin/staff`)**:
   - Generate single-use cryptographic invitation links (`/onboard?token=...`) to onboard new administrators.
7. **Kitchen Store Settings (`/admin/settings`)**:
   - Set kitchen opening & closing times, minimum delivery thresholds, packaging fees, and emergency store toggle.

---

### Workflow C: Delivery Rider Mobile Fulfillment

1. **Rider Login & Availability (`/delivery`)**:
   - Rider logs in using `rider@demo.com` / `Demo@1234`.
   - Toggles duty status to **Online**.
2. **Receiving Dispatched Orders**:
   - The rider sees the assigned order in their **Assigned Orders** tab.
3. **Accepting Dispatch & Navigation (`/delivery/orders/:id`)**:
   - Rider taps the order to view customer contact info, kitchen pickup address, and drop-off coordinates.
   - Rider taps **Accept Dispatch / Start Delivery**.
   - Order status automatically updates to **`out_for_delivery`**.
   - Rider device streams live GPS coordinates (`/api/delivery/location`), moving the courier pin on the customer's tracking map in real time.
4. **Delivery Handover & Cash Collection**:
   - Arriving at the destination:
     - **For COD Orders**: The screen shows exact cash to collect (e.g. `Collect ₹485 in Cash`). Rider marks cash received.
     - **For Razorpay Orders**: Displays `Paid via Razorpay ✓`.
   - Rider taps **Confirm Delivery** &rarr; status updates to **`delivered`**.

---

## 💻 6. Automated Rider Simulator

To test the complete delivery sequence and GPS movement without requiring a second physical device:

```bash
cd backend
npm run simulate-rider -- <orderId-or-orderNumber>
```

**Simulator Action Sequence:**
1. Authenticates as `rider@demo.com`.
2. Verifies the order is assigned to the rider (or assigns it).
3. Accepts dispatch & transitions order to `out_for_delivery`.
4. Streams realistic GPS coordinates step-by-step along Vadodara roads every 3 seconds.
5. Handles COD cash collection verification.
6. Completes the delivery with status `delivered`.

---

## 📡 7. Core REST API Endpoints Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile & role |
| `GET` | `/api/foods` | Public | List all available food items with filtering |
| `POST` | `/api/foods` | Admin | Create new food item with image upload |
| `PUT` | `/api/foods/:id` | Admin | Update food item details & availability |
| `GET` | `/api/categories` | Public | Get all active food categories |
| `GET` | `/api/addons` | Public | List all culinary add-on options |
| `POST` | `/api/cart/quote` | Public | Server-side pricing quotation engine |
| `POST` | `/api/orders` | Customer | Place order (COD or Razorpay order creation) |
| `GET` | `/api/orders/my-orders` | Customer | List customer order history |
| `GET` | `/api/orders/:id` | Protected | View full order details & live tracking |
| `GET` | `/api/orders` | Admin | List all orders with status filtering |
| `PUT` | `/api/orders/:id/status` | Admin / Rider | Update order status (`placed` ➔ `preparing` ➔ `out_for_delivery` ➔ `delivered`) |
| `PUT` | `/api/orders/:id/assign` | Admin | Assign delivery rider to order |
| `POST` | `/api/delivery/apply` | Public | Submit new delivery rider application |
| `GET` | `/api/delivery/orders` | Rider | List assigned deliveries for logged-in rider |
| `POST` | `/api/delivery/location` | Rider | Stream live rider GPS coordinates |
| `POST` | `/api/payment/create-order` | Customer | Create Razorpay order instance |
| `POST` | `/api/payment/verify` | Customer | Cryptographically verify Razorpay payment HMAC signature |
| `GET` | `/api/settings` | Public | Get restaurant operational hours & fee settings |
| `PUT` | `/api/settings` | Admin | Update restaurant operating parameters |

---

## 🚀 8. Running the Project Locally

```bash
# 1. Clone repository
git clone https://github.com/arhamshah27/mern-food-delivery.git
cd mern-food-delivery

# 2. Run Backend
cd backend
npm install
npm run dev

# 3. Run Frontend (in separate terminal)
cd ../frontend/vite-project
npm install
npm run dev
```

Visit the application at `http://localhost:5173`.
