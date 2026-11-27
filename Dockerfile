
# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm*.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node templates ./templates

USER node

EXPOSE 3000

# The runtime is fixed; the command selects the entrypoint.
# API:     docker run <image>
# Worker:  docker run <image> dist/cmd/queue/main.js
ENTRYPOINT ["node"]
CMD ["dist/cmd/api/main.js"]

