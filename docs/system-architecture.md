# MediCare AI — System Architecture

## Overview

Three-tier architecture: React SPA ↔ Elysia REST API ↔ FastAPI AI service. All services start locally via `run.bat`.

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (:5173)                       │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │LoginScreen│  │  Dashboards  │  │   ChatView       │ │
│  │  (JWT)    │  │  (per role)  │  │  (AI chat UI)    │ │
│  └─────┬─────┘  └──────┬───────┘  └────────┬─────────┘ │
│        │               │                    │           │
│        └───────────────┼────────────────────┘           │
│                        │   fetch() + JWT Bearer          │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│           Elysia Server (:3000)                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Auth    │  │  Appointments│  │  Records/Pain    │  │
│  │  /login  │  │  /appointments│  │  /records, /pp   │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
│                       │                                  │
│              Prisma ORM + SQLite                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│           FastAPI AI Service (:8000)                      │
│  POST /api/chat → Gemini 3 Flash Preview → {text, actions[]}   │
│  Fallback: keyword-matching local responses when offline  │
└──────────────────────────────────────────────────────────┘
```

## Component Architecture (Frontend)

```
App.tsx
├── LoginScreen (no token)
│   └── Role selection → POST /api/auth/login → JWT
└── Dashboard (token exists)
    ├── PatientDashboard
    ├── DoctorDashboard
    ├── ConsultantDashboard
    ├── ExpertDashboard
    └── AdminDashboard
        ├── AppShell (sidebar + header)
        └── TabContent (per dashboard)
            └── ChatView / ChatArea (AI chat)
```

## Data Flow

### Auth
1. User picks role → POST /api/auth/login → JWT token
2. Token stored in Zustand + localStorage
3. All subsequent API calls include `Authorization: Bearer <token>`
4. 401 response → auto-logout + toast

### Appointments (optimistic)
1. User creates appointment → POST /api/appointments
2. Zustand adds locally immediately (optimistic)
3. On success: merge server ID with local entry (upsert)
4. On failure: rollback (remove optimistic entry) + toast.error

### AI Chat (dual-path)
1. User sends message → POST /api/chat with `{role, message, history}`
2. If AI service responds → render `data.text` + trigger `data.actions[]`
3. If AI service fails → local fallback response after 300-700ms
4. Fallback includes basic action triggers for common keywords

## Actions System

AI returns `actions[]` array in JSON response. Frontend maps:

| Action | Effect |
|--------|--------|
| `WARNING_RED` | toast.error — urgent medical attention needed |
| `NAVIGATE_APPOINTMENT` | toast with "Đặt ngay" button → navigate to appointments |
| `SHOW_PATIENT_HISTORY` | toast.info — suggest viewing history |
| `HIGHLIGHT_CRITICAL` | toast.warning — critical findings |
| `SHOW_PACKAGES` | toast.info — suggest health packages |
| `SHOW_REPORTS` | toast.info — loading reports |
| `ALERT_OVERLOAD` | toast.warning — system overload warning |

## AI System Prompts

Each role gets a role-specific system prompt + full `AVAILABLE_ACTIONS` catalog listing all 7 actions with Vietnamese trigger criteria. This ensures Gemini knows all available tools regardless of role.
