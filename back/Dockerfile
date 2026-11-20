# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app

# ---- Dependencies (dev included: Prisma CLI, tsx, TypeScript) ----
FROM base AS deps
# The Prisma schema engine (migrate) needs OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- Development: hot reload, src/ and prisma/ bind-mounted by Compose ----
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && exec npm run dev"]

# ---- Build ----
FROM deps AS build
COPY . .
RUN npx prisma generate && npm run build

# ---- Production runtime (migrations are applied by a dedicated step, not by this image) ----
FROM base AS prod
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY openapi.yaml ./
USER node
EXPOSE 3000
CMD ["node", "dist/src/server.js"]
