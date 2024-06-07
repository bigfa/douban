FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*json tsconfig.json tsup.config.ts .env ./

COPY src/ src/

## make directory for node_modules

RUN mkdir -p /app/static

RUN npm ci && \
    npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/tsup.config.ts /app/tsup.config.ts
COPY --from=builder --chown=hono:nodejs /app/.env /app/.env
COPY --from=builder --chown=hono:nodejs /app/static /app/static


USER hono
EXPOSE 3000

CMD ["node", "/app/dist/index.js"]