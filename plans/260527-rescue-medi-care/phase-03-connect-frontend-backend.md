---
phase: 3
title: "Connect Frontend ↔ Backend & AI Service"
status: completed
priority: P0
effort: "3h"
dependencies: [2]
---

# Phase 3: Connect Frontend ↔ Backend & AI Service

## Overview
Thay thế Zustand hardcoded data và toast stubs bằng API calls thật. Login gọi API auth. Appointments CRUD qua backend. ChatView + ConsultantDashboard gọi AI service (FastAPI/Gemini).

## Key Rule
**Demo-honest pattern:** Không gọi API nếu backend chưa chạy → fallback graceful với loading state + error toast. Không silently fail.

## Architecture (Actual)
```
Frontend (fetch)                  Backend (Elysia:3000)
LoginScreen ──POST /api/auth/login──> JWT token
PatientDashboard ──GET /api/appointments──> Appointment[]
PatientDashboard ──POST /api/appointments──> 201 Created
DoctorDashboard ──GET /api/records──> PatientRecord[]
ConsultantDashboard ──GET /api/painpoints──> PainPoint[]
store.ts ──setToken() / getToken()──> localStorage + fetch headers

                              AI Service (FastAPI:8000)
ChatView ──POST /api/chat──> Gemini 3 Flash Preview ──> {text, actions[]}
ConsultantDashboard ──POST /api/chat──> Gemini 3 Flash Preview ──> insight extraction
```

## Key Differences from Original Plan
| Item | Plan (Old) | Reality |
|------|-----------|---------|
| Backend framework | Express.js :3001 | **Elysia** (Bun) :3000 |
| API wrapper | `lib/api.ts` | **Direct fetch** trong từng component + store |
| Patients | GET /api/patients | **GET /api/records** (PatientRecord model) |
| Chat | Stub | **Real Gemini 3 Flash Preview** via FastAPI |
| AI URL | Hardcoded | **`VITE_AI_SERVICE_URL`** env var |
| Fallback delay | 1000-1800ms | **300-700ms** |

## Implementation Summary
1. **LoginScreen** (`src/app/components/LoginScreen.tsx`):
   - Gọi `POST /api/auth/login` — lưu token + role vào store
   - Quick login: `{ username: role, password: "123456" }`
   - Register toggle + error toast

2. **store.ts** (`src/app/store.ts`):
   - `token` state sync với localStorage
   - `appointments` CRUD: fetch + upsert merge (giữ optimistic entries)
   - `records` fetch: GET /api/records
   - `painpoints` CRUD
   - 401 handler: auto logout + toast
   - **Optimistic updates** với rollback trên catch

3. **ChatView** (`src/app/components/ChatView.tsx`):
   - POST `{import.meta.env.VITE_AI_SERVICE_URL}/api/chat` với `{role, message, history}`
   - Xử lý AI `actions[]`: WARNING_RED (toast.error), NAVIGATE_APPOINTMENT (dispatch), others (toast.info)
   - Fallback local `ROLE_RESPONSES` khi AI offline
   - 37 unit tests (6 tests ChatView mock fetch)

4. **ConsultantDashboard** (`src/app/components/ConsultantDashboard/index.tsx`):
   - Gọi AI text + local insight extraction (symptoms/specialty/severity)
   - Fallback full local khi offline

5. **useAppNavigate** (`src/app/hooks/useAppNavigate.ts`):
   - `useRef` callback pattern + `[keys]` deps để tránh stale closure
   - `app:navigate` event dispatch thay React Router

## Success Criteria
- [x] Login với "benhnhan/123456" → PatientDashboard
- [x] Book appointment → persist qua refresh
- [x] All roles → chat với Gemini 3 Flash Preview
- [x] AI offline → fallback local responses (300-700ms delay)
- [x] AI actions → toast + navigate
- [x] 401 → auto logout
- [x] 37 unit tests + 6 E2E pass

## Risk Assessment
- **Nguy cơ:** CORS — mitigated: `@elysiajs/cors` trong backend
- **Nguy cơ:** Backend chưa chạy — mitigated: error toast + graceful fallback
- **Nguy cơ:** `&` trong đường dẫn UI&UX phá npx — mitigated: `npx.cmd` + `node node_modules/...` trong run.bat
- **Nguy cơ:** Race condition optimistic updates — mitigated: upsert merge trong fetchAppointments
