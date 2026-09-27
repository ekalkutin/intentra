# docker build -f apps/server/Dockerfile -t intentra-server .
FROM node:26-slim AS build
RUN npm install -g pnpm@12.6.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN NX_DAEMON=false pnpm exec nx run @intentra/server:build
RUN pnpm deploy --filter @intentra/server --prod /out

FROM node:26-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out .
USER node
EXPOSE 3000
CMD ["node", "build/main.js"]
