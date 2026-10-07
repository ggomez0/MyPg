# MyPg

PostgreSQL Backend-as-a-Service. Auto-generated REST API, auth, realtime, storage and admin dashboard.

## Quick Start

```bash
cp .env.example .env
docker compose up -d
```

Dashboard: http://localhost:3000  
API: http://localhost:4000

## Stack

| Layer | Tech |
|---|---|
| API | Hono + TypeScript |
| Dashboard | Next.js 15 + shadcn/ui |
| Database | PostgreSQL 16 |
| Storage | Local / MinIO (S3) |
| Auth | JWT + Argon2 |

## Features

- ✅ Auto-generated REST API from PostgreSQL tables
- ✅ Admin dashboard with schema editor (GUI + SQL)
- ✅ JWT authentication for dashboard + API users
- ✅ RBAC permissions per collection (public/user/admin roles)
- ✅ Row-Level Security (owner-only toggle per collection)
- ✅ Realtime via SSE (PostgreSQL LISTEN/NOTIFY)
- ✅ File storage (local or S3/MinIO)
- ✅ Request logs + metrics (Prometheus endpoint)
- ✅ Support for embedded PostgreSQL or external connection string

## API Quick Reference

```
POST   /api/admin/auth/login          # Admin login
POST   /api/auth/login                # API user login (X-API-Key required)

GET    /api/data/:collection          # List records
GET    /api/data/:collection/:id      # Get record
POST   /api/data/:collection          # Create record
PATCH  /api/data/:collection/:id      # Update record
DELETE /api/data/:collection/:id      # Delete record

GET    /api/realtime/:collection      # SSE stream
POST   /api/storage/upload            # Upload file

GET    /metrics                       # Prometheus metrics
```

## Query Parameters

```
GET /api/data/posts?filter[status]=published&sort=created_at:desc&page=1&perPage=20
GET /api/data/posts?filter[views][gt]=100&fields=id,title,views
```

## Development

```bash
pnpm install
pnpm dev
```
