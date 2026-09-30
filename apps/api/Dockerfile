# Build context: repo root — docker build -f apps/api/Dockerfile -t ekalkutin/intentra-api .
FROM node:26-alpine AS build
ENV NX_DAEMON=false MONGOMS_DISABLE_POSTINSTALL=1
RUN npm install -g pnpm@12.6.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm nx run @intentra/api:build
RUN pnpm deploy --filter @intentra/api --prod /out

FROM node:26-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out .
EXPOSE 3000
CMD ["node", "build/main.js"]
