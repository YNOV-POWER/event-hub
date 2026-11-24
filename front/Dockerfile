# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
ENV NODE_ENV=development
COPY . .
RUN npm run api:generate
EXPOSE 3001 6006
CMD ["npx", "next", "dev", "--hostname", "0.0.0.0", "--port", "3001"]

FROM deps AS build
COPY . .
RUN npm run api:generate && npm run build

FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
USER node
EXPOSE 3001
CMD ["npm", "run", "start"]
