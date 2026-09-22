# Build from the repository root:
#
#   docker build -f apps/web/Dockerfile -t ekalkutin/intentra-web:latest .
#
# Vite substitutes VITE_* variables at build time. Add a --build-arg here when
# the browser needs an API origin baked into the bundle.
FROM node:26-alpine AS base
WORKDIR /app
RUN npm install --global pnpm@12.5.1

# ---------- deps ----------
# Every workspace package the web app resolves through "workspace:*" needs its
# manifest here, otherwise pnpm cannot see it and the install fails.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY libs/contracts/iam/package.json libs/contracts/iam/
COPY libs/contracts/workspace/package.json libs/contracts/workspace/
# The current lockfile predates the web app dependencies. Do not use
# --frozen-lockfile until it has been regenerated and committed.
RUN HUSKY=0 pnpm install --no-frozen-lockfile

# ---------- build ----------
# The contracts are consumed as compiled packages ("exports" points at build/),
# so they are built first; --filter web... walks that order itself.
FROM deps AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY tsconfig.base.json ./
COPY libs/contracts/iam/tsconfig.json libs/contracts/iam/tsconfig.build.json libs/contracts/iam/
COPY libs/contracts/iam/src/ libs/contracts/iam/src/
COPY libs/contracts/workspace/tsconfig.json libs/contracts/workspace/tsconfig.build.json libs/contracts/workspace/
COPY libs/contracts/workspace/src/ libs/contracts/workspace/src/
COPY apps/web/components.json apps/web/index.html apps/web/tsconfig.app.json apps/web/tsconfig.json apps/web/tsconfig.node.json apps/web/vite.config.ts apps/web/
COPY apps/web/public/ apps/web/public/
COPY apps/web/src/ apps/web/src/
RUN pnpm --filter web... run build

# ---------- runtime ----------
FROM nginx:1.31-alpine AS runtime
COPY --from=build /app/apps/web/build /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
