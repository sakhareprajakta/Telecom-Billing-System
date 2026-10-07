# NexusTel — Telecom Billing & Customer Management System
### Complete MERN Stack Application (React.js + Node.js + Express.js + MongoDB)

A production-grade, responsive full-stack **Telecom Billing and Customer Management System** designed according to the architectural, business rule, and interview preparation specifications.

---

## 🌟 Key Highlights & Feature Matrix

- **Dual-Perspective Role-Based Access Control (RBAC)**:
  - **Admin**: Configure tariffs & plans, execute batch billing cycles, monitor total network telemetry, revenue analytics, and manage all subscriber accounts.
  - **Support**: Look up customer 360° profiles, review CDR call detail records, troubleshoot invoice breakdowns, and toggle account statuses.
  - **Customer / Subscriber**: Review current high-speed 5G tariff quotas, track real-time Data (GB), Voice (Mins) and SMS consumption, download official tax invoices, and settle bills via simulated idempotent payment gateways.
- **Authoritative Backend Billing Engine (Pages 8–9)**:
  - Strict calculation rule: $\text{Final Amount} = \text{Base Plan} + \text{Extra Data} + \text{Extra SMS} - \text{Discount} + \text{Tax (18\% GST)}$.
  - The frontend displays results, but **never** performs authoritative pricing or rating.
  - Reference calculation from spec:
    - Base Plan: ₹499 (5 GB included)
    - Actual Data: 7 GB $\rightarrow$ 2 GB excess @ ₹50/GB = ₹100
    - SMS Charge: ₹20
    - Discount: ₹50
    - Tax (18% GST): ₹102
    - **Total Invoice Amount = ₹671** (Exact match)
- **High-Volume Usage Tracking (CDR Ingestion & Partitioning)**:
  - Dedicated `Usage` collection prevents document growth beyond MongoDB's 16MB BSON limit.
  - Compound indexes on `{ customerId: 1, usageDate: -1 }` and `{ customerId: 1, billingPeriod: 1 }`.
  - Simulates Call Detail Records (CDR) for Internet Data (GB), Voice (Mins), and SMS.
- **Idempotent Payment Gateway Integration (Page 10)**:
  - Accepts client-supplied `Idempotency-Key` headers to ensure network retries never double-charge.
  - Verifies invoice status is `PENDING` before proceeding.
  - Updates invoice status to `PAID`, logs transaction records, and triggers in-app notification alerts.
- **Interactive Architecture & Top 25 Interview Questions**:
  - Interactive guide tab right inside the React application covering all 25 top interview questions, request lifecycles, and 45-second pitch!

---

## 🏗️ Architecture & Component Overview

```
                      +---------------------------------------+
                      |       React.js Frontend (Vite)        |
                      |  Dashboard / Billing / Invoices /     |
                      |  Usage & CDR / Payments / Auth        |
                      +-------------------+-------------------+
                                          |
                                    HTTPS / REST
                               (JWT in Authorization)
                                          |
                                          v
                      +---------------------------------------+
                      |         Express.js REST API           |
                      |   Routes + JWT Auth + RBAC Middleware |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Service Layer Logic           |
                      |  billing.service.js / payment.service |
                      |  usage.service.js   / notif.service   |
                      +-------------------+-------------------+
                                          |
                                    Mongoose ODM
                            (Indexed Queries & Pipelines)
                                          |
                                          v
                      +---------------------------------------+
                      |           MongoDB Database            |
                      |  Users, Customers, Plans, Usage,      |
                      |  Invoices, Payments, Notifications    |
                      +---------------------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended, verified on v22.12.0)
- **MongoDB** running locally on port 27017 or a cloud MongoDB Atlas URI (`mongodb://127.0.0.1:27017/telecom_billing`)

### 2. Environment Configuration
The server `.env` file is located at `server/.env`:
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=6
JWT_EXPIRES_IN=
NODE_ENV=development
```

### 3. Running the Application
From the project root:
```bash
# Option A: Start both Backend and Frontend concurrently
npm run dev

# Option B: Run separately
# Terminal 1 (Backend):
cd server
npm run dev

# Terminal 2 (Frontend):
cd client
npm run dev
```

The frontend will be available at: **http://localhost:5173**  
The backend API is running at: **http://localhost:5000** (Health check: `http://localhost:5000/api/health`)

---

## 🔑 Demo Login Credentials

You can use the **1-Click Demo Role Switcher** buttons at the top of the app or log in with these credentials:

| Role | Email | Password | Subscriber Code | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `-----` | `Password@---` | N/A | Full operator access, plan creation, batch billing |
| **Support** | `------` | `Password@---` | N/A | Subscriber management, status toggle, CDR lookup |
| **Customer** | `------` | `Password@---` | `CUST1001` | Aarav Sharma (Active Plan: Standard Saver 499, ₹671 Bill) |
| **Customer 2** | `-------` | `Password@---` | `CUST1002` | Riya Patel (Active Plan: Unlimited Pro 799) |
| **Customer 3** | `--------` | `Password@---` | `CUST1003` | Vikram Malhotra (Active Plan: Infinity Max 1299) |

To re-seed the sample data at any time:
```bash
npm run seed
```

---

## 📂 Project Directory Structure

```
Telecom Billing System/
├── package.json               # Root scripts runner
├── README.md                  # Comprehensive documentation
├── server/                    # Node.js + Express Backend
│   ├── config/
│   │   └── database.js        # Mongoose database connector
│   ├── models/
│   │   ├── User.js            # User credentials & RBAC role
│   │   ├── Customer.js        # Subscriber profile, phone, address
│   │   ├── Plan.js            # Tariff plans, included data, overage rates
│   │   ├── Subscription.js    # Customer <-> Plan association
│   │   ├── Usage.js           # CDR events (DATA, VOICE, SMS) with indexes
│   │   ├── Invoice.js         # Tax invoices, breakdowns & due dates
│   │   ├── Payment.js         # Payment gateway transactions & idempotency
│   │   └── Notification.js   # Billing reminders & payment alerts
│   ├── routes/                # REST endpoints
│   ├── controllers/           # HTTP handlers & parameter extraction
│   ├── services/              # Pure business logic (Billing Engine, Payment)
│   ├── middleware/            # JWT protect, RBAC authorize, Error handler
│   ├── validators/            # Input validation boundary
│   ├── utils/seed.js          # Realistic telecom database seeder
│   └── server.js              # Server entry point
│
└── client/                    # React.js + Tailwind CSS Frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/        # Button, Modal, DataTable, Loader, StatCard, Navbar, Sidebar
    │   │   ├── billing/       # BillingSummary, InvoiceTable, InvoiceDetails
    │   │   ├── customer/      # Customer directory components
    │   │   ├── subscription/  # PlanCard, PlanSelector
    │   │   ├── usage/         # UsageSummary meters, UsageRecordForm
    │   │   └── payment/       # PaymentModal, PaymentReceipt
    │   ├── pages/
    │   │   ├── Login.jsx      # Authentication & Quick Demo access
    │   │   ├── Dashboard.jsx  # Dual Customer & Operator Telemetry
    │   │   ├── Customers.jsx  # Subscriber 360° Management
    │   │   ├── Subscriptions.jsx # Tariff Catalog & Plan Upgrade
    │   │   ├── Usage.jsx      # CDR Tracking & Simulation
    │   │   ├── Billing.jsx    # Live Billing Engine Calculator & Batch Run
    │   │   ├── Invoices.jsx   # Tax Invoices & Statements
    │   │   ├── Payments.jsx   # Gateway Reconciliation & Receipts
    │   │   └── InterviewGuide.jsx # Top 25 Questions & Architecture Walkthrough
    │   ├── services/          # API Client with token injection
    │   ├── context/           # AuthContext
    │   ├── hooks/             # useAuth
    │   └── utils/             # Currency, date, and status formatters
    └── vite.config.js         # Vite configuration with proxy to port 5000
```

---

