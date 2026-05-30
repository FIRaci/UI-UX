FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM oven/bun:1 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/bun.lockb ./
RUN bun install
COPY backend/prisma ./prisma
RUN bunx prisma generate
COPY backend .

FROM python:3.11-slim AS ai-builder
WORKDIR /app/ai_service
COPY ai_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ai_service .

# Final combined or separate? It's better to use docker-compose to compose multiple services.
