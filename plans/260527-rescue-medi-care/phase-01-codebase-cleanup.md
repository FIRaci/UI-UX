---
phase: 1
title: "Codebase Cleanup & Modularization"
status: pending
priority: P0
effort: "4h"
dependencies: []
---

# Phase 1: Codebase Cleanup & Modularization

## Overview
Chuyển từ 12 file spaghetti (5,000+ dòng) sang cấu trúc module hóa, xóa MUI giảm tải, chọn shadcn/ui làm UI system duy nhất, xóa toàn bộ dead code còn sót.

## Requirements
- Tất cả file dashboard <200 dòng (tách component)
- Chỉ còn 1 UI system: shadcn/ui (xóa MUI, xóa custom inline-style components)
- Chuyển state từ file cục bộ lên Zustand store tập trung
- Xóa react-router (không dùng), chuyển Link trong ExpertDashboardShared thành nút dispatch event
- Cấu trúc folder mới: `components/dashboards/`, `components/shared/`, `components/chat/`

## Architecture
```
src/app/
├── components/
│   ├── dashboards/
│   │   ├── PatientDashboard/       # index.tsx + AppointmentCard.tsx + DoctorCard.tsx + ChatTab.tsx
│   │   ├── DoctorDashboard/        # index.tsx + PatientList.tsx + RecordForm.tsx + ChatTab.tsx
│   │   ├── ExpertDashboard/        # index.tsx + HeuristicView.tsx + PainPointForm.tsx + SUSView.tsx
│   │   ├── ConsultantDashboard/    # index.tsx + ThreadList.tsx + ChatArea.tsx
│   │   └── AdminDashboard/         # index.tsx + PatientTable.tsx + ScheduleView.tsx + StatsGrid.tsx
│   └── shared/
│       ├── AppShell.tsx            # Nav + layout shell
│       └── ChatView.tsx            # Per-role AI chat
├── store.ts                        # Zustand store (appointments, patients, threads, users)
└── App.tsx                         # Router
```

## Related Code Files
- **Delete:** `ExpertDashboardShared.tsx` (328 lines, dead), all `figma/` components if unused
- **Modify:** All 6 dashboard files (modularize), `store.ts` (centralize), `App.tsx` (clean imports)
- **Create:** Component subdirectories per dashboard, extract inline views

## Implementation Steps
1. Tách DoctorDashboard.tsx (1,065 dòng):
   - `DoctorDashboard/index.tsx` — tab switcher + layout
   - `DoctorDashboard/PatientList.tsx` — patient table + search
   - `DoctorDashboard/RecordForm.tsx` — medical record form
   - `DoctorDashboard/ChatTab.tsx` — AI chat tab
2. Tách PatientDashboard.tsx (895 dòng):
   - `PatientDashboard/index.tsx` — tab switcher
   - `PatientDashboard/DoctorCard.tsx` — doctor listing + booking
   - `PatientDashboard/AppointmentList.tsx` — appointment history
   - `PatientDashboard/ChatTab.tsx` — AI chat tab
3. Tách ConsultantDashboard.tsx (925 dòng):
   - `ConsultantDashboard/index.tsx` — layout
   - `ConsultantDashboard/ThreadList.tsx` — thread sidebar
   - `ConsultantDashboard/ChatArea.tsx` — message view
4. Tách AdminDashboard.tsx (696 dòng):
   - `AdminDashboard/index.tsx` — tab switcher
   - `AdminDashboard/PatientTable.tsx` — patient CRUD
   - `AdminDashboard/ScheduleView.tsx` — schedule grid
   - `AdminDashboard/StatsGrid.tsx` — charts + stats
5. Tách ExpertDashboard.tsx (270 dòng):
   - `ExpertDashboard/index.tsx` — tab switcher
   - `ExpertDashboard/HeuristicView.tsx` — heuristic checklist
   - `ExpertDashboard/PainPointForm.tsx` — pain point form
6. Xóa `ExpertDashboardShared.tsx` — dead file
7. Xóa MUI dependencies khỏi package.json (nếu không còn import)
8. Xóa react-router, chuyển ExpertDashboardShared Link → dispatch event
9. Chuyển state local (patients, appointments) vào Zustand store.ts

## Success Criteria
- [ ] Build thành công (0 lỗi)
- [ ] Tests pass (2 test files, 4 tests)
- [ ] Mỗi file <200 dòng
- [ ] Không còn import MUI
- [ ] Không còn react-router
- [ ] `ExpertDashboardShared.tsx` đã xóa
- [ ] State appointments/patients tập trung trong store.ts

## Risk Assessment
- **Nguy cơ:** Tách file làm hỏng import — mitigation: build sau mỗi lần tách 1 dashboard
- **Nguy cơ:** MUI vẫn còn import trong shadcn/ui components (không phải) — mitigation: để nguyên, chỉ xóa direct MUI imports trong app code
