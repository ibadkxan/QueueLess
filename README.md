# QueueLess — Clean Local Development Build

A readable, modular MERN-style project for an AI-enhanced digital queue and service discovery demo. This is a clean starter implementation, not a claim that the previous ZIP's code was already end-to-end tested.

## Features

- Customer and enterprise registration/login; administrator is created only by a private seed script.
- JWT authentication and role checks enforced by the backend.
- Enterprises publish services; customers search the published directory and book tokens.
- Enterprise queue view can mark tokens as serving or completed.
- Baseline estimated wait: active tokens ahead × service average duration.
- Contextual AI assistant for customers and enterprise operators (no RAG/vector database).
- Groq Cloud primary provider with Gemini API fallback.
- Readable multi-file React UI, Express routes, Mongoose models, and CSS.

## Requirements

- Node.js 20 or newer (your Node 25 should work; if any dependency compatibility issue occurs, use an active LTS version).
- MongoDB running locally or a MongoDB Atlas URI.
- Optional: Groq and Gemini API keys for AI chat.

## 1. Configure environment

From the project root:

```bash
cp server/.env.example server/.env
openssl rand -hex 32
```

Open `server/.env` and set a unique `JWT_SECRET` using the generated value. Set a private `ADMIN_PASSWORD` (at least 8 characters). Add provider keys if you want AI chat enabled. Do not commit `server/.env`.

The backend uses port **5001** by default. The Vite proxy is already configured to send `/api` requests to `http://127.0.0.1:5001`. The frontend uses port **5173**.

## 2. Install packages

Open a terminal at the project root:

```bash
npm --prefix server install
npm --prefix client install
```

## 3. Create the initial admin

Ensure MongoDB is running, then:

```bash
cd server
npm run seed:admin
```

The seed script creates the admin once. It does not reset the password on every run. If the email already belongs to a non-admin account, it promotes that account to ADMIN; use a dedicated admin email in `.env`.

## 4. Start the backend

From `server/`:

```bash
npm run dev
```

Expected startup messages include a successful MongoDB connection and `QueueLess listening at http://localhost:5001`.

Check health at `http://localhost:5001/api/health`.

## 5. Start the frontend

Open a second terminal at the project root:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## AI providers

- Groq key: https://console.groq.com/keys
- Gemini key: https://aistudio.google.com/app/api-keys

`GROQ_MODEL` and `GEMINI_MODEL` are configurable. Model availability can differ by account, region, quota, and provider lifecycle. If a model is rejected, choose a currently supported model in the provider's console/docs and update the `.env` value. The AI service sends plain text chat requests, not strict JSON schemas. Provider keys are only read by the server.

The server attempts Groq first and tries Gemini if Groq fails. If both fail, the UI shows a helpful error. A configured API key does not guarantee free quota or model access.

## Demo flow

1. Register an enterprise and publish a service.
2. Sign out and register a customer.
3. Search for that service and book a token.
4. Sign in as the enterprise and mark the token `SERVING`, then `COMPLETED`.
5. Test the customer assistant and enterprise operations assistant.
6. Sign in with the seeded admin credentials to view platform counts.

## API overview

- `POST /api/auth/register/customer`
- `POST /api/auth/register/enterprise`
- `POST /api/auth/login`
- `GET /api/services` (optional `?search=`)
- `GET /api/services/mine` (enterprise)
- `POST /api/services` (enterprise)
- `POST /api/tokens` (customer)
- `GET /api/tokens/mine` (customer)
- `GET /api/tokens/enterprise` (enterprise)
- `PATCH /api/tokens/:id/status`
- `POST /api/ai/chat` (customer or enterprise)
- `GET /api/admin/stats` (admin)
- `GET /api/health`

## Important limitations

- This is a demo-ready foundation; it has not been audited for production use.
- Token numbering is simple and may have concurrency collisions under simultaneous bookings; production should use an atomic counter per service/day.
- The AI assistant offers guidance only; it does not perform bookings or mutate queue data.
- No RAG, vector database, email verification, payment flow, QR check-in, realtime sockets, or enterprise approval workflow is implemented in this starter.
- For a public deployment, add stronger validation, password reset, account verification, audit logs, tests, and production security review.
