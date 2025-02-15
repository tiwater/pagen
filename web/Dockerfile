FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the app files
COPY . .

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy all files including dependencies
COPY --from=deps /app ./

# These ARGs are used during build time
#ARG NEXT_PUBLIC_SUPABASE_URL
#ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_RENDERER_URL=https://render.dustland.ai
ENV NEXT_PUBLIC_SUPABASE_URL=https://zwfsyamwvilpiciqtvuo.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZnN5YW13dmlscGljaXF0dnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NDMyNjIsImV4cCI6MjA1MTAxOTI2Mn0.4UmnrwhPLEcm8jlXolp_Thjq168j6zDkHHXziPpPBP0

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 1578

ENV PORT=1578
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]