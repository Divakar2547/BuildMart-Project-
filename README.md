# 🏗️ BuildMart — Construction Materials E-Commerce Platform

A full-stack, production-ready e-commerce platform for construction materials built with React, Node.js, MongoDB, and Razorpay.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Payments | Razorpay (UPI, Cards, Net Banking) |
| Styling | Tailwind CSS with custom design tokens |

---

## ✨ Features

### 🛍️ Store
- Home page with hero, featured products, and category grid
- Product listing with category filters, search, and sort
- Product detail page with specs, stock status, and quantity picker
- Cart with persistent storage (MongoDB), quantity update, remove

### 🔐 Authentication
- Register / Login with JWT
- Protected routes for checkout, orders, admin
- Role-based access (user / admin)
- Password hashing with bcryptjs

### 💳 Checkout & Payment
- Multi-step checkout (Address → Review → Payment)
- Razorpay integration: UPI, Cards, Net Banking, Wallets
- Payment verification via HMAC signature
- Development mock mode (works without real Razorpay keys)

### 📦 Orders
- Order creation after payment
- Order history with status badges
- Detailed order view with status tracker and activity log

### ⚙️ Admin Panel
- Dashboard with revenue, orders, products, and users stats
- Product CRUD (create, edit, delete with modal form)
- One-click seed of 12 sample products
- Order management with inline status updates
- User list view

---

## 🗂️ Project Structure

```
buildmart/
├── backend/
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/             # Express routers
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Entry point
│   ├── seed.js             # DB seeder
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/     # ProductCard, Spinner, StatusBadge...
│       │   └── layout/     # Navbar, Footer
│       ├── context/        # AuthContext, CartContext
│       ├── pages/          # All page components
│       ├── utils/          # API client (axios)
│       └── App.jsx         # Routes
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- (Optional) Razorpay account for real payments

---

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buildmart
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Razorpay (leave as-is for development mock mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

NODE_ENV=development
```

> **Note:** Without real Razorpay keys the app uses **mock payment mode** — orders are created successfully and you can test the full flow without a Razorpay account.

---

### 3. Seed the Database

```bash
cd backend
node seed.js
```

This creates:
- **Admin:** `admin@buildmart.com` / `admin123`
- **User:** `user@buildmart.com` / `user123`

---

### 4. Start the Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

### 5. Seed Products

1. Open `http://localhost:3000`
2. Login as admin (`admin@buildmart.com` / `admin123`)
3. Go to **Admin Dashboard** → click **"Seed Sample Products"**
4. 12 sample products across Cement, Steel, Tools, Paint, etc. are added instantly

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | User | Get profile |
| PUT | `/api/auth/profile` | User | Update profile |
| POST | `/api/auth/address` | User | Add address |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List (filter, search, sort, paginate) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create |
| PUT | `/api/products/:id` | Admin | Update |
| DELETE | `/api/products/:id` | Admin | Soft-delete |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart/add` | User | Add item |
| PUT | `/api/cart/item/:id` | User | Update quantity |
| DELETE | `/api/cart/item/:id` | User | Remove item |
| DELETE | `/api/cart/clear` | User | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | User | Create order |
| GET | `/api/orders/my-orders` | User | My orders |
| GET | `/api/orders/:id` | User | Order detail |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-order` | User | Create Razorpay order |
| POST | `/api/payment/verify` | User | Verify payment signature |
| GET | `/api/payment/key` | User | Get Razorpay key |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| POST | `/api/admin/seed-products` | Admin | Seed 12 sample products |

---

## 💡 Razorpay Integration

### Development (Mock Mode)
Works out of the box — no keys needed. Orders complete successfully.

### Production
1. Create a [Razorpay account](https://razorpay.com)
2. Get Key ID and Key Secret from Dashboard → Settings → API Keys
3. Set them in `backend/.env`
4. The Razorpay checkout modal will open with real payment options

---

## 🎨 Design System

- **Primary color:** Orange (#f97316) — construction energy
- **Neutral palette:** Steel blues (slate-based)
- **Typography:** Inter (Google Fonts)
- **Cards:** Rounded-xl with subtle shadow + hover lift
- **Buttons:** Primary orange / Secondary outlined
- **Responsive:** Mobile-first, works on all screen sizes

---

## 🛡️ Security Features

- Passwords hashed with bcryptjs (salt rounds: 12)
- JWT tokens with configurable expiry
- Auth middleware on all protected routes
- Admin-only middleware for admin routes
- Payment signature verification via HMAC-SHA256
- Input validation on all routes
- CORS configured for frontend origin

---

## 📦 Product Categories

| Category | Examples |
|----------|---------|
| Cement | OPC 53, PPC, White Cement |
| Steel | TMT Fe-500D, Angles, Channels |
| Tools | Concrete Mixer, Drill, Angle Grinder |
| Sand & Aggregate | M-Sand, River Sand, Gravel |
| Bricks | Red Clay, Fly Ash, AAC Blocks |
| Pipes & Fittings | UPVC, CPVC, GI Pipes |
| Paint | Exterior, Interior, Primer |
| Electrical | Wires, Switches, MCBs |

---

## 🚢 Production Deployment

### Backend (Railway / Render / EC2)
```bash
npm start
```
Set all environment variables in your hosting dashboard.

### Frontend (Vercel / Netlify)
```bash
npm run build
# dist/ folder is the output
```
Set `VITE_API_URL` if frontend and backend are on different domains, and update the Vite proxy config accordingly.

---

## 📄 License

MIT — free for personal and commercial use.
