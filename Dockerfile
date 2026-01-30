# Stage 1: Base - Install pnpm and dependencies
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/
RUN pnpm install --frozen-lockfile

# Stage 2: Build - Build both API and Client
FROM base AS build
COPY . .
RUN pnpm run build

# Stage 3: API Runtime - Lightweight stage for the Backend
FROM node:20-slim AS api
ENV NODE_ENV=production
WORKDIR /app
# Copy only necessary files from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/main"]

# Stage 4: Client Runtime - Frontend using Nginx
FROM nginx:stable-alpine AS client
# Copy built Angular files to Nginx html directory
COPY --from=build /app/apps/client/dist/client/browser /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
