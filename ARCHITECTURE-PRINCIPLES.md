# Architecture Principles — Production-Scale System Design

> **Purpose**: This document captures system design principles for building production-grade,
> large-scale applications. Copy this to any new project as a design reference.
>
> **How to use with Claude Code**: Copy this file to your project root, then add a rule file
> at `.claude/rules/architecture.md` that references these principles (or paste the content directly).
> Claude will follow them on every code change.

---

## Table of Contents
1. [DNS & Edge Layer](#1-dns--edge-layer)
2. [API Gateway & Load Balancing](#2-api-gateway--load-balancing)
3. [Service Architecture](#3-service-architecture)
4. [Caching Strategy](#4-caching-strategy)
5. [Database & Storage](#5-database--storage)
6. [Async Processing & Queues](#6-async-processing--queues)
7. [Fan-Out & Event-Driven Architecture](#7-fan-out--event-driven-architecture)
8. [Idempotency](#8-idempotency)
9. [Microservice Patterns](#9-microservice-patterns)
10. [Design Patterns](#10-design-patterns)
11. [Access Control](#11-access-control)
12. [Queue Technology Selection](#12-queue-technology-selection)
13. [AI/LLM Readiness](#13-aillm-readiness)
14. [Observability](#14-observability)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)

---

## 1. DNS & Edge Layer

**What**: The first hop of every user request — resolving your domain to an IP and routing to the nearest server.

**Key Decisions**:
- Use managed DNS (Route53, Cloudflare) with low TTLs for failover
- CDN (CloudFront, Cloudflare) for static assets — React bundles, images, fonts
- Geographic routing for multi-region: route users to nearest data center
- DDoS protection at edge (Cloudflare, AWS Shield)
- SSL/TLS termination at edge or load balancer level

**Architecture**:
```
User → DNS (Route53/Cloudflare) → CDN (static) → ALB (dynamic) → Services
```

---

## 2. API Gateway & Load Balancing

**What**: Single entry point that handles cross-cutting concerns before requests hit your services.

**Gateway Responsibilities**:
- Authentication/authorization (JWT validation)
- Rate limiting (per-user, per-IP, per-tier)
- Request routing to correct service
- Request/response transformation
- API versioning (`/api/v1/`, `/api/v2/`)
- Request correlation ID injection (X-Request-ID)
- Request logging and metrics

**Load Balancer**:
- Layer 7 (application) load balancer for HTTP routing
- Health check endpoints on every service (`/health`)
- Round-robin or least-connections algorithm
- No sticky sessions (services must be stateless)
- WebSocket support via separate gateway if needed

**Implementation Options**:
- Kong / Traefik / Nginx (self-hosted)
- AWS API Gateway / GCP Cloud Endpoints (managed)
- Fastify as gateway with `fastify-http-proxy` (lightweight)

---

## 3. Service Architecture

### Stateless Services
Every service instance must be interchangeable:
- No in-memory session state
- No local file storage (use S3/object storage)
- Config from environment, secrets from vault
- Any instance can handle any request

### Horizontal vs Vertical Scaling
| Approach | When | How |
|----------|------|-----|
| Vertical | Quick wins, single-instance services | Bigger machine (more CPU/RAM) |
| Horizontal | Production, multi-instance | More containers behind load balancer |

**Default to horizontal** — design for it from day one.

### Concurrency & Fault Tolerance
- Non-blocking I/O (Node.js event loop, async/await)
- Connection pooling for DB/Redis (bounded pool size)
- Bulkhead pattern: isolate resources per dependency
- Timeouts on every external call (never wait indefinitely)
- Graceful shutdown: drain connections, finish in-flight requests

### Service Communication
- Synchronous: REST/gRPC for request-response (user-facing)
- Asynchronous: message queue for fire-and-forget (background tasks)
- Event-driven: pub/sub for notifications across services

---

## 4. Caching Strategy

### Multi-Level Cache
```
Request → L1 (in-process) → L2 (Redis) → L3 (CDN) → Database
```

| Level | What | TTL | Use For |
|-------|------|-----|---------|
| L1 | In-process LRU (Map) | 1-10s | Hot config, feature flags, user session |
| L2 | Redis/Memcached | 1-15min | DB query results, computed aggregations |
| L3 | CDN/Edge | 1hr+ | Static assets, public API responses |

### Cache Patterns
- **Cache-Aside**: App checks cache → miss → query DB → write to cache
- **Write-Through**: Write to cache + DB simultaneously
- **Write-Behind**: Write to cache, async flush to DB (risky for financial data)
- **Event-Driven Invalidation**: DB change → publish event → subscribers clear cache

### Cache Invalidation Rules
- Financial data: short TTL (60s) or event-driven invalidation
- Lists/aggregates: medium TTL (5min) + invalidate on mutation
- Reference data (categories): long TTL (15min) + invalidate on edit
- Never cache: authentication tokens, one-time codes

---

## 5. Database & Storage

### SQL (PostgreSQL) — Source of Truth
- ACID transactions for financial operations
- Proper indexing strategy:
  - Single-column indexes on FK columns and frequent WHERE clauses
  - Composite indexes for multi-column queries `(userId, date)`, `(userId, type)`
  - Partial indexes for filtered queries `WHERE status = 'ACTIVE'`
- Connection pooling (PgBouncer or Prisma pool) — bounded max connections
- Read replicas for heavy read workloads

### NoSQL (when to add)
- Document store (MongoDB): flexible schema, rapid prototyping
- Key-value (Redis/DynamoDB): sessions, caching, rate limiting
- Wide-column (Cassandra): time-series data at massive scale
- Graph (Neo4j): relationship-heavy queries (social, recommendations)

### Object Storage (S3/GCS/MinIO)
- File uploads (CSV, PDF, images)
- Generated reports and exports
- Backup storage
- Use pre-signed URLs for secure client-side upload/download

### Sharding Strategy
- Start with single database + read replicas
- When to shard: >100M rows, >10K writes/sec, or multi-region requirements
- Shard key: `tenantId` or `userId` (keeps related data together)
- Avoid cross-shard queries — denormalize or use event-driven sync

### Replication & Consistency
- Synchronous replication for financial data (strong consistency)
- Asynchronous replication for analytics/search (eventual consistency)
- WAL (Write-Ahead Log) streaming for PostgreSQL replicas
- Conflict resolution: last-writer-wins for non-critical, merge for critical

---

## 6. Async Processing & Queues

### When to Use Async
- Operations >500ms (sending emails, generating reports)
- Fan-out to multiple services (event broadcasting)
- Rate-limited external APIs (batch processing)
- Non-critical side effects (analytics, audit logging)
- Scheduled/recurring tasks (daily snapshots, reminders)

### Queue Design Principles
- Every consumer is **idempotent** (safe to process same message twice)
- Every message has a unique `messageId` for deduplication
- Dead-letter queue (DLQ) for poison messages after N retries
- Retry with exponential backoff: 1s → 2s → 4s → 8s → 16s → DLQ
- Message TTL: discard stale messages that are no longer relevant
- Backpressure: if consumer can't keep up, slow down the producer

### Worker Pattern
```
Producer → Queue → Consumer (Worker)
                      ↓
              Process message
                      ↓
              Success? → ACK (remove from queue)
              Failure? → NACK + retry (or DLQ after max retries)
```

---

## 7. Fan-Out & Event-Driven Architecture

### Domain Events
Every significant state change emits a domain event:
```
transaction.created → { userId, transactionId, amount, category, timestamp }
asset.updated       → { userId, assetId, oldValue, newValue, timestamp }
user.registered     → { userId, email, plan, timestamp }
```

### Fan-Out Consumers (parallel, independent)
```
transaction.created
  ├── Search Indexing Service     → Update Elasticsearch/Typesense
  ├── Analytics Service           → Update spending aggregates
  ├── Notification Service        → Push notification / email alert
  ├── Budget Alert Service        → Check if budget exceeded
  ├── AI Categorization Service   → Auto-categorize if uncategorized
  └── NetWorth Recalculation      → Invalidate cached networth
```

Each consumer:
- Has its own failure isolation (one failing doesn't block others)
- Has its own retry policy and DLQ
- Can be scaled independently
- Can be added/removed without changing the producer

---

## 8. Idempotency

### Why It Matters
Network failures, retries, and duplicate messages are inevitable at scale.
Every write operation must produce the same result whether executed once or many times.

### Implementation Patterns

**Idempotency Key (for financial operations)**:
```typescript
// Client sends: X-Idempotency-Key: uuid-v4
// Server: check if key processed before → return cached result
// Server: if new → process → store result with key → return

interface IdempotencyRecord {
  key: string
  userId: string
  response: any
  statusCode: number
  createdAt: Date
  expiresAt: Date  // TTL: 24-72 hours
}
```

**Natural Idempotency**:
- GET, HEAD, OPTIONS — always idempotent
- PUT (full replace) — naturally idempotent
- DELETE (by ID) — naturally idempotent (deleting twice = same result)
- POST (create) — needs idempotency key OR unique constraint dedup

**Database-Level**:
- UPSERT (`INSERT ... ON CONFLICT UPDATE`) for upsert operations
- Unique constraints to prevent duplicates
- Optimistic locking (`version` field) to prevent lost updates

---

## 9. Microservice Patterns

### Circuit Breaker
```
CLOSED (normal) ──[failures > threshold]──→ OPEN (reject fast, return fallback)
                                              ↓ [timeout expires]
                                          HALF-OPEN (allow one request)
                                              ↓
                                    Success? → CLOSED
                                    Failure? → OPEN
```

Configuration:
- Failure threshold: 5 failures in 60 seconds
- Open duration: 30 seconds
- Half-open probes: 1 request

### Retry with Backoff
```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries) throw err
      await sleep(Math.pow(2, i) * 1000 + Math.random() * 1000) // jitter
    }
  }
}
```

### Bulkhead
- Isolate connection pools per dependency (DB pool, Redis pool, HTTP pool)
- If one dependency is slow/down, it doesn't exhaust resources for others
- Thread/worker isolation for CPU-intensive operations

### Saga Pattern (distributed transactions)
- For multi-service operations that need atomicity
- Each step has a compensating action (undo)
- Orchestration (central coordinator) or Choreography (event-driven)

### Service Discovery
- In Kubernetes: DNS-based service discovery (service-name.namespace.svc)
- In AWS: ALB target groups, Cloud Map
- Configuration: environment variables or config service

---

## 10. Design Patterns

### Creational
| Pattern | Use Case |
|---------|----------|
| **Singleton** | Config, DB connections, Logger — one instance per process |
| **Factory Method** | Create queue adapters, notification channels, storage providers based on config |
| **Builder** | Complex query construction, report generation, multi-step object creation |
| **Abstract Factory** | Create families of related objects (e.g., all AWS services vs all GCP services) |

### Structural
| Pattern | Use Case |
|---------|----------|
| **Adapter** | Wrap external services (Kafka/RabbitMQ/SQS) behind common interface |
| **Decorator** | Add caching, logging, retry, metrics to service methods without modifying them |
| **Facade** | Simplified API for complex subsystems (NetWorth = assets + liabilities + accounts) |
| **Proxy** | Lazy-loading, access control, circuit breaker wrapping |
| **Composite** | Permission trees, category hierarchies, nested UI structures |

### Behavioral
| Pattern | Use Case |
|---------|----------|
| **Observer** | Domain events — services subscribe to state changes |
| **Strategy** | Interchangeable algorithms (categorization, export formats, notification channels) |
| **Command** | Queued operations, undo/redo, audit trail |
| **Iterator** | Cursor-based pagination, streaming large datasets |
| **State** | Workflow states (import: pending→processing→completed→failed) |
| **Template Method** | Base repository with CRUD, modules extend with specifics |
| **Chain of Responsibility** | Middleware pipeline, validation chains, approval workflows |

---

## 11. Access Control

### RBAC (Role-Based Access Control)
Best for: clear organizational roles with predictable permission sets

```
Roles:        owner → admin → member → viewer → api_key
Permissions:  resource:create, resource:read, resource:update, resource:delete
              resource:read:own, resource:read:any (scope)
```

### ABAC (Attribute-Based Access Control)
Best for: dynamic rules based on context (time, plan, resource attributes)

```
Rules:
- user.plan == 'premium' AND resource.type == 'export' → ALLOW
- user.role == 'member' AND resource.owner == user.id → ALLOW
- time.hour < 9 OR time.hour > 17 → DENY (business hours only)
```

### ACL (Access Control List)
Best for: per-resource sharing (like Google Docs sharing)

```
Resource: Budget "Q1 Marketing"
ACL:
  - user:alice → read,write
  - user:bob → read
  - role:admin → read,write,delete
```

### Recommended Approach
Start with RBAC (simplest), layer ABAC rules for complex scenarios:

```typescript
// Middleware: verify role
const requireRole = (...roles: Role[]) => (req, reply) => {
  if (!roles.includes(req.user.role)) throw new ForbiddenError()
}

// Service: verify ownership + attributes
const canAccess = (user: User, resource: Resource, action: string): boolean => {
  if (user.role === 'owner' || user.role === 'admin') return true
  if (resource.userId === user.id) return true // own resources
  return checkACL(resource, user, action)
}
```

---

## 12. Queue Technology Selection

### Comparison

| Feature | Kafka | RabbitMQ | SQS |
|---------|-------|----------|-----|
| Throughput | Very high (millions/sec) | High (100K/sec) | High (managed) |
| Ordering | Per-partition | Per-queue | FIFO queues (limited) |
| Replay | Yes (log retention) | No (consumed = gone) | No |
| Routing | Topic-based | Complex routing rules | Simple |
| Ops complexity | High (ZooKeeper/KRaft) | Medium | Zero (serverless) |
| Latency | Low-medium | Very low | Medium |
| Best for | Event streaming, audit logs, analytics | Task queues, RPC, complex routing | AWS-native, serverless, simple queues |

### Pluggable Design (Adapter Pattern)

```typescript
// Core interface — business logic depends on THIS, never on a specific provider
interface IMessageBroker {
  publish(topic: string, message: DomainEvent, options?: PublishOptions): Promise<void>
  subscribe(topic: string, handler: EventHandler, options?: SubscribeOptions): Promise<void>
  unsubscribe(topic: string): Promise<void>
  healthCheck(): Promise<{ ok: boolean }>
}

// Config-driven selection
// QUEUE_PROVIDER=kafka → KafkaAdapter
// QUEUE_PROVIDER=rabbitmq → RabbitMQAdapter
// QUEUE_PROVIDER=sqs → SQSAdapter
// QUEUE_PROVIDER=memory → InMemoryAdapter (dev/test)

const broker = MessageBrokerFactory.create(config.get('QUEUE_PROVIDER'))
```

Switching providers = change one env var + deploy. Zero code changes in business logic.

---

## 13. AI/LLM Readiness

Design every module so AI can consume, extend, and enhance it:

### Data Layer
- All text fields (descriptions, notes, transaction names) → indexable for vector embeddings
- Structured, typed schemas everywhere (Zod) → LLMs parse reliably
- Audit trail with before/after state → AI can explain "what changed and why"
- Cursor-based pagination → AI agents can iterate without offset drift

### API Layer
- Full OpenAPI/Swagger documentation on every endpoint → AI agents call them directly
- Consistent response format `{ data, error, meta }` → predictable for LLM parsing
- Semantic endpoint naming → AI understands intent from URL alone
- Batch endpoints for bulk operations → AI processes efficiently

### Event Layer
- Domain events are structured and self-describing → AI subscribes like any other consumer
- Event payloads include full context (not just IDs) → AI doesn't need extra lookups
- AI services plug in as fan-out consumers → no changes to existing code

### Plugin Architecture
```
Core Service → publishes events → AI Consumer (pluggable)
                                     ├── Categorization (NLP/LLM)
                                     ├── Anomaly Detection (ML)
                                     ├── Forecasting (time-series ML)
                                     ├── Natural Language Queries (LLM)
                                     └── Smart Notifications (LLM reasoning)
```

Future AI capabilities are **consumers**, not modifications to core services.

---

## 14. Observability

### Three Pillars
1. **Logs**: Structured JSON, correlation IDs, severity levels
2. **Metrics**: Latency (p50/p95/p99), error rate, throughput, saturation
3. **Traces**: Distributed tracing across service boundaries (OpenTelemetry)

### Key Metrics to Track
- Request latency by endpoint (p50, p95, p99)
- Error rate by status code (4xx vs 5xx)
- Queue depth and consumer lag
- Cache hit ratio
- Database connection pool utilization
- Circuit breaker state changes

### Alerting Rules
- Error rate > 1% for 5 minutes → warn
- Error rate > 5% for 2 minutes → critical
- P99 latency > 2s → warn
- Queue depth growing for 10+ minutes → warn
- Circuit breaker OPEN → critical

---

## 15. Deployment & Infrastructure

### Containerization
- Every service has a Dockerfile (multi-stage build)
- Docker Compose for local development (all services + infra)
- Kubernetes/ECS for production orchestration

### Deployment Strategy
- Blue-green: instant rollback, zero downtime
- Canary: gradual rollout (5% → 25% → 50% → 100%)
- Feature flags: decouple deployment from release

### Database Migrations
- Run as pre-deploy hook (never in application startup)
- Must be backwards-compatible (old code still works with new schema)
- Never drop columns in the same release that stops reading them

### Environment Promotion
```
local → dev → staging → production
```
- Same Docker image across all environments
- Only configuration (env vars) changes between environments
- Staging mirrors production (same infra, smaller scale)

---

## Quick Reference: Code Change Checklist

Before merging any code:

- [ ] Stateless? (runs behind load balancer with N instances)
- [ ] Idempotent? (safe to retry/replay)
- [ ] Indexed? (new queries have proper DB indexes)
- [ ] Cached? (reads use cache-aside where beneficial)
- [ ] Resilient? (circuit breaker on external calls, graceful degradation)
- [ ] Observable? (structured logs, metrics, correlation ID)
- [ ] Secure? (auth + authz checked at service layer)
- [ ] Event-emitting? (domain events for fan-out consumers)
- [ ] Pluggable? (adapter interface for swappable implementations)
- [ ] AI-ready? (structured data, documented API, event-subscribable)

---

*Last updated: 2026-08-01*
*Applicable to: Any production-scale TypeScript/Node.js service*
