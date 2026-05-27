---
title: "MediCare AI — Rescue & Demo-Ready Plan"
status: completed
created: 2026-05-27
phases:
  - id: 1
    title: "Codebase Cleanup & Modularization"
    status: completed
    priority: P0
  - id: 2
    title: "Backend Resurrection & Real APIs"
    status: completed
    priority: P0
  - id: 3
    title: "Connect Frontend ↔ Backend"
    status: completed
    priority: P0
  - id: 4
    title: "Demo Polish & Deployment"
    status: completed
    priority: P1
---

# MediCare AI Rescue Plan

## Diagnosis (from 3 code reviews)
- 5,000+ lines across 12 files, worst offender DoctorDashboard.tsx at 1,065 lines
- 3 conflicting UI systems (MUI v7 + shadcn/ui + custom inline styles)
- Backend has Prisma + SQLite schema but no working API endpoints
- All "AI" features are setTimeout stubs
- Frontend data is Zustand hardcode — refresh = data loss
- Dead code everywhere (5 components already deleted, more inside giant files)
- No routing wrapper (react-router Link crashes on click)
- Figma export DNA: `@figma/my-make-file` name, auto-generated patterns

## Target: Demo-Ready Healthcare Product
End-to-end flow: Login → Role-based dashboard → Appointment booking → AI chat → Data persists

## Phases
| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | Codebase Cleanup & Modularization | 4h | ✅ Complete |
| 2 | Backend Resurrection & Real APIs | 3h | ✅ Complete |
| 3 | Connect Frontend ↔ Backend | 3h | ✅ Complete |
| 4 | Demo Polish & Deployment | 2h | ✅ Complete |

## Architecture Summary (Actual)
```
Frontend (Vite:5173)          Backend (Elysia:3000)       AI Service (FastAPI:8000)
LoginScreen ──POST /api/auth/login──> JWT token               │
   │                                                           │
   ├──GET/POST/PATCH /api/appointments                         │
   ├──GET/POST /api/records                                    │
   ├──GET/POST /api/painpoints                                 │
   └──POST /api/chat ──────────────────────────────────────> Gemini 1.5 Flash
```

## Success Criteria
- [x] Login with credentials stores real session (localStorage token + backend validation)
- [x] Patient can browse doctors, book appointment, see it in list (survives refresh)
- [x] Doctor can see booked appointments
- [x] All roles can chat with AI (Gemini 1.5 Flash, fallback local when offline)
- [x] AI responses include actionable `actions[]` (WARNING_RED, NAVIGATE_APPOINTMENT, etc.)
- [x] All 37 unit tests + 6 E2E pass
- [x] Can demo on localhost without Docker: `run.bat` starts all 3 services
