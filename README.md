# NEXORA ERP — Wholesale Operations & Customer Management Portal

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**NEXORA ERP** is a full-stack, production-styled Mini ERP + CRM Operations Portal built for wholesale and distribution enterprises. It features robust REST APIs, strict JWT authentication with Role-Based Access Control (RBAC), Prisma database transactions for critical stock control, sequential challan numbering, and a responsive admin UI dashboard.

---

## 🚀 Key Features & Modules

- **Authentication & RBAC**: JWT authentication with password hashing via `bcryptjs`. Express authorization middleware enforcing permissions across 4 roles: `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
- **Customer CRM**: Complete customer management with search, filters (Status & Customer Type), pagination, follow-up timeline history, and interaction notes logging.
- **Product Catalog**: Stock tracking with visual status badges (`LOW STOCK` vs `IN STOCK`), SKU uniqueness, category filters, and location tracking.
- **Inventory Operations**: Manual Stock IN / OUT adjustments with mandatory movement reason audit logging. Detailed Stock Movement Audit History log.
- **Critical Stock Business Logic**:
  - **Transaction-Safe Stock Verification**: When a sales challan transitions from `DRAFT` to `CONFIRMED`, the backend executes a Prisma `$transaction`. Stock for *every* item is checked. If stock is insufficient, the transaction rolls back immediately and returns HTTP `400 Bad Request`.
  - **Stock OUT Movement Log**: Upon confirmation, inventory stock is decremented and an `OUT` movement is recorded.
  - **Stock Restoration on Cancellation**: Cancelling a confirmed challan restores inventory stock and logs an `IN` stock movement with reason `Challan cancellation: CH-YYYY-XXXXX`.
  - **Product Snapshot Preservation**: `ChallanItem` preserves `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` so subsequent product price changes or catalog updates never distort historical invoices.
  - **Atomic Challan Numbering**: Transaction-safe sequence counter model (`CH-2026-00001`) prevents race conditions and duplicate challan numbers.
- **Printable Challan View**: Professional document layout with item snapshots, customer GST details, totals, and `window.print()` support.
- **Analytics & Reports**: Real-time sales revenue, inventory valuation, top customers, and low stock audit lists.

---

## 🔑 Demo User Credentials

The application is seeded with 4 realistic role-based accounts (all passwords default to standard hashed format):

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **ADMIN** | `admin@nexora.com` | `Admin@123` | Full access (Dashboard, Customers, Products, Inventory, Challans, Reports, Users) |
| **SALES** | `sales@nexora.com` | `Sales@123` | Customers (View/Add/Edit/Follow-up), Products (View), Challans (View/Create/Confirm/Cancel) |
| **WAREHOUSE** | `warehouse@nexora.com` | `Warehouse@123` | Products (View/Add/Edit), Inventory (Stock IN/OUT, Movements), Confirmed Challans (View) |
| **ACCOUNTS** | `accounts@nexora.com` | `Accounts@123` | Customers (View), Confirmed Challans (View), Reports & Analytics (View) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with Authorization interceptors

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database ORM**: Prisma ORM with PostgreSQL
- **Security**: JWT, bcryptjs, Helmet, CORS
- **Validation**: Zod request body validation

---

## 📂 Project Monorepo Structure

```
mini-erp-crm/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Badge, Button, Input, Modal, Table, etc.)
│   │   ├── context/          # AuthContext & ToastContext
│   │   ├── layouts/          # DashboardLayout with role-based navigation sidebar
│   │   ├── pages/            # Login, Dashboard, Customers, CustomerDetail, Products, Inventory, Challans, CreateChallan, ChallanDetail, Reports, Users
│   │   ├── services/         # Axios API client
│   │   ├── types/            # TypeScript domain interfaces
│   │   └── App.tsx           # React Router declarations with Protected & Role routes
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── config/           # Environment variables configuration
│   │   ├── controllers/      # Express controllers (Auth, Customer, Product, Inventory, Challan, Report, User)
│   │   ├── middleware/       # Auth verification, RBAC, Zod validation, Error handler
│   │   ├── routes/           # REST API routes
│   │   ├── services/         # Core business logic & database transactions
│   │   ├── validators/       # Zod schemas
│   │   ├── utils/            # JWT, Prisma client, ApiError
│   │   └── app.ts / server.ts
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL database models
│   │   └── seed.ts           # Realistic wholesale seed script
│   ├── tests/                # Jest / Supertest integration tests
│   ├── package.json
│   └── Dockerfile
│
├── postman/
│   └── Nexora-ERP.postman_collection.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup Guide

### Method A: Using Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/your-repo/mini-erp-crm.git
   cd mini-erp-crm
   ```

2. Spin up PostgreSQL, Backend, and Frontend containers:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

### Method B: Manual Local Development Setup

#### Prerequisites
- Node.js v18+
- PostgreSQL database running locally (or via Docker)

#### 1. Setup Backend
```bash
cd backend
npm install
```

Configure `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=nexora_erp_super_secret_jwt_key_2026
DATABASE_URL=postgresql://nexora_user:nexora_password@localhost:5432/nexora_db?schema=public
FRONTEND_URL=http://localhost:5173
```

Push Prisma schema and seed database:
```bash
npx prisma db push
npm run seed
```

Start backend server:
```bash
npm run dev
```

#### 2. Run Backend Tests
```bash
npm test
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📮 Postman Collection

Import `postman/Nexora-ERP.postman_collection.json` into Postman.
- Set collection variable `baseUrl`: `http://localhost:5000/api`
- Run **Authentication -> Login (Admin)** request to automatically set `authToken` collection variable.

---

## 🚢 Production Deployment

- **Frontend (Vercel / Netlify)**: Build setting: `npm run build` in `frontend/`. Set `VITE_API_BASE_URL=https://your-backend.render.com/api`.
- **Backend (Render / Railway)**: Environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`. Build command: `npm run build`. Start command: `npm start`.
- **Database (Neon / Supabase)**: PostgreSQL database hosted on Neon or Supabase.

---

## 📝 Business Flow Demonstration Walkthrough

1. **Login**: Use One-Click Demo Personas (`Sales` or `Admin`).
2. **Customer CRM**: Navigate to Customers CRM, create a new customer account, and log a follow-up note.
3. **Products**: Check catalog, view low stock alerts.
4. **Draft Sales Challan**: Create a sales challan. Attempt to confirm when quantity exceeds stock -> observe HTTP `400 Bad Request` rejection banner.
5. **Stock Confirmation**: Reduce quantity to available stock and click **Confirm Challan**. Observe stock deduction and `OUT` movement log in Inventory Audit Logs.
6. **Cancellation**: Click **Cancel Challan** -> observe inventory stock restoration and `IN` movement log.
