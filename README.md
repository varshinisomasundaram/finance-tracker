# Finance Tracker

A full-stack personal finance tracking application for managing net worth, assets, liabilities, transactions, and budgets. Designed to be self-hosted and shared across multiple users (family/friends).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API** | Fastify v4, TypeScript, Zod, JWT |
| **ORM** | Prisma v5 + PostgreSQL |
| **Caching** | Redis (ioredis) — optional |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Server State** | TanStack Query v5 |
| **Client State** | Zustand v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **API Docs** | Swagger UI (`@fastify/swagger`) |
| **Tests (API)** | Jest + Supertest |
| **Tests (Web)** | Vitest + React Testing Library |

---

## Architecture Diagrams

Interactive diagrams on Whimsical (HLD, LLD, Prisma ER, and JWT Auth sequence):

🔗 **[Finance Tracker — System Architecture](https://whimsical.com/nrxd/finance-tracker-architecture-URM5kQXxPH5CudN5DJSkxq)**

Includes:
- **HLD** — three-tier system overview (Frontend → Backend → Data)
- **LLD** — request/response flow with auth, caching, rate limiting
- **Prisma ER** — all 13 models with relationships and cascade rules
- **Auth Sequence** — JWT login + silent refresh flow

---

## Monorepo Structure

```
finance-tracker/
├── apps/
│   ├── api/                     # Fastify backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Database schema
│   │   │   └── seed.ts          # Seeds 35 system categories
│   │   ├── src/
│   │   │   ├── config/          # Singletons: env, database, redis, logger
│   │   │   ├── middleware/      # errorHandler, authenticate, rateLimiter
│   │   │   ├── modules/         # Feature modules (auth, accounts, assets…)
│   │   │   │   └── {module}/
│   │   │   │       ├── {module}.schema.ts      # Zod schemas + TS types
│   │   │   │       ├── {module}.repository.ts  # Prisma queries
│   │   │   │       ├── {module}.service.ts     # Business logic + caching
│   │   │   │       └── {module}.routes.ts      # Fastify route handlers
│   │   │   ├── plugins/         # swagger, jwt, cors (all fp() wrapped)
│   │   │   ├── types/           # fastify.d.ts module augmentation
│   │   │   ├── utils/           # errors, pagination, cache
│   │   │   ├── app.ts           # buildApp() — registers plugins + routes
│   │   │   └── server.ts        # Entry point — DB/Redis connect, listen
│   │   ├── tests/
│   │   │   ├── helpers/         # factories, globalSetup, globalTeardown
│   │   │   ├── integration/     # Full HTTP tests (auth, accounts)
│   │   │   └── unit/            # Mocked service tests (auth, accounts)
│   │   ├── .env.example
│   │   └── package.json
│   └── web/                     # React + Vite frontend
│       ├── src/
│       │   ├── components/ui/   # shadcn/ui components
│       │   ├── hooks/           # TanStack Query wrappers
│       │   ├── lib/             # axios client, queryClient, utils
│       │   ├── pages/           # LoginPage, RegisterPage, OverviewPage…
│       │   ├── services/        # Typed API service functions
│       │   ├── store/           # Zustand auth store
│       │   ├── types/           # Shared TypeScript interfaces
│       │   └── App.tsx          # Routes + auth guards
│       └── package.json
├── docker-compose.yml           # postgres + redis + api + web
└── package.json                 # npm workspaces root
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js v18+
- PostgreSQL 14+ (running locally or via Docker)
- Redis (optional — enables caching and rate limiting)

### 1. Install dependencies

```bash
npm install
```

> This installs all workspace dependencies (API + Web) via npm workspaces.

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_tracker"
JWT_SECRET="<random-string-min-32-chars>"
JWT_REFRESH_SECRET="<another-random-string-min-32-chars>"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
LOG_LEVEL="info"
CORS_ORIGIN="http://localhost:5173"

# Optional — enables caching and rate limiting
# If set but Redis is not running, the server will log a warning and continue without Redis.
# If not set or empty, Redis is completely skipped (no connection attempt).
# REDIS_URL="redis://localhost:6379"
```

Generate secure JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the database

```bash
psql -U postgres -c "CREATE DATABASE finance_tracker;"
```

### 4. Run migrations and seed

```bash
cd apps/api
npm run db:migrate:deploy   # applies all migrations (safe, no reset prompt)
npm run db:seed             # seeds 35 system categories (safe, uses upsert)
cd ../..
```

### 5. (Optional) Load demo data

```bash
cd apps/api
npm run db:seed:demo  # creates demo user with realistic Indian finance data
```

Demo credentials: `demo@fintracker.app` / `Demo@1234`

> **Note:** `db:seed:demo` deletes and recreates the demo user every time — existing demo data is replaced. Your own registered accounts are unaffected.

---

## Starting the Application

### Option 1: Single command (recommended for local dev)

From the **project root**:

```bash
npm run dev
```

This starts **both** services in one terminal using `concurrently`:
- `[api]` Fastify backend on `http://localhost:3001` (via nodemon, auto-reloads on changes)
- `[web]` Vite dev server on `http://localhost:5173` (with HMR)

Output is prefixed with `[api]` (blue) and `[web]` (green) labels for easy identification.

### Option 2: Separate terminals

```bash
# Terminal 1 — API
cd apps/api && npm run dev     # http://localhost:3001

# Terminal 2 — Web
cd apps/web && npm run dev     # http://localhost:5173
```

### Option 3: Docker (full stack)

```bash
# Copy env file first
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your JWT secrets, then:

docker compose up --build
```

This spins up the entire stack:

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| PostgreSQL | `finance_tracker_db` | 5432 | Database (persisted to volume) |
| Redis | `finance_tracker_redis` | 6379 | Cache (persisted to volume) |
| API | `finance_tracker_api` | 3001 | Fastify backend |
| Web | `finance_tracker_web` | 80 | React app (Nginx) |

To stop: `docker compose down` (data persists in volumes).
To wipe volumes: `docker compose down -v` (deletes all data).

### Key URLs

| URL | Description |
|---|---|
| `http://localhost:5173` | Web application (dev) / `http://localhost` (Docker) |
| `http://localhost:3001/health` | API health check (DB + Redis status) |
| `http://localhost:3001/docs/` | Swagger UI — interactive API docs |

> **Note:** Access Swagger with a trailing slash: `http://localhost:3001/docs/`

---

## Redis Behavior

Redis is **fully optional**. The server handles three scenarios gracefully:

| Scenario | Behavior |
|----------|----------|
| `REDIS_URL` not set or empty | Server starts without Redis. No connection attempt. Logs: `ℹ️ Redis not configured — running without Redis` |
| `REDIS_URL` set, Redis running | Server connects to Redis. Caching and rate limiting enabled. Logs: `✅ Redis connected` |
| `REDIS_URL` set, Redis NOT running | Server logs a warning and continues without Redis. Caching disabled, rate limiting falls back to in-memory. Logs: `⚠️ Redis connection failed — running without Redis` |

The server **never crashes** due to Redis being unavailable. You can safely set `REDIS_URL` in your `.env` and start/stop Redis independently without affecting the API.

---

## Database Commands — Safe vs Destructive

| Command | Safe? | What it does |
|---|---|---|
| `npm run db:migrate:deploy` | ✅ **Safe** | Applies pending migrations without resetting. Use in production or after pulling new schema changes. |
| `npm run db:seed` | ✅ **Safe** | Upserts 35 system categories only. Never touches user data. |
| `npm run db:generate` | ✅ **Safe** | Regenerates Prisma client from schema. No DB changes. |
| `npm run db:studio` | ✅ **Safe** | Opens Prisma Studio GUI (read/write via UI). |
| `npm run db:migrate` | ⚠️ **Caution** | `prisma migrate dev` — applies new migrations but **can prompt to reset** if it detects schema drift. Always check the prompt before confirming. |
| `npm run db:seed:demo` | ⚠️ **Caution** | Deletes and recreates the `demo@fintracker.app` user. Your own user accounts are unaffected. |
| `npm run db:reset` | ❌ **Destructive** | Drops the entire database, re-runs all migrations, re-seeds. **All user data is permanently deleted.** |

> **Rule of thumb:** After pulling code with schema changes, run `db:migrate:deploy` (not `db:migrate`) to safely apply migrations without the reset prompt. Then run `db:seed` and optionally `db:seed:demo`.

---

## Running Tests

```bash
cd apps/api

npm run test              # all tests
npm run test:unit         # unit tests only (no DB needed)
npm run test:integration  # integration tests (requires PostgreSQL)
npm run test:coverage     # with coverage report
```

For integration tests, a separate test database is recommended:

```bash
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/finance_tracker_test" npm run test:integration
```

---

## API Modules

| Module | Prefix | Description |
|---|---|---|
| Auth | `POST /api/auth/register` | Register, login, refresh, logout |
| Users | `GET /api/users/me` | Profile, update, change password, delete account |
| Accounts | `/api/accounts` | Bank/investment accounts CRUD |
| Assets | `/api/assets` | Assets CRUD — 14 types incl. mutual fund, gold, PPF, govt schemes |
| Liabilities | `/api/liabilities` | Debts CRUD — 10 types incl. gold loan, two-wheeler, informal debt |
| Insurance | `/api/insurance` | Insurance policies CRUD + annual premium aggregation |
| Transactions | `/api/transactions` | CRUD + filters + pagination + monthly summary |
| Categories | `/api/categories` | System categories + custom user categories |
| Net Worth | `/api/networth` | Current snapshot, history, manual snapshot |
| Goals | `/api/goals` | Financial goals CRUD — 6 types with progress % tracking |
| Budgets | `/api/budgets` | Monthly/annual budget CRUD — linked to category, filtered by month/year |

All protected endpoints require `Authorization: Bearer <accessToken>` header.

---

## Authentication Flow

1. `POST /api/auth/register` or `POST /api/auth/login` → returns `accessToken` (15 min) + `refreshToken` (7 days)
2. Include `Authorization: Bearer <accessToken>` on every protected request
3. On 401, call `POST /api/auth/refresh` with `{ refreshToken }` to get a new `accessToken`
4. The web app handles this silently via an axios interceptor

Refresh tokens are stored hashed (SHA-256) in the database. Every device gets its own token. `DELETE /api/auth/logout-all` revokes all devices.

---

## Redis (Optional)

Redis is fully optional. When `REDIS_URL` is not set, the app runs without caching and rate limiting degrades to an in-memory fallback.

**What Redis enables:**

| Feature | TTL | Keys |
|---|---|---|
| Net worth current | 60s | `networth:{userId}:current` |
| Net worth history | 5m | `networth:{userId}:history` |
| Account list | 5m | `accounts:{userId}:list` |
| Asset/Liability lists | 15m | `assets:{userId}:list`, etc. |
| Insurance list | 15m | `insurance:{userId}:list` |
| Category list | 15m | `categories:{userId}:list` |
| Goals list | 15m | `goals:{userId}:list` |
| Budgets list | 15m | `budgets:{userId}:list` |
| Rate limiting (login) | 1m window | 10 req/min per IP |
| Rate limiting (register) | 1m window | 5 req/min per IP |

Cache is automatically invalidated on any write (create/update/delete). Assets and liabilities also invalidate `networth:current` on mutation.

---

## Database Schema Overview

```
User (currency default: INR)
 ├── RefreshToken      (auth sessions)
 ├── Account           (CHECKING, SAVINGS, INVESTMENT, CRYPTO, CASH, OTHER)
 ├── Asset             (14 types: REAL_ESTATE, VEHICLE, EQUITY, MUTUAL_FUND, GOLD,
 │                      PROVIDENT_FUND, GOVERNMENT_SCHEME, RETIREMENT, SAVINGS, CASH,
 │                      INSURANCE_POLICY, CRYPTO, BUSINESS, OTHER)
 │                     optional fields: investmentStrategy, targetDate, quantity
 ├── Liability         (10 types: MORTGAGE, CAR_LOAN, TWO_WHEELER_LOAN, STUDENT_LOAN,
 │                      PERSONAL_LOAN, GOLD_LOAN, CREDIT_CARD, MEDICAL, INFORMAL_DEBT, OTHER)
 ├── Insurance         (8 types: TERM_LIFE, HEALTH, VEHICLE_TWO_WHEELER, VEHICLE_FOUR_WHEELER,
 │                      ENDOWMENT, ULIP, HOME, OTHER)
 │                     fields: provider, policyNumber, premiumAmount, premiumFrequency,
 │                             sumInsured, startDate, renewalDate, status, nominees
 ├── Category          (35 system + user-defined, INCOME/EXPENSE/TRANSFER)
 ├── Transaction       (linked to Account + Category)
 ├── Goal              (SAVINGS, DEBT_PAYOFF, INVESTMENT, EMERGENCY_FUND, PURCHASE, OTHER)
 ├── Budget            (linked to Category, MONTHLY/ANNUAL)
 ├── NetWorthSnapshot  (point-in-time net worth record)
 └── ImportSession     (CSV import tracking)
```

All IDs use CUID. Decimal fields use `Decimal(15,2)` for precision. All timestamps in ISO 8601.

---

## Architecture Decisions

### Why Zod over Joi?
- TypeScript-first: schema = type inference, no duplication
- Single source of truth: same schema used for validation, Swagger docs, and TypeScript types
- Works with React Hook Form via `@hookform/resolvers/zod`

### Why React + Vite over Next.js?
- App is auth-gated — no SEO benefit from SSR
- Already has a Fastify backend — no need for Next.js API routes
- Simpler mental model for a backend-focused developer

### Why the Singleton pattern for services?
- `ConfigService` validates all env vars at startup and exits on misconfiguration
- `DatabaseService` wraps PrismaClient (one connection pool per process)
- `RedisService` manages connection lifecycle and exposes health check

### Plugin architecture (fastify-plugin)
All Fastify plugins (`swaggerPlugin`, `corsPlugin`, `jwtPlugin`) are wrapped with `fp()` from `fastify-plugin`. This makes their decorations and hooks escape Fastify's encapsulation boundary and attach to the root instance, so all route scopes can use `fastify.authenticate`, the Zod validator compiler, and CORS hooks.

---

## Features

### Completed
- [x] Auth (register, login, refresh, logout + all devices)
- [x] Accounts management (bank, investment, wallet, cash)
- [x] Assets tracking (14 types, purchase price, gain/loss)
- [x] Liabilities tracking (10 types, interest rate, minimum payment)
- [x] Insurance policies (8 types, renewal reminders)
- [x] Transactions (income, expenses, filters, pagination, monthly summary)
- [x] Categories (35 system + user-defined)
- [x] Net Worth (current snapshot, history, manual snapshots)
- [x] Goals module (CRUD, 6 types, progress %, inflation calculator)
- [x] Budgets module (monthly/annual, linked to category)
- [x] Plan page — Goals and Budget tabs
- [x] Accounts management page in web UI
- [x] Settings page (profile, change password, delete account)
- [x] Income and Expense pages (pre-filtered transaction views)
- [x] Inflation calculator on Goals page
- [x] Loan EMI calculator on Liabilities page

### Planned
- [ ] CSV import wizard (column mapping, preview, batch insert)
- [ ] Insights / analytics page (spending trends, category breakdowns, asset allocation pie, insurance renewal calendar)
