# SlotZero

Smart medical appointment scheduling built for the MedaVida Hackathon 2024.

## Stack

- **Frontend** React 18 with Vite
- **Backend** Node.js with Express
- **Database** MongoDB 7
- **Cache and Locking** Redis 7
- **Containerisation** Docker Compose

## Quick Start

```bash
# Clone and run everything with a single command
docker compose up --build
```

Frontend runs on http://localhost:3000  
Backend API runs on http://localhost:5000

## Demo Accounts

| Role    | Email              | Password    |
| ------- | ------------------ | ----------- |
| Doctor  | meera@slotzero.dev | demo1234    |
| Patient | asha@slotzero.dev  | demo1234    |

Run the seed script to create these accounts:

```bash
docker compose exec backend node src/seed.js
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (React + Vite)  port 3000          │
│  Landing page, auth, patient and doctor     │
│  dashboards                                  │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────┐
│  Express API  port 5000                     │
│  JWT auth, role enforcement, slot logic     │
└──────┬──────────────────────────┬───────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  MongoDB    │          │  Redis          │
│  Users,     │          │  Slot locks     │
│  Appointments│          │  120s TTL       │
└─────────────┘          └─────────────────┘
```

## Key Features

- Redis distributed lock prevents double bookings
- IANA timezone support for Asia/Kolkata, Europe/London, America/New_York
- Server side role enforcement
- Dynamic slot generation from working hours and blocked periods
- Two hour cancellation window enforced on the backend
- Rescheduling with original booking protection
- Full audit history

## Environment Variables

These are pre-set in docker-compose.yml for development. Do not commit real secrets.

| Variable         | Default value                   |
| ---------------- | ------------------------------- |
| MONGO_URI        | Set by Docker Compose           |
| REDIS_URL        | redis://redis:6379              |
| JWT_SECRET       | Change before any deployment    |
| SLOT_LOCK_TTL    | 120 (seconds)                   |
