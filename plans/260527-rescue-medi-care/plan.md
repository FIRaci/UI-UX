---
title: "MediCare AI — Rescue & Demo-Ready Plan"
status: in-progress
created: 2026-05-27
phases:
  - id: 1
    title: "Codebase Cleanup & Modularization"
    status: pending
    priority: P0
  - id: 2
    title: "Backend Resurrection & Real APIs"
    status: pending
    priority: P0
  - id: 3
    title: "Connect Frontend ↔ Backend"
    status: pending
    priority: P0
  - id: 4
    title: "Demo Polish & Deployment"
    status: pending
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
End-to-end flow: Login → Role-based dashboard → Appointment booking → Data persists

## Phases
| # | Phase | Effort | Priority |
|---|-------|--------|----------|
| 1 | Codebase Cleanup & Modularization | 4h | P0 |
| 2 | Backend Resurrection & Real APIs | 3h | P0 |
| 3 | Connect Frontend ↔ Backend | 3h | P0 |
| 4 | Demo Polish & Deployment | 2h | P1 |

## Success Criteria
- [ ] Login with credentials stores real session (localStorage token + backend validation)
- [ ] Patient can browse doctors, book appointment, see it in list (survives refresh)
- [ ] Doctor can see booked appointments
- [ ] Admin can see dashboard stats
- [ ] All 4 test files pass + build succeeds
- [ ] Can demo on localhost without Docker, without .env config
