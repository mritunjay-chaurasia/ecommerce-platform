# ShopKart — Ecommerce Platform

Full-stack ecommerce application with a React storefront, Express API, and MongoDB.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Redux Toolkit, React Router, MUI, Tailwind |
| Backend | Express 5, Mongoose, Passport JWT, Joi, Nodemailer + EJS |
| Database | MongoDB |
| Shared | Pricing, order status, and validation constants |

## Prerequisites

- Node.js 18+
- MongoDB 6+

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API runs at `http://localhost:5000/api`.

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm start
```

App runs at `http://localhost:3000`.

## Tests

```bash
# Backend API + unit tests
cd backend
npm test

# Frontend tests
cd client
npm test
```

## Features

### Customer
- Product catalog, cart, coupons (login required for checkout)
- Orders, invoices, returns
- Wishlist, profile, addresses, reviews

### Admin
- Dashboard with sales charts and top products
- Users, products, inventory, categories, coupons, banners
- Orders, returns, reviews, store settings

## Production deployment

### Environment checklist

**Backend (`backend/.env`)**
- `NODE_ENV=production`
- `MONGO_URI` — production MongoDB connection string
- `JWT_SECRET` — at least 32 random characters
- `FRONTEND_URL` — public frontend origin (e.g. `https://shop.example.com`)
- `COOKIE_SECURE=true`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — for transactional email

**Frontend (`client/.env`)**
- `REACT_APP_BACKEND_URL` — public API URL (e.g. `https://api.shop.example.com/api`)

### Build frontend

```bash
cd client
npm run build
```

Serve the `client/build` folder with nginx, S3 + CloudFront, or similar.

### Run backend

```bash
cd backend
npm install --production
npm start
```

Optional: set `CLUSTER_WORKERS` to use multiple Node workers in production.

### Reverse proxy (nginx example)

```nginx
server {
    listen 80;
    server_name api.shop.example.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Uploads

Product images are stored in `backend/uploads/`. Persist this directory in production or migrate to object storage (S3, etc.).

## API overview

| Area | Base path |
|------|-----------|
| Health | `GET /api/health` |
| Auth | `/api/auth/*` |
| Store | `/api/products`, `/api/orders`, `/api/checkout/summary` |
| Returns | `POST /api/orders/:id/return-request`, `/api/admin/returns` |
| Invoices | `GET /api/orders/:id/invoice`, `/api/admin/orders/:id/invoice` |
| Admin | `/api/admin/*` |

## Project structure

```
ecommerce-platform/
├── backend/          # Express API
├── client/           # React SPA
├── shared/           # Shared constants and utilities
└── README.md
```
