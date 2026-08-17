# TiffinTrack

A full-stack web application for small tiffin service owners to manage customers, meal plans, subscriptions, payments, expenses, and business analytics from one centralized dashboard.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS, Recharts |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt |
| Database | MongoDB |

## Features

- **Authentication** — Register, login, JWT-protected routes
- **Customer Management** — CRUD with search
- **Plan Management** — Create meal packages with duration and pricing
- **Subscription Management** — Link customers to plans, pause/resume/renew
- **Payment Tracking** — Record and view payment history
- **Expense Tracking** — Track business expenses by category
- **Dashboard** — Business overview with stats and charts
- **Reports** — Revenue, expense, profit, and customer reports

## Project Structure

```
TiffinTrack/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios config
│   │   ├── components/   # Shared UI components
│   │   ├── context/      # Auth context
│   │   └── pages/        # Route pages
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Edit MONGODB_URI and JWT_SECRET if needed
npm run dev
```

The API runs at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/tiffintrack` |
| `JWT_SECRET` | Secret for JWT signing | (set in `.env`) |
| `RAZORPAY_KEY_ID` | Razorpay key ID (safe to return only for Checkout initialization) | (set in `.env`) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret used only by the backend to create and verify orders | (set in `.env`) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register owner |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register-customer` | Register a customer account |
| GET | `/api/messes` | Browse active messes and plans |
| GET | `/api/messes/:id` | View a mess and active plans |
| GET/POST | `/api/checkout/preview`, `/api/checkout/orders` | Validate checkout and create a Razorpay order |
| POST | `/api/checkout/verify` | Verify Razorpay payment and create subscription |
| CRUD | `/api/customers` | Customer management |
| CRUD | `/api/plans` | Plan management |
| GET/POST | `/api/subscriptions` | Subscription management |
| PUT | `/api/subscriptions/:id/pause` | Pause subscription |
| PUT | `/api/subscriptions/:id/resume` | Resume subscription |
| PUT | `/api/subscriptions/:id/renew` | Renew subscription |
| CRUD | `/api/payments` | Payment management |
| CRUD | `/api/expenses` | Expense management |
| GET | `/api/dashboard` | Dashboard analytics |
| GET | `/api/reports/revenue` | Revenue report |
| GET | `/api/reports/expenses` | Expense report |
| GET | `/api/reports/profit` | Profit report |
| GET | `/api/reports/customers` | Customer report |


