# Node.js Full E-commerce API

A REST API for an e-commerce backend, built with **Node.js**, **Express 5** and **MongoDB**. It covers authentication, a products & categories catalog, a per-user shopping cart with stock checks, and transactional order processing.

## 📖 API Documentation

Interactive Swagger UI is served by the app itself — no extra tooling, no separate
docs site to keep in sync:

```
http://localhost:3000/api-docs
```

All **30 endpoints** are documented across 5 groups (Auth, Products, Categories,
Cart, Orders), each with its request body, every success code, and every error
code with the exact message the server returns.

| Resource | Link |
| --- | --- |
| Swagger UI | [`/api-docs`](http://localhost:3000/api-docs) |
| Raw OpenAPI spec | [`/api-docs/openapi.json`](http://localhost:3000/api-docs/openapi.json) |
| Spec source | [`docs/openapi.yaml`](docs/openapi.yaml) |

The spec is standard **OpenAPI 3.0.3** with no extensions, so it can be imported
straight into Postman, Insomnia, or any OpenAPI client:

```bash
npx openapi-generator-cli generate -i http://localhost:3000/api-docs/openapi.json -g typescript-fetch -o ./client
```

Use the **Authorize** button to paste an access token (from
`POST /api/auth/login`) and unlock the admin endpoints. Authorizations persist
across reloads.

📖 **[Full request & response examples →](docs/API_RESPONSES.md)**

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js (ESM) |
| Framework | Express `^5.2.1` |
| Database | MongoDB |
| ODM | Mongoose `^9.2.0` |
| Authentication | `jsonwebtoken` `^9.0.3` — JWT access + refresh tokens |
| Password hashing | `bcryptjs` `^3.0.3` |
| Validation | `express-validator` `^7.3.1` |
| CORS | `cors` `^2.8.6` |
| Cookies | `cookie-parser` `^1.4.7` |
| API docs | `swagger-ui-express` `^5.0.1` — Swagger UI at `/api-docs` |
| Environment | `dotenv` `^17.2.4` |
| Logging | `morgan` `^1.10.1` |
| Dev server | `nodemon` `^3.1.11` |

---

## File Structure

```
.
├── app.js                        # Express app assembly
├── server.js                     # Entry point: dotenv → connectDB → listen
│
├── docs/
│   ├── openapi.yaml                # OpenAPI 3.0.3 spec, served at /api-docs
│   └── API_RESPONSES.md            # Request & response examples
│
├── config/
│   └── database.js               # MongoDB connection
│
├── controllers/
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── categories.controller.js
│   ├── orders.contoller.js
│   └── products.controller.js
│
├── middlewares/
│   ├── index.js                  # Barrel export
│   ├── authorize.js              # JWT verification
│   ├── strict.js                 # Role-based access control (admin)
│   ├── validate.js               # Validation result collector
│   ├── error.js                  # Global error handler
│   ├── not-found.js              # Global 404 handler
│   └── ownership.js              # Ownership guard (unused)
│
├── models/
│   ├── index.js                  # Barrel export
│   ├── user.model.js
│   ├── category.model.js
│   ├── product.model.js
│   ├── cart.model.js
│   └── order.model.js
│
├── routes/
│   ├── index.js                  # Barrel export
│   ├── auth.route.js
│   ├── products.route.js
│   ├── categories.route.js
│   ├── cart.route.js
│   └── orders.route.js
│
├── services/
│   └── token.service.js          # JWT signing + token hashing
│
├── utils/
│   ├── index.js                  # Barrel export
│   ├── catch-async.js            # Async error wrapper
│   ├── http-error.js             # HttpError class
│   ├── http-status.js            # Response status strings
│   ├── filter-object.js          # Field whitelist (PATCH safety)
│   └── api-features.js           # Query builder (unused)
│
└── validations/
    ├── auth.validation.js
    ├── product.validation.js
    ├── category.validation.js
    ├── cart.validation.js
    ├── order.validation.js
    └── objectId.validation.js
```

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```bash
PORT=3000
DATABASE_URL=mongodb://127.0.0.1:27017/ecommerce
JWT_ACCESS_TOKEN_SECRET=your_long_random_secret
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_SECRET=another_long_random_secret
JWT_REFRESH_TOKEN_EXPIRY=7d
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Run MongoDB as a replica set

Order endpoints use transactions, which MongoDB only supports on a replica set:

```bash
mongod --dbpath /path/to/data --replSet rs0 --bind_ip 127.0.0.1
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
```

### 4. Start the server

```bash
npm run dev     # development, with nodemon
npm start       # production
```

### 5. Open the docs

```
http://localhost:3000/api-docs
```

The docs load whether or not MongoDB is reachable, so you can browse the spec
before wiring up a database.

---

## API Conventions

**Base URL:** `http://localhost:3000/api` (Swagger UI is mounted separately at `/api-docs`)

Authenticated endpoints need the header `Authorization: Bearer <accessToken>`.

| Access | Meaning |
| --- | --- |
| 🟢 Public | No token required |
| 🔵 User | Any logged-in user |
| 🟣 Admin | `role: "admin"` required |

### Authentication flow

```
register → login → (data.token used as Bearer on every request)
                    ↓
             refreshToken cookie set automatically
                    ↓
        when the access token expires, call POST /api/auth/refresh
        to get a new token pair (the old refresh token is invalidated)
```

Refresh tokens rotate on every use. Replaying an old one returns `401 Token reuse detected`.

> The refresh cookie is set with `secure: true`, so it is only sent over HTTPS. Use an HTTPS-capable local setup if you need to test `/api/auth/refresh`.

### Giving a user admin access

No endpoint creates admins. Promote one directly in the database:

```bash
mongosh "$DATABASE_URL" --eval 'db.users.updateOne({email:"you@mail.com"},{$set:{role:"admin"}})'
```

Log in again afterwards — the role is baked into the token.

---

## Routes

### Auth — `/api/auth`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 🟢 | Create an account |
| `POST` | `/api/auth/login` | 🟢 | Log in, receive a token pair |
| `POST` | `/api/auth/refresh` | 🟢 | Rotate the token pair |
| `POST` | `/api/auth/logout` | 🔵 | Invalidate the refresh token |

### Products — `/api/products`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/products` | 🔵 | List products (`page`, `limit`) |
| `POST` | `/api/products` | 🟣 | Create a product |
| `GET` | `/api/products/:id` | 🔵 | Get a product |
| `PATCH` | `/api/products/:id` | 🟣 | Update a product |
| `DELETE` | `/api/products/:id` | 🟣 | Delete a product |

### Categories — `/api/categories`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | 🔵 | List categories |
| `POST` | `/api/categories` | 🟣 | Create a category |
| `GET` | `/api/categories/:id` | 🔵 | Get a category |
| `PATCH` | `/api/categories/:id` | 🟣 | Update a category |
| `DELETE` | `/api/categories/:id` | 🟣 | Delete an empty category |
| `GET` | `/api/categories/:id/products` | 🔵 | List a category's products |

### Cart — `/api/cart`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/cart/items` | 🔵 | Add a product to the cart |
| `PATCH` | `/api/cart/items` | 🔵 | Set a product's quantity |
| `POST` | `/api/cart/items/decrease` | 🔵 | Decrease a product's quantity |
| `DELETE` | `/api/cart/items` | 🔵 | Remove a product from the cart |
| `GET` | `/api/cart` | 🔵 | Get your cart (`expand=products`) |
| `DELETE` | `/api/cart` | 🔵 | Empty your cart |
| `GET` | `/api/cart/admin` | 🟣 | List every cart |
| `GET` | `/api/cart/admin/:id` | 🟣 | Get a user's cart by user id |

### Orders — `/api/orders`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/orders` | 🔵 | List your orders |
| `POST` | `/api/orders` | 🔵 | Place an order |
| `GET` | `/api/orders/:id` | 🔵 | Get one of your orders |
| `PATCH` | `/api/orders/:id/cancel` | 🔵 | Cancel your order, restock |
| `GET` | `/api/orders/admin` | 🟣 | List every order |
| `PATCH` | `/api/orders/:id` | 🟣 | Change an order's status |
| `GET` | `/api/orders/admin/:id` | 🟣 | List a user's orders by user id |

---

## Order Status Flow

```
pending → confirmed → paid → processing → shipped → delivered
   │                                                  
   └──────────────── cancelled ────────────────┘
        (restores product stock)
```

`delivered` and `cancelled` are final — an order in either state cannot be changed or cancelled again.
