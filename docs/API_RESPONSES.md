# API Responses

Full request and response examples for every endpoint.

- **Base URL:** `http://localhost:3000/api`
- **Authenticated requests** need the header `Authorization: Bearer <accessToken>`
- Get a token from [`POST /api/auth/login`](#post-apiauthlogin)

| Access | Meaning |
| --- | --- |
| 🟢 Public | No token required |
| 🔵 User | Any logged-in user |
| 🟣 Admin | `role: "admin"` required |

**Contents:** [Auth](#auth) · [Products](#products) · [Categories](#categories) · [Cart](#cart) · [Orders](#orders)

---

## Response format

Every response uses one of these three shapes.

```jsonc
// Success
{ "status": "success", "message": "...", "data": { } }

// Error
{ "status": "fail", "message": "Product not found" }

// Validation error — all failing rules collected
{ "status": "error", "message": "Data Validation Error", "data": { "errors": ["...", "..."] } }
```

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Created |
| `204` | No content (logout) |
| `400` | Bad request / validation failed |
| `401` | Unauthorized — missing, invalid or expired token |
| `403` | Forbidden — wrong role, or not your resource |
| `404` | Not found |
| `500` | Internal server error |

---

## Auth

### 🟢 `POST /api/auth/register`

**Body:** `username` (3–20) · `email` (valid) · `password` (min 8)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "username": "you", "email": "you@mail.com", "password": "supersecret123" }'
```

✅ **201 Created**
```json
{ "status": "success", "message": "User registered successfully" }
```

❌ **401 Unauthorized** — email already registered
```json
{ "status": "fail", "message": "User already exists" }
```

❌ **400 Bad Request**
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["Username must be between 3 and 20 characters long"] }
}
```

---

### 🟢 `POST /api/auth/login`

**Body:** `email` · `password`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{ "email": "you@mail.com", "password": "supersecret123" }'
```

✅ **200 OK** — access token in the body, refresh token in the `Set-Cookie` header
```json
{
  "status": "success",
  "message": "User logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6a1f...",
      "role": "user",
      "email": "you@mail.com",
      "username": "you"
    }
  }
}
```

❌ **401 Unauthorized** — wrong password
```json
{ "status": "fail", "message": "Invalid credentials" }
```

❌ **404 Not Found** — no account with that email
```json
{ "status": "fail", "message": "Invalid credentials" }
```

---

### 🟢 `POST /api/auth/refresh`

No body — the browser sends the `refreshToken` cookie automatically.

```bash
curl -X POST http://localhost:3000/api/auth/refresh -b cookies.txt -c cookies.txt
```

✅ **200 OK** — a new token pair; the old refresh token is now invalid
```json
{
  "status": "success",
  "message": "Token has updated been successfully",
  "data": { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
}
```

❌ **401 Unauthorized** — no cookie sent
```json
{ "status": "fail", "message": "You need to login first" }
```

❌ **401 Unauthorized** — replaying an already-rotated token
```json
{ "status": "fail", "message": "Token reuse detected" }
```

---

### 🔵 `POST /api/auth/logout`

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>" -b cookies.txt
```

✅ **204 No Content** — empty body, cookie cleared

❌ **401 Unauthorized**
```json
{ "status": "fail", "message": "You need to login first" }
```

---

## Products

### 🔵 `GET /api/products`

**Query:** `page` (default 1) · `limit` (default 10)

```bash
curl "http://localhost:3000/api/products?page=1&limit=20" \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "6a1e...",
      "name": "Wireless Headphones",
      "description": "Over-ear, 30h battery.",
      "price": 199.99,
      "stock": 42,
      "image": "https://cdn.example.com/headphones.jpg",
      "category": "6a1c...",
      "createdAt": "2026-03-08T10:12:00.000Z",
      "updatedAt": "2026-03-08T10:12:00.000Z"
    }
  ]
}
```

❌ **401 Unauthorized**
```json
{ "status": "fail", "message": "No token provided" }
```

---

### 🟣 `POST /api/products`

**Body:** `name` (3–50) · `description` (3–500) · `price` (≥ 0) · `stock` (integer ≥ 0) · `image` (URL string) · `category` (ObjectId)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{
    "name": "Wireless Headphones",
    "description": "Over-ear, 30h battery.",
    "price": 199.99,
    "stock": 42,
    "image": "https://cdn.example.com/headphones.jpg",
    "category": "<categoryId>"
  }'
```

✅ **201 Created**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": { "_id": "6a1e...", "name": "Wireless Headphones", "price": 199.99, "stock": 42 }
}
```

❌ **403 Forbidden** — logged in as a regular user
```json
{ "status": "fail", "message": "You do not have permission to perform this action" }
```

❌ **400 Bad Request**
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["Name is required", "Price must be a number ≥ 0"] }
}
```

---

### 🔵 `GET /api/products/:id`

```bash
curl http://localhost:3000/api/products/<productId> \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": { "_id": "6a1e...", "name": "Wireless Headphones", "price": 199.99, "stock": 42 }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not found" }
```

❌ **400 Bad Request** — malformed id
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["id must be a valid MongoDB ObjectId"] }
}
```

---

### 🟣 `PATCH /api/products/:id`

**Body:** any of `name`, `description`, `price`, `stock`, `image`, `category`. At least one field is required; other keys are ignored.

```bash
curl -X PATCH http://localhost:3000/api/products/<productId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{ "price": 149.99, "stock": 60 }'
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": { "_id": "6a1e...", "price": 149.99, "stock": 60 }
}
```

❌ **400 Bad Request** — empty body
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["No Data Provided, at least one field is required"] }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not found" }
```

---

### 🟣 `DELETE /api/products/:id`

```bash
curl -X DELETE http://localhost:3000/api/products/<productId> \
  -H "Authorization: Bearer <adminToken>"
```

✅ **200 OK**
```json
{ "status": "success", "message": "Product deleted successfully" }
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not found" }
```

---

## Categories

### 🔵 `GET /api/categories`

```bash
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "6a1c...",
      "name": "Electronics",
      "description": "Phones, laptops and audio.",
      "createdAt": "2026-03-08T10:00:00.000Z"
    }
  ]
}
```

❌ **401 Unauthorized**
```json
{ "status": "fail", "message": "No token provided" }
```

---

### 🟣 `POST /api/categories`

**Body:** `name` (3–20, unique) · `description` (3–400)

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{ "name": "Electronics", "description": "Phones, laptops and audio." }'
```

✅ **201 Created**
```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": { "_id": "6a1c...", "name": "Electronics" }
}
```

❌ **401 Unauthorized** — name already taken
```json
{ "status": "fail", "message": "Category is already exists" }
```

---

### 🔵 `GET /api/categories/:id`

```bash
curl http://localhost:3000/api/categories/<categoryId> \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": { "_id": "6a1c...", "name": "Electronics", "description": "Phones, laptops and audio." }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Category not found" }
```

---

### 🟣 `PATCH /api/categories/:id`

**Body:** `name` and/or `description`. At least one is required.

```bash
curl -X PATCH http://localhost:3000/api/categories/<categoryId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{ "name": "Electronics & Gadgets" }'
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Category updated successfully",
  "data": { "_id": "6a1c...", "name": "Electronics & Gadgets" }
}
```

❌ **400 Bad Request**
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["No Data Provided, at least one field is required"] }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Category not found" }
```

---

### 🟣 `DELETE /api/categories/:id`

Only succeeds when the category holds no products.

```bash
curl -X DELETE http://localhost:3000/api/categories/<categoryId> \
  -H "Authorization: Bearer <adminToken>"
```

✅ **200 OK**
```json
{ "status": "success", "message": "Category deleted successfully" }
```

❌ **401 Unauthorized** — category still has products
```json
{ "status": "fail", "message": "Category must be has no products to delete" }
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Category Not Found" }
```

---

### 🔵 `GET /api/categories/:id/products`

```bash
curl http://localhost:3000/api/categories/<categoryId>/products \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [ { "_id": "6a1e...", "name": "Wireless Headphones", "category": "6a1c..." } ]
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Category not found" }
```

---

## Cart

All cart routes require authentication. Each user has exactly one cart, created automatically on the first item added.

### 🔵 `POST /api/cart/items`

**Body:** `productId` · `qty` (integer ≥ 1). Adds to the existing quantity if the product is already in the cart.

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{ "productId": "<productId>", "qty": 2 }'
```

✅ **201 Created**
```json
{
  "status": "success",
  "message": "Product added successfully",
  "data": {
    "_id": "6a20...",
    "items": [ { "productId": "6a1e...", "qty": 2 } ],
    "user": "6a1f..."
  }
}
```

❌ **400 Bad Request** — not enough stock
```json
{ "status": "fail", "message": "Product stock exceeded" }
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not found" }
```

---

### 🔵 `PATCH /api/cart/items`

**Body:** `productId` · `qty` — sets the absolute quantity.

```bash
curl -X PATCH http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{ "productId": "<productId>", "qty": 5 }'
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Cart updated successfully",
  "data": { "items": [ { "productId": "6a1e...", "qty": 5 } ], "user": "6a1f..." }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not in cart" }
```

---

### 🔵 `POST /api/cart/items/decrease`

**Body:** `productId` · `qty` — decrements, and removes the item entirely if the result is 0 or less.

```bash
curl -X POST http://localhost:3000/api/cart/items/decrease \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{ "productId": "<productId>", "qty": 1 }'
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Cart item quantity decreased successfully",
  "data": { "items": [ { "productId": "6a1e...", "qty": 1 } ], "user": "6a1f..." }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not in cart" }
```

---

### 🔵 `DELETE /api/cart/items`

**Body:** `{ "productId": "<ObjectId>" }`

```bash
curl -X DELETE http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{ "productId": "<productId>" }'
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Cart item removed successfully",
  "data": { "items": [], "user": "6a1f..." }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not in cart" }
```

---

### 🔵 `GET /api/cart`

**Query:** `expand=products` includes full product objects instead of bare ids.

```bash
curl "http://localhost:3000/api/cart?expand=products" \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": {
    "_id": "6a20...",
    "items": [
      {
        "productId": { "_id": "6a1e...", "name": "Wireless Headphones", "price": 199.99 },
        "qty": 2
      }
    ],
    "user": "6a1f..."
  }
}
```

❌ **404 Not Found** — no cart yet
```json
{ "status": "fail", "message": "Cart not found" }
```

---

### 🔵 `DELETE /api/cart`

Empties the cart but keeps the document.

```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Cart cleared successfully",
  "data": { "items": [], "user": "6a1f..." }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Cart not found" }
```

---

### 🟣 `GET /api/cart/admin`

Lists every cart, all users.

```bash
curl http://localhost:3000/api/cart/admin \
  -H "Authorization: Bearer <adminToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [ { "_id": "6a20...", "items": [], "user": "6a1f..." } ]
}
```

❌ **403 Forbidden**
```json
{ "status": "fail", "message": "You do not have permission to perform this action" }
```

---

### 🟣 `GET /api/cart/admin/:id`

`:id` is a **user** id.

```bash
curl http://localhost:3000/api/cart/admin/<userId> \
  -H "Authorization: Bearer <adminToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": {
    "_id": "6a20...",
    "items": [ { "productId": "6a1e...", "qty": 2 } ],
    "user": { "_id": "6a1f...", "username": "you", "role": "user" }
  }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Cart not found" }
```

❌ **403 Forbidden**
```json
{ "status": "fail", "message": "You do not have permission to perform this action" }
```

---

## Orders

All routes require authentication. Order writes run in a database transaction.

### 🔵 `GET /api/orders`

Returns your own orders.

```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "6a30...",
      "user": "6a1f...",
      "items": [ { "productId": "6a1e...", "qty": 2, "price": 199.99 } ],
      "subtotal": 399.98,
      "discount": 0,
      "total": 399.98,
      "status": "pending"
    }
  ]
}
```

❌ **401 Unauthorized**
```json
{ "status": "fail", "message": "No token provided" }
```

---

### 🔵 `POST /api/orders`

**Body:** `items` (1–20 entries, each with `productId` and `qty`) · `discount` (optional, ≥ 0)

Prices are read from the database — the client cannot set them. Stock is decremented atomically.

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "items": [
      { "productId": "<productId1>", "qty": 2 },
      { "productId": "<productId2>", "qty": 1 }
    ],
    "discount": 20
  }'
```

✅ **201 Created** — new orders always start at `pending`
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "_id": "6a30...",
    "items": [ { "productId": "6a1e...", "qty": 2, "price": 199.99 } ],
    "subtotal": 399.98,
    "discount": 20,
    "total": 379.98,
    "status": "pending"
  }
}
```

❌ **400 Bad Request** — not enough stock
```json
{ "status": "fail", "message": "Insufficient stock for Wireless Headphones" }
```

❌ **400 Bad Request**
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["Items must be a non-empty array between 1 and 20 items max"] }
}
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Product not found" }
```

---

### 🔵 `GET /api/orders/:id`

Only returns the order if you own it.

```bash
curl http://localhost:3000/api/orders/<orderId> \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": { "_id": "6a30...", "status": "shipped", "total": 379.98 }
}
```

❌ **403 Forbidden** — someone else's order
```json
{ "status": "fail", "message": "You don't have permission to access this order" }
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Order not found" }
```

---

### 🔵 `PATCH /api/orders/:id/cancel`

Cancels your order and restores the product stock.

```bash
curl -X PATCH http://localhost:3000/api/orders/<orderId>/cancel \
  -H "Authorization: Bearer <accessToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Order updated successfully",
  "data": { "_id": "6a30...", "status": "cancelled" }
}
```

❌ **400 Bad Request**
```json
{ "status": "fail", "message": "Order is already cancelled, you can't activate it again" }
```

❌ **400 Bad Request**
```json
{ "status": "fail", "message": "Order is already delivered, you can't update status again" }
```

❌ **404 Not Found**
```json
{ "status": "fail", "message": "Order not found" }
```

---

### 🟣 `GET /api/orders/admin`

Lists every order, all users.

```bash
curl http://localhost:3000/api/orders/admin \
  -H "Authorization: Bearer <adminToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [ { "_id": "6a30...", "user": "6a1f...", "status": "pending", "total": 379.98 } ]
}
```

❌ **403 Forbidden**
```json
{ "status": "fail", "message": "You do not have permission to perform this action" }
```

---

### 🟣 `PATCH /api/orders/:id`

**Body:** `status` — one of `pending`, `confirmed`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`

Setting it to `cancelled` restores product stock.

```bash
curl -X PATCH http://localhost:3000/api/orders/<orderId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{ "status": "shipped" }'
```

✅ **200 OK**
```json
{
  "status": "success",
  "message": "Order updated successfully",
  "data": { "_id": "6a30...", "status": "shipped" }
}
```

❌ **400 Bad Request** — status unchanged
```json
{ "status": "fail", "message": "order status is already shipped" }
```

❌ **400 Bad Request** — value outside the enum
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["Invalid order status. it must be one of these [pending, confirmed, paid, processing, shipped, delivered, cancelled]"] }
}
```

❌ **403 Forbidden**
```json
{ "status": "fail", "message": "You do not have permission to perform this action" }
```

---

### 🟣 `GET /api/orders/admin/:id`

`:id` is a **user** id. Returns that user's orders with the user populated (password excluded).

```bash
curl http://localhost:3000/api/orders/admin/<userId> \
  -H "Authorization: Bearer <adminToken>"
```

✅ **200 OK**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "6a30...",
      "status": "shipped",
      "user": { "_id": "6a1f...", "username": "you", "role": "user" }
    }
  ]
}
```

❌ **403 Forbidden**
```json
{ "status": "fail", "message": "You do not have permission to perform this action" }
```

❌ **400 Bad Request**
```json
{
  "status": "error",
  "message": "Data Validation Error",
  "data": { "errors": ["id must be a valid MongoDB ObjectId"] }
}
```
