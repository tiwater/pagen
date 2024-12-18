FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy root workspace files
COPY pnpm-*.yaml package.json ./

# Copy the app-specific files
COPY renderer/package.json ./renderer/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the app files
COPY renderer ./renderer/

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy all files including dependencies
COPY --from=deps /app ./

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd renderer && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public files
COPY --from=builder /app/renderer/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/renderer/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/renderer/.next/static ./.next/static

USER nextjs

EXPOSE 3345

ENV PORT=3345
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
