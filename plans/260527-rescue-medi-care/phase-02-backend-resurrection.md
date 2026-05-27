---
phase: 2
title: "Backend Resurrection & Real APIs"
status: pending
priority: P0
effort: "3h"
dependencies: []
---

# Phase 2: Backend Resurrection & Real APIs

## Overview
Backend có Prisma schema + SQLite nhưng zero API endpoints hoạt động. Cần tạo REST API với Express/Fastify để serve CRUD cho appointments, patients, users, threads. Auth dùng JWT đơn giản (không OAuth).

## Requirements
- Express.js server (giữ nguyên Prisma + SQLite)
- RESTful API: Auth (login), Appointments CRUD, Patients CRUD, Threads CRUD
- JWT token-based auth (không refresh token cho demo)
- Seed data: users cho 5 roles, sample appointments, sample doctors
- `run.bat` start cả backend + frontend

## Architecture
```
backend/
├── prisma/
│   ├── schema.prisma          # Updated: User, Appointment, Patient, Thread models
│   └── seed.ts                # Seed data for demo
├── src/
│   ├── index.ts               # Express server entry
│   ├── middleware/
│   │   └── auth.ts            # JWT verify middleware
│   ├── routes/
│   │   ├── auth.ts            # POST /api/auth/login
│   │   ├── appointments.ts    # GET/POST/PUT /api/appointments
│   │   ├── patients.ts        # GET/POST/PUT /api/patients
│   │   └── threads.ts         # GET/POST /api/threads
│   └── seed-data.ts           # Hardcoded seed records
├── package.json
├── tsconfig.json
└── run.bat                    # node --loader ts-node/esm src/index.ts
```

## Related Code Files
- **Create:** `backend/src/index.ts`, `backend/src/middleware/auth.ts`, `backend/src/routes/*.ts`, `backend/src/seed-data.ts`, `backend/package.json`, `backend/tsconfig.json`
- **Modify:** `backend/prisma/schema.prisma` (thêm models), `run.bat` (dual start)
- **Delete:** `backend/prisma/migrations/` (nếu có schema conflict)

## Implementation Steps
1. Update Prisma schema:
   ```prisma
   model User { id Int @id @default(autoincrement); username String @unique; password String; role String; name String; }
   model Doctor { id Int @id @default(autoincrement); name String; spec String; rating Float; fee String; clinic String; avail String; } // avail = JSON array string
   model Appointment { id Int @id @default(autoincrement); patientName String; doctorName String; date String; time String; status String @default("scheduled"); }
   model Thread { id Int @id @default(autoincrement); title String; userRole String; userName String; updatedAt Int; }
   ```
2. `prisma db push` để sync SQLite schema
3. Tạo seed data: 5 users (benhnhan/bacsi/chuyengia/tuvan/quanly — all pass: "123"), 3 doctors, 5 appointments, 3 threads
4. Express server với routes:
   - `POST /api/auth/login` — username/password → JWT token
   - `GET /api/appointments` — list (filter by patientName query)
   - `POST /api/appointments` — create
   - `GET /api/doctors` — list doctors
   - `GET /api/patients` — list (admin only)
5. JWT middleware: verify token trên header Authorization, gán req.user

## Success Criteria
- [ ] `prisma db push` + `prisma db seed` chạy thành công
- [ ] `curl POST /api/auth/login -d '{"username":"benhnhan","password":"123"}'` trả về JWT token
- [ ] `curl GET /api/appointments -H "Authorization: Bearer <token>"` trả về list
- [ ] `curl POST /api/appointments` tạo appointment mới
- [ ] Server chạy trên http://localhost:3001

## Risk Assessment
- **Nguy cơ:** Prisma schema conflict với migration cũ — giải pháp: xóa migrations, dùng `prisma db push`
- **Nguy cơ:** CORS khi frontend (5173) gọi backend (3001) — mitigation: thêm cors middleware
