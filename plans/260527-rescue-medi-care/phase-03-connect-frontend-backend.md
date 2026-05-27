---
phase: 3
title: "Connect Frontend ↔ Backend"
status: pending
priority: P0
effort: "3h"
dependencies: [2]
---

# Phase 3: Connect Frontend ↔ Backend

## Overview
Thay thế Zustand hardcoded data và toast stubs bằng API calls thật. LoginScreen gọi API auth. Appointment booking POST/PUT lên backend. Dashboard đọc data từ API. Chat AI remains stub (API key để sau).

## Key Rule
**Demo-honest pattern:** Không gọi API nếu backend chưa chạy → fallback graceful với loading state + error toast. Không silently fail.

## Architecture
```
Frontend (fetch)                  Backend (Express)
LoginScreen ──POST /api/auth/login──> JWT token
PatientDashboard ──GET /api/appointments──> Appointment[]
PatientDashboard ──POST /api/appointments──> 201 Created
DoctorDashboard ──GET /api/appointments──> Appointment[]
AdminDashboard ──GET /api/patients──> Patient[]
store.ts ──setToken() / getToken()──> localStorage + fetch headers
```

## Related Code Files
- **Modify:** `src/app/store.ts` (thêm API actions), `src/app/components/LoginScreen.tsx` (API call), `src/app/components/PatientDashboard.tsx` (appointment CRUD), `src/app/components/DoctorDashboard.tsx` (load appointments), `src/app/components/AdminDashboard.tsx` (load patients)
- **Create:** `src/app/lib/api.ts` — fetch wrapper với JWT auto-attach
- **No change:** ChatView, ExpertDashboard (pain points vẫn là stub — để sau)

## Implementation Steps
1. Tạo `src/app/lib/api.ts`:
   - `api.get<T>(url)` — fetch GET + Authorization header
   - `api.post<T>(url, body)` — fetch POST
   - Tự động parse 401 → dispatch `app:unauthorized`
   - Base URL từ env hoặc mặc định `http://localhost:3001/api`
2. Update `store.ts`:
   - `token` state + `setToken()` / `getToken()` sync với localStorage
   - `appointments` state: `fetchAppointments()` → GET /api/appointments
   - `createAppointment()` → POST /api/appointments
   - `patients` state: `fetchPatients()` → GET /api/patients
3. Update `LoginScreen.tsx`:
   - Form submit → `POST /api/auth/login`
   - Thành công → store.setToken(token) + store.setRole(role)
   - Thất bại → toast.error + clear form
4. Update `PatientDashboard.tsx`:
   - `useEffect` → `store.fetchAppointments()` thay vì đọc hardcode
   - Booking form → `store.createAppointment()` thay vì store mutation
5. Update `DoctorDashboard.tsx`:
   - `useEffect` → `store.fetchAppointments()`
   - Filter appointments cho doctor hiện tại
6. AdminDashboard: giữ nguyên data hardcode cho mục charts (vẫn là mock), nhưng patients table gọi API

## Success Criteria
- [ ] Login với "benhnhan/123" → vào PatientDashboard
- [ ] Book appointment → xuất hiện trong list sau refresh
- [ ] Doctor login → thấy appointment đã book
- [ ] 401 response → tự động logout + toast
- [ ] Loading state hiển thị khi đang fetch

## Risk Assessment
- **Nguy cơ:** CORS blocking — mitigation: thêm `cors()` middleware trong backend
- **Nguy cơ:** Backend chưa chạy, frontend gọi API fail — mitigation: error toast + graceful fallback
