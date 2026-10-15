# QueueLess — Smart Queue Management System

QueueLess is an AI-enhanced digital queue management platform designed to make waiting for everyday services more convenient.

Whether someone is visiting a clinic, a bank, or a college help desk, standing in a physical queue without knowing the expected waiting time can be frustrating. QueueLess addresses this problem by allowing customers to discover services, book digital tokens, and track their queue status while enterprises manage their queues through a dedicated dashboard.

The project combines a MERN-style web application with an AI assistant to provide a simple, centralized queue management experience.

## The Problem

Traditional queues often create unnecessary waiting, uncertainty, and manual coordination. Customers may not know how many people are ahead of them, while service providers need a convenient way to organize and update their queues.

## The Solution

QueueLess provides a digital alternative where:

- Customers can discover available services and book tokens online.
- Customers can check their token status and estimated waiting time.
- Enterprises can publish services and manage tokens as they move through the queue.
- An AI assistant can answer contextual questions about services and queue operations.
- Administrators can view basic platform statistics.

## Features

### Customer
- Register and log in securely.
- Browse and search the service directory.
- Book digital queue tokens.
- View personal tokens and their current status.
- Check estimated waiting times.
- Ask the AI assistant questions about available services.

### Enterprise
- Register and log in as a service provider.
- Publish services with relevant details.
- View tokens associated with enterprise queues.
- Update token status as customers are served.
- Use the AI assistant for operational guidance.

### Administrator
- Access the administrator dashboard.
- View platform statistics, including customer count, enterprise count, service count, waiting tokens, and total tokens.
- Use a dedicated administrator account created through the backend seed script.

### AI Assistant
- Uses Groq as the primary AI provider.
- Attempts Gemini as a fallback when the primary provider fails.
- Supports customer questions and enterprise operational queries.
- Keeps provider API keys on the backend.

### Queue Management
- Issues digital tokens to customers.
- Tracks token states such as `WAITING`, `SERVING`, and `COMPLETED`.
- Estimates waiting time using the number of active tokens ahead and the service's average duration.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| AI integration | Groq Cloud, Google Gemini |
| Development tools | npm, Git |

## Architecture

QueueLess follows a modular client-server architecture.

```text
                 ┌─────────────────────────┐
                 │      React Frontend     │
                 │      Vite + CSS         │
                 └────────────┬────────────┘
                              │
                         REST API
                              │
                 ┌────────────▼────────────┐
                 │    Express Backend      │
                 │                         │
                 │ Authentication & Roles  │
                 │ Services & Tokens       │
                 │ Admin Statistics        │
                 │ AI Assistant             │
                 └───────┬─────────┬───────┘
                         │         │
                  ┌──────▼─────┐  ┌▼────────────────┐
                  │  MongoDB   │  │  AI Providers    │
                  │            │  │  Groq / Gemini   │
                  └────────────┘  └─────────────────┘
```

The frontend communicates with the backend through REST API endpoints. The backend handles authentication, authorization, service operations, token management, database access, and AI requests.

## Getting Started

Follow these instructions to run QueueLess locally.

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection URI
- Groq and/or Gemini API keys for AI functionality

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd QueueLess
```

Replace the placeholder with your repository URL after publishing the project.

### 2. Configure environment variables

Create the backend environment file:

```bash
cp server/.env.example server/.env
```

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

Open `server/.env` and configure the required values:

- `JWT_SECRET`: use the generated secret.
- `ADMIN_EMAIL`: choose an administrator email.
- `ADMIN_PASSWORD`: choose a strong administrator password.
- `MONGODB_URI`: configure the MongoDB connection.
- `GROQ_API_KEY`: add your Groq API key if using Groq.
- `GEMINI_API_KEY`: add your Gemini API key if using Gemini fallback.

Use the variable names and any required model settings defined in `server/.env.example`.

**Important:** Never commit your real `.env` file or expose API keys in screenshots, source code, or public discussions.

### 3. Install dependencies

From the project root:

```bash
npm --prefix server install
npm --prefix client install
```

### 4. Start MongoDB

Ensure your local MongoDB service is running, or configure a valid MongoDB Atlas URI.

### 5. Create the administrator account

From the project root:

```bash
cd server
npm run seed:admin
```

The seed script creates the administrator account if it does not already exist. Running it again does not automatically reset an existing administrator's password.

Use a dedicated administrator email rather than an existing customer or enterprise account.

### 6. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend should connect to MongoDB and listen on port `5001` by default.

Health check:

```text
http://localhost:5001/api/health
```

### 7. Start the frontend

Open a second terminal at the project root:

```bash
cd client
npm run dev
```

Open the application:

```text
http://localhost:5173
```

The Vite development proxy forwards `/api` requests to the backend at `http://127.0.0.1:5001`.

## AI Configuration

QueueLess integrates two AI providers:

| Provider | Purpose |
|---|---|
| Groq Cloud | Primary provider |
| Google Gemini | Fallback provider |

Configure the API keys and model names using the variables supported by `server/.env.example`.

Obtain API keys from the providers' official consoles:

- [Groq API Keys](https://console.groq.com/keys)
- [Google AI Studio](https://aistudio.google.com/app/api-keys)

Model availability, quotas, and access restrictions may change. A valid API key does not guarantee that a particular model is available.

The assistant provides contextual guidance; it does not independently book tokens or modify queue records.

## Demo Workflow

To explore the main application flow:

1. Register an enterprise account.
2. Publish a service.
3. Register a customer account.
4. Search for the published service.
5. Book a digital token.
6. View the token and its estimated waiting time.
7. Sign in as the enterprise and update the token's status.
8. Test the AI assistant.
9. Sign in using the administrator credentials to view platform statistics.

## API Overview

The backend exposes the following main endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register/customer` | Register a customer |
| `POST` | `/api/auth/register/enterprise` | Register an enterprise |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/services` | List or search services |
| `GET` | `/api/services/mine` | View the enterprise's services |
| `POST` | `/api/services` | Publish a service |
| `POST` | `/api/tokens` | Book a token |
| `GET` | `/api/tokens/mine` | View customer tokens |
| `GET` | `/api/tokens/enterprise` | View enterprise tokens |
| `PATCH` | `/api/tokens/:id/status` | Update token status |
| `POST` | `/api/ai/chat` | Send a message to the AI assistant |
| `GET` | `/api/admin/stats` | Retrieve administrator statistics |
| `GET` | `/api/health` | Check backend health |

Some endpoints require authentication and role-based authorization.

## Current Limitations

QueueLess is a development and demonstration project, not a production-ready queue management service.

- Token numbering is simple and may encounter collisions during simultaneous bookings.
- Waiting-time estimates depend on the configured average service duration and active tokens ahead.
- The AI assistant provides guidance rather than performing queue operations.
- Retrieval-augmented generation (RAG) and vector database integration are not implemented.
- Email verification, password recovery, payment processing, QR check-in, real-time socket updates, and enterprise approval workflows are not implemented in this version.
- The application has not undergone a production security audit.

## Future Scope

Potential improvements include:

- Real-time queue updates using WebSockets.
- More accurate waiting-time predictions based on historical service data.
- Priority-based queue handling.
- QR-code check-in.
- Email and notification integration.
- Expanded administrator controls for managing users, enterprises, services, and tokens.
- Retrieval-augmented generation for answers grounded in service documentation.
- Automated tests, monitoring, and production deployment.

These are proposed improvements, not claims about currently implemented features.

## Project Status

QueueLess is an evolving project focused on digital queue management, role-based workflows, and AI-assisted service discovery.

The current implementation provides a foundation that can be extended with real-time updates, more advanced queue scheduling, and stronger administrative controls.

## License

No license has been specified yet. Add a license before allowing others to reuse or redistribute the project.