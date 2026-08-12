# Stage 1: Build Frontend React SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend Node API
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Final Production Runner Image
FROM node:20-alpine AS runner
WORKDIR /app/backend

COPY backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma

# Copy built frontend static assets
COPY --from=frontend-builder /app/frontend/dist ./public_frontend

ENV NODE_ENV=production
ENV JWT_SECRET=nexora_erp_production_secret_key_2026
ENV DATABASE_URL="file:./dev.db"

CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
