# ──────────────────────────────────────────────
# PropTax Engine — Multi-stage Docker build
# Base: Chainguard hardened Node.js 22
# ──────────────────────────────────────────────

# ── Stage 1: Build ──
FROM cgr.dev/chainguard/node:22-dev AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

# ── Stage 2: Production ──
FROM cgr.dev/chainguard/node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3400
EXPOSE 3400

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3400/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
