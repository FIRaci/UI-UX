---
phase: 2
title: "Backend Resurrection & Real APIs"
status: completed
priority: P0
effort: "3h"
dependencies: []
---

# Phase 2: Backend Resurrection & Real APIs

## Overview
Backend built with Elysia (Bun) + Prisma + SQLite. Full CRUD APIs for appointments, pain points, records. JWT auth. Seed data auto-runs on server start.

## Architecture (Actual)
```
backend/
├── prisma/
│   ├── schema.prisma          # User, Appointment, PainPoint, PatientRecord models
│   └── dev.db                 # SQLite database
├── src/
│   └── index.ts               # Elysia server: auth, appointments, painpoints, records
├── package.json
└── tsconfig.json
```

## Key Differences from Original Plan
| Item | Plan (Old) | Reality |
|------|-----------|---------|
| Framework | Express.js | **Elysia** (Bun-native) |
| Port | 3001 | **3000** |
| Password | "123" | **"123456"** |
| Threads CRUD | Planned but not needed | **Removed** (chat threads managed client-side) |
| Patients CRUD | Planned | **Removed** (simpler: records + appointments) |
| Server start | `ts-node` | `bun run dev` |

## Endpoints (Actual)
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/api/auth/register` | No | All |
| POST | `/api/auth/login` | No | All (quick login: any role + "123456") |
| GET | `/api/painpoints` | JWT | chuyengia, quanly |
| POST | `/api/painpoints` | JWT | chuyengia |
| GET | `/api/appointments` | JWT | All |
| POST | `/api/appointments` | JWT | benhnhan, tuvan, quanly |
| PATCH | `/api/appointments/:id` | JWT | benhnhan, bacsi, quanly |
| GET | `/api/records` | JWT | bacsi, benhnhan, quanly |
| POST | `/api/records` | JWT | bacsi |

## Seed Data (Auto on Start)
- 9 appointments (5 roles, multiple clinics)
- 2 pain points (quản lý + bệnh nhân)
- 5 patient records (Nguyễn Minh Khoa: various types)

## Success Criteria
- [x] `bun run dev` starts server on port 3000
- [x] Quick login with any role + "123456" returns JWT
- [x] Appointments CRUD via API
- [x] Pain points CRUD (expert dashboard)
- [x] Patient records CRUD (doctor dashboard)
- [x] CORS enabled for frontend (localhost:5173)

## Risk Assessment
- **Nguy cơ:** Prisma schema conflict với migration cũ — mitigated: dùng `prisma db push --accept-data-loss`
- **Nguy cơ:** CORS khi frontend (5173) gọi backend (3000) — mitigated: `@elysiajs/cors`
