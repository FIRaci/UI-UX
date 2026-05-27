# MediCare AI — Codebase Summary

## Stack

| Layer | Tech | Port |
|-------|------|------|
| Frontend | Vite + React 19 + TypeScript + shadcn/ui | 5173 |
| Backend | Elysia (Bun) + Prisma + SQLite | 3000 |
| AI Service | FastAPI (Python) + Gemini 3 Flash Preview | 8000 |
| Auth | JWT (bearer token, localStorage) | — |
| State | Zustand (module-level, no React setState) | — |

## Directory Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root: login routing per role
│   │   ├── store.ts                   # Zustand: auth, appointments, records, pain points
│   │   ├── hooks/
│   │   │   └── useAppNavigate.ts      # Shared app:navigate event hook
│   │   └── components/
│   │       ├── ui/                    # shadcn/ui primitives (button, card, dialog, etc.)
│   │       ├── LoginScreen.tsx
│   │       └── *Dashboard/            # One subdir per role (Patient, Doctor, Consultant, Expert, Admin)
│   ├── styles/tailwind.css
├── backend/
│   ├── src/index.ts                   # Elysia server: auth, appointments, records, pain points
│   ├── prisma/schema.prisma
│   └── package.json
├── ai_service/
│   ├── main.py                        # FastAPI: POST /api/chat → Gemini 3 Flash Preview
│   ├── requirements.txt
│   └── .env                           # GEMINI_API_KEY (gitignored)
├── tests/e2e/                         # Playwright E2E tests (6 tests)
├── docs/                              # Project documentation
├── plans/                             # Implementation plans
├── run.bat                            # Start all 3 services
```

## Roles (5)

| Role | Dashboard | Quick Login |
|------|-----------|-------------|
| `benhnhan` (Patient) | PatientDashboard | benhnhan/123456 |
| `bacsi` (Doctor) | DoctorDashboard | bacsi/123456 |
| `chuyengia` (Expert UI/UX) | ExpertDashboard | chuyengia/123456 |
| `tuvan` (Consultant) | ConsultantDashboard | tuvan/123456 |
| `quanly` (Admin) | AdminDashboard | quanly/123456 |

## Key Design Decisions

- **API-first**: All CRUD goes through REST APIs. Zustand store fetches from backend; no hardcoded data.
- **Optimistic updates**: Appointments use upsert merge — local changes persist until server confirms, rollback on error.
- **AI dual-path**: ChatView + ConsultantDashboard call `POST /api/chat`. On failure → local fallback responses with 300-700ms simulated delay.
- **Actions system**: AI returns `actions[]` (WARNING_RED, NAVIGATE_APPOINTMENT, etc.) → frontend shows toasts, navigation suggestions.
- **No React Router**: Custom `app:navigate` CustomEvent + `useAppNavigate` hook.
- **Single UI system**: shadcn/ui only (MUI/emotion removed).

## Tests

- 37 Vitest unit tests (8 test files)
- 6 Playwright E2E tests (3 spec files)
- All pass, build succeeds

## Running

```bash
run.bat    # Starts AI (:8000) + Backend (:3000) + Frontend (:5173)
```
