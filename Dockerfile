# ───────────────────────────────────────────────────────────────────────────────
# 1) Builder: install deps, build frontend, generate prisma client, prune dev deps
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /base

RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  make \
  g++ \
  pkg-config \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  libvips-dev \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN npm ci \
  && cd frontend \
  && npm ci

COPY . .
RUN npm run app:build
RUN npx prisma generate
RUN npm prune --omit=dev

# ───────────────────────────────────────────────────────────────────────────────
# 2) Runtime: minimal deps + built assets only
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /base

RUN apt-get update && apt-get install -y --no-install-recommends \
  libcairo2 \
  libpango-1.0-0 \
  libjpeg62-turbo \
  libgif7 \
  librsvg2-2 \
  libvips \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /base/node_modules ./node_modules
COPY --from=builder /base/package.json ./package.json
COPY --from=builder /base/srv ./srv
COPY --from=builder /base/scripts ./scripts
COPY --from=builder /base/.secrets.json ./.secrets.json
COPY --from=builder /base/frontend/dist ./frontend/dist

EXPOSE 5001
CMD ["npm", "run", "start:container"]
