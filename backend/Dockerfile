FROM oven/bun:1

WORKDIR /app

# Copy package files first for better caching
COPY backend/package.json ./

# Install dependencies
RUN bun install

# Copy prisma schema and generate client
COPY backend/prisma ./prisma
RUN bunx prisma generate

# Copy source code and start script
COPY backend/src ./src
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3000

CMD ["./start.sh"]
