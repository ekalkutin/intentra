# Build context: repo root — docker build -f apps/web/Dockerfile -t ekalkutin/intentra-web .
FROM node:26-alpine AS build
ENV NX_DAEMON=false MONGOMS_DISABLE_POSTINSTALL=1
RUN npm install -g pnpm@12.6.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm nx run @intentra/web:build

FROM nginx:1.31-alpine
COPY --from=build /repo/apps/web/build /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1
