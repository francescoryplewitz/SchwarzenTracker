# ───────────────────────────────────────────────────────────────────────────────
# 1) Builder-Stage: installiert alles (inkl. Dev-Dependencies) und baut dein Frontend
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Für den Build brauchen wir Dev-Deps, also setzen wir hier explizit "development"
ENV NODE_ENV=development

WORKDIR /base

# Nur package-Files kopieren, damit Docker-Cache greift, wenn sich Quellcode ändert
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Installiere root + frontend (inkl. Dev-Deps) und baue dann
RUN npm ci \
    && cd frontend \
    && npm ci

# Quellcode kopieren und das Frontend bauen
COPY . .
RUN npm run app:build

# ───────────────────────────────────────────────────────────────────────────────
# 2) Runtime-Stage: genau dein Original-Image, aber ohne den Build-Step
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-slim

# Hier kannst du per --build-arg NODE_ENV=production reinreichen
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /base

# Gesamtes Projekt rein (ohne dist aus dem Host, das kommt gleich aus dem Builder)
COPY . .

# Deine Original-System-Dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installiere nur die Produktions-Dependencies (so wie zuvor)
RUN npm run install:all

# Jetzt das fertige Build-Output aus dem Builder ins finale Image kopieren
COPY --from=builder /base/frontend/dist ./frontend/dist

# Expose und Start-Command wie gehabt
EXPOSE 80:80
CMD ["npm", "run", "start:container"]
