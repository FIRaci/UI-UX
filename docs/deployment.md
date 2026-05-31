# Hướng dẫn Deploy MediCare AI lên Render

## Overview

Frontend đã có trên Netlify. Backend, AI Service và Database sẽ deploy lên Render.

| Service | Technology | Port |
|---------|-----------|------|
| Frontend | React + Vite | - |
| Backend | Elysia (Bun) + Prisma | 3000 |
| AI Service | FastAPI (Python) + Gemini | 8000 |
| Database | PostgreSQL | 5432 |

## Prerequisites

1. Tài khoản Render (https://dashboard.render.com)
2. Kết nối GitHub repo với Render

## Bước 1: Deploy PostgreSQL Database

1. Đăng nhập Render Dashboard
2. Click **New +** → **PostgreSQL**
3. Cấu hình:
   - **Name**: `medicare-db`
   - **Database**: `medicare`
   - **Plan**: Free
4. Click **Create Database**
5. **Lưu lại Internal Database URL** (dùng cho Backend)

## Bước 2: Deploy Backend (Elysia + Bun)

1. Click **New +** → **Web Service**
2. Chọn GitHub repo
3. Cấu hình:
   - **Name**: `medicare-backend`
   - **Runtime**: `Bun`
   - **Plan**: Free
   - **Build Command**:
     ```
     cd backend && bun install && bunx prisma generate
     ```
   - **Start Command**:
     ```
     cd backend && bun run src/index.ts
     ```
4. Thêm Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<Internal Database URL từ Bước 1>`
   - `JWT_SECRET` = `<tự tạo secret key>`
   - `CORS_ORIGIN` = `https://medicare-ui-ux.netlify.app`
5. Click **Create Web Service**
6. **Lưu lại URL** (ví dụ: `https://medicare-backend.onrender.com`)

## Bước 3: Deploy AI Service (FastAPI + Python)

1. Click **New +** → **Web Service**
2. Chọn GitHub repo
3. Cấu hình:
   - **Name**: `medicare-ai-service`
   - **Runtime**: `Python 3`
   - **Plan**: Free
   - **Build Command**:
     ```
     cd ai_service && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```
     cd ai_service && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
4. Thêm Environment Variables:
   - `PYTHON_VERSION` = `3.11.0`
   - `GEMINI_API_KEY` = `<API key từ Google AI Studio>`
5. Click **Create Web Service**
6. **Lưu lại URL** (ví dụ: `https://medicare-ai-service.onrender.com`)

## Bước 4: Update Frontend trên Netlify

1. Đăng nhập Netlify Dashboard
2. Chọn site MediCare
3. Vào **Site configuration** → **Environment variables**
4. Thêm/sửa các biến:
   - `VITE_API_URL` = `https://medicare-backend.onrender.com`
   - `VITE_AI_SERVICE_URL` = `https://medicare-ai-service.onrender.com`
5. Trigger **Deploy mới** trên Netlify

## Bước 5: Verify

1. Mở frontend trên Netlify
2. Login với tài khoản: `benhnhan` / `123456`
3. Kiểm tra:
   - Chat AI hoạt động
   - Danh sách bác sĩ hiển thị
   - Đặt lịch hẹn thành công
   - Hội thoại messenger hoạt động

## Lưu ý quan trọng

### Cold Start
Render free tier sẽ sleep service sau 15 phút không sử dụng. Khi có request mới, service sẽ mất ~30s để khởi động lại.

### Database
- PostgreSQL miễn phí trong 90 ngày đầu
- Sau 90 ngày, cần upgrade hoặc migrate data

### Environment Variables
- **Không commit** secrets (GEMINI_API_KEY, JWT_SECRET) lên git
- Luôn set trong Render Dashboard

### CORS
- `CORS_ORIGIN` phải đúng với URL frontend trên Netlify
- Nếu sai sẽ bị lỗi CORS khi gọi API

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| CORS error | Sai CORS_ORIGIN | Kiểm tra lại URL frontend |
| Database connection failed | Sai DATABASE_URL | Copy đúng Internal URL từ Render |
| AI service timeout | Gemini API key sai | Kiểm tra GEMINI_API_KEY |
| Service sleep | Free tier cold start | Đợi 30s hoặc upgrade plan |
