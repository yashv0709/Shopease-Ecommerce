# ShopEase: Full-Stack E-Commerce Platform

ShopEase is a production-ready, security-first full-stack e-commerce web application. It features robust transaction-handling, role-based authorization, automated testing pipelines, and a modern responsive interface.

---

## 🚀 Key Architectural & Security Highlights

*   **Secure Backend-Driven Checkout:** The backend never trusts prices or totals sent by the client. Checkout queries fresh product prices from MongoDB, verifies inventory levels, and computes the total amount securely on the server.
*   **Atomic Inventory Protection:** To prevent race conditions (e.g., overselling a single remaining item to concurrent buyers), stock is adjusted atomically in MongoDB using `findOneAndUpdate` with condition checks: `stock: { $gte: quantity }`.
*   **ACID MongoDB Transactions:** The checkout sequence (validating products, decrementation of stock, creation of the order, and clearing the cart) runs inside a MongoDB Session Transaction. If any operation fails, the transaction is rolled back completely.
*   **HttpOnly Cookie Authentication:** JWT tokens are stored in secure, HttpOnly cookies to defend the frontend against Cross-Site Scripting (XSS) token extraction.
*   **Index-Optimized Product Queries:** Implemented server-side text indexing on names and descriptions for quick fuzzy searches, compound indexing on `category` and `price` to accelerate compound filters, and indexing on `createdAt` for reverse sorting.
*   **Verified-Purchase Reviews:** Reviews are restricted on the backend. Only users who have completed orders containing the target product can write reviews, and a unique compound index prevents duplicate submissions.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Tailwind CSS v4, Axios, Lucide Icons, Vite
*   **Backend:** Node.js, Express.js, Express-Validator, Express-Rate-Limit
*   **Database:** MongoDB, Mongoose ORM
*   **Testing:** Jest, Supertest (APIs & Integration), Playwright (End-to-End browser)
*   **Virtualization:** Docker, Docker Compose

---

## 📁 Repository Structure

```
Project 2/
├── backend/
│   ├── config/          # Database connection details
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Auth, rate-limiter, validator hooks
│   ├── models/          # User, Product, Cart, Order, Review schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic services (order checkout transaction)
│   ├── tests/           # Jest & Supertest integration tests
│   ├── Dockerfile       # Production server build definition
│   ├── seed.js          # Database populator script
│   └── server.js        # Main Express API entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/  # Shared layouts (Navbar, ProtectedRoute)
│   │   ├── context/     # AuthContext, CartContext bindings
│   │   ├── pages/       # Product list, cart, admin portal pages
│   │   └── App.jsx      # Navigation routing and context wrappers
│   └── Dockerfile       # Multi-stage React build served by Nginx
├── e2e/
│   ├── customer-flow.spec.js  # Playwright customer checkout test
│   └── playwright.config.js    # Playwright configuration
└── docker-compose.yml   # Sandbox compose orchestrating DB & servers
```

---

## 💻 Running the App Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (or Atlas URI)

### 1. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=supersecretkey999
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Setup and Run Backend
```bash
cd backend
npm install
node seed.js         # Populate initial products and test accounts
npm run dev          # Starts server with native file watch
```

### 3. Setup and Run Frontend
```bash
cd ../frontend
npm install
npm run dev          # Runs Vite client on port 5173
```

---

## 🐳 Running with Docker (One-Click Sandbox)

You can spin up the entire stack including a local MongoDB database container, the API backend, and Nginx serving the React frontend:

```bash
docker-compose up --build
```
*   Frontend: `http://localhost`
*   Backend: `http://localhost:5000`

---

## 🧪 Testing Suite

### 1. Integration & Unit Tests (Jest & Supertest)
Runs database operations and route validation in isolation.
```bash
cd backend
npm run test
```

### 2. End-to-End Tests (Playwright)
Executes happy-path customer journey (Register → Login → Search → Add to Cart → Checkout → Order Details) in a real browser context.
```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```
