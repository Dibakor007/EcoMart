# 🌿 EcoMart - Sustainable E-Commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)


**EcoMart** is a full-stack, eco-conscious e-commerce web platform designed to promote sustainable shopping. It features real-time carbon footprint estimations, full shopping cart and order management and an administrative suite.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables Setup](#environment-variables-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints Summary](#-api-endpoints-summary)
- [Database Configuration](#-database-configuration)
- [License](#-license)

---

## ✨ Features

- 🛒 **Interactive Storefront**: Browse eco-friendly products filtered by categories, sustainability score, carbon savings, price, and ratings.
- 🤖 **AI Eco-Insights**: AI-assisted sustainability assessments powered by the Google Gemini API (`@google/genai`) to compute environmental impact and suggest greener alternatives.
- 🔐 **Authentication & Authorization**: Secure user authentication using JWT and bcrypt, with support for Google OAuth login.
- 🛍️ **Shopping Cart & Checkout**: Interactive shopping cart management with instant price recalculations, carbon saving totals, and seamless checkout processing.
- ❤️ **Wishlist**: Save favorite products for future purchases.
- 📦 **Order Tracking**: Track order status, payment status, shipping details, and historical purchase records.
- ⭐ **Product Reviews**: Submit and browse verified customer reviews and ratings.
- ⚡ **Admin Dashboard**: Manage inventory, update order statuses, seed product catalog data, and review analytics.
- 🛡️ **Resilient Architecture**: Built-in hybrid database support with MongoDB (Mongoose) and automatic fallback for offline or development resilience.

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (Mongoose ORM) with local fallback support
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `helmet`, `express-rate-limit`
- **Execution Tooling**: `tsx`, `esbuild`

### **Frontend**
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS, Custom Responsive CSS
- **Icons**: Lucide Icons (`lucide-react`)
- **Animation**: Motion (`motion`)

---

## 📁 Project Structure

```
ecomart/
├── backend/                  # Express API server & TypeScript backend code
│   ├── config/               # Database connection configs (MongoDB, etc.)
│   ├── controllers/          # Business logic handlers for API routes
│   ├── middleware/           # Auth verification, security & request rate limiting
│   ├── models/               # Mongoose database schemas (User, Product, Order, etc.)
│   ├── routes/               # API route definitions
│   └── server.ts             # Main server entrypoint
├── public/                   # Static public assets (images, icons)
├── frontend/                 # Client-side assets (CSS, scripts)
├── assets/                   # Project media assets & mock imagery
├── index.html                # Main homepage storefront
├── products.html             # Product catalog & search page
├── product-details.html      # Individual product view & reviews
├── checkout.html             # Checkout & payment page
├── orders.html               # Customer order history & tracking
├── wishlist.html             # Saved user wishlist page
├── profile.html              # User profile settings
├── admin.html                # Admin management panel
├── login.html                # User login page
├── register.html             # Account registration page
├── server.ts                 # Entry script routing to backend server
├── vite.config.ts            # Vite bundler configuration
├── tsconfig.json             # TypeScript compiler settings
├── .env.example              # Sample environment configuration file
├── .gitignore                # Git ignore configuration
├── LICENSE                   # Open-source MIT License file
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.x or higher
- **npm** or **bun** / **yarn** package manager
- **MongoDB** (Optional): Local MongoDB instance or MongoDB Atlas cluster connection string. If unavailable, the server runs in resilient fallback mode.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/ecomart.git
   cd ecomart
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Variables Setup

Copy the `.env.example` file to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your configuration details:

```env
# Google Gemini API Key for AI Eco Insights
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Database Connection (MongoDB)
MONGODB_URI="mongodb://localhost:27017/ecomart"

# Security & Secrets
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Server Settings
PORT=3000
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
```

---

## 💻 Running the Application

### Development Mode

To launch the Express server and Vite development server concurrently with auto-reload:

```bash
npm run dev
```

Visit the application at: `http://localhost:3000`

### Type Checking & Linting

```bash
npm run lint
```

### Production Build & Launch

To build the static frontend assets and bundle the backend server:

```bash
npm run build
npm start
```

---

## 📡 API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/auth/register` | `POST` | Register a new user account | No |
| `/api/auth/login` | `POST` | Authenticate user & get JWT token | No |
| `/api/auth/profile` | `GET` / `PUT` | Fetch or update user profile | Yes |
| `/api/products` | `GET` | Retrieve product catalog with filtering & search | No |
| `/api/products/:id` | `GET` | Retrieve details for a specific product | No |
| `/api/categories` | `GET` | Fetch list of product categories | No |
| `/api/cart` | `GET` / `POST` | View shopping cart items or add item to cart | Yes |
| `/api/cart/:id` | `PUT` / `DELETE` | Update item quantity or remove from cart | Yes |
| `/api/orders` | `GET` / `POST` | View user orders or place a new order | Yes |
| `/api/wishlist` | `GET` / `POST` | Fetch user wishlist or toggle saved item | Yes |
| `/api/reviews` | `GET` / `POST` | Get product reviews or submit a product review | Optional / Yes |
| `/api/eco/insights` | `POST` | Generate AI carbon analysis via Gemini API | No |
| `/api/admin/*` | `GET` / `POST` | Admin product & order management operations | Admin |
| `/api/health` | `GET` | Server health & database connection status check | No |

---

## 💾 Database Configuration

The platform connects to MongoDB using Mongoose. If no active MongoDB database connection is provided in `MONGODB_URI`, EcoMart initializes a resilient local store ensuring development can continue seamlessly without database configuration blockers.

---

## 📄 License

This project is open-source and licensed under the **[MIT License](LICENSE)**.

---

<p align="center">Made with 🌱 for a sustainable future.</p>
