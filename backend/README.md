# PEDAL Backend (Go + Gin)

Features:
- JWT auth (scaffold), Argon2 hashing placeholder
- PostgreSQL (Neon) + Redis (Upstash)
- CORS, rate limiting, structured logging
- Prometheus metrics at `/metrics`
- Health at `/api/health`
- Admin dashboard at `/admin` and `/admin/stats`
- WebSocket at `/ws`

## Local Run
```
go mod tidy
cp .env.example .env
# set env vars in .env or your shell
go run .
```

## Deploy (Render)
- Create a new Web Service from this `backend` directory
- It will detect `render.yaml` or use:
  - Build: `go build -o server .`
  - Start: `./server`
- Set env vars (DATABASE_URL, REDIS_URL, JWT_SECRET, FRONTEND_ORIGIN)

