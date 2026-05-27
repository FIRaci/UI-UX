---
phase: 4
title: "Demo Polish & Deployment"
status: completed
priority: P1
effort: "2h"
dependencies: [3]
---

# Phase 4: Demo Polish & Deployment

## Overview
Làm cho demo ấn tượng: pre-seed data realistic, responsive layout, error states đẹp, deployment trên một port duy nhất (Vite proxy backend). Không cần Docker.

## Requirements
- Seed data realistic: 10+ appointments, 5 doctors, users cho mỗi role
- Vite proxy backend: frontend + backend trên cùng port (3001)
- Add real AI chat stub — gọi Gemini API nếu có key, fallback message nếu không
- README viết lại: hướng dẫn chạy demo 3 bước
- Xóa toàn bộ file không dùng (guidelines/, reference-folder/, .md design docs)

## Architecture
```
┌─────────────┐     proxy /api/*     ┌──────────────┐
│  Vite Dev    │ ──────────────────>  │  Express API  │
│  :5173       │                      │  :3001        │
│  /api/* ─────┘                      └──────────────┘
│                                     │
│  → /api/auth/*                      │
│  → /api/appointments/*              │
│                                     │
└─────────────────────────────────────┘
```

vite.config.ts proxy:
```ts
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

## Related Code Files
- **Modify:** `vite.config.ts` (proxy), `README.md` (rewrite), `backend/prisma/seed.ts` (rich seed data)
- **Create:** `.env.example` (cho API keys sau này)
- **Delete:** `guidelines/`, `reference-folder-quản-lí-phòng-khám/`, `fresh_clone/`, `*.md` design docs (REDESIGN_SUMMARY, VISUAL_REDESIGN, USABILITY_*)

## Implementation Steps
1. Seed data mở rộng:
   - 5 users (mỗi role 1 user, password "123")
   - 5 doctors với avail slots
   - 10+ appointments rải rác các ngày
   - 3 threads với messages mẫu
2. Cấu hình Vite proxy:
   - `vite.config.ts`: thêm `server.proxy`
   - Frontend fetch không cần hardcode URL
3. ChatView cập nhật:
   - Nếu `VITE_GEMINI_KEY` tồn tại → gọi Gemini API
   - Nếu không → "Chức năng AI đang phát triển, vui lòng cấu hình API key"
4. Xóa file rác:
   - `guidelines/`, `reference-folder-*/`, `fresh_clone/`
   - `*_SUMMARY.md`, `*_GUIDE.md`, `*_STANDARDS.md` (trừ README.md)
5. README viết lại:
   ```markdown
   # MediCare AI — Healthcare Demo
   ## Quick Start (3 bước)
   1. `cd backend && npm install && npx prisma db push && npx tsx src/seed.ts`
   2. `cd backend && npx tsx src/index.ts` (port 3001)
   3. `npm install && npm run dev` (port 5173, tự động proxy API)
   ## Accounts
   - Bệnh nhân: benhnhan / 123
   - Bác sĩ: bacsi / 123
   - Chuyên gia: chuyengia / 123
   - Tư vấn viên: tuvan / 123
   - Quản lý: quanly / 123
   ```

## Success Criteria
- [ ] `npm run dev` + backend start → toàn bộ app chạy trên localhost:5173
- [ ] API proxy hoạt động (không CORS error)
- [ ] Demo flow: Login → Book → Refresh → Still there
- [ ] Chat AI hiển thị message fallback (không crash)
- [ ] README mới chỉ dẫn rõ ràng
- [ ] Build thành công (sau khi xóa file rác)

## Risk Assessment
- **Nguy cơ:** Xóa nhầm file cần thiết — mitigation: xóa từng file, build kiểm tra
- **Nguy cơ:** Vite proxy không forward đúng — mitigation: test trước, kiểm tra Network tab
