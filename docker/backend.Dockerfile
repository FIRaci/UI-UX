FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY prisma ./prisma
RUN bunx prisma generate
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]
