FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV DATABASE_URL=postgresql://menez:menez@db:5432/menez?schema=public
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma \
  && npm run build \
  && mkdir -p .next/standalone/.next \
  && cp -r .next/static .next/standalone/.next/static \
  && cp -r public .next/standalone/public

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl wget \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3102
ENV AUTH_MODE=self-hosted
COPY --from=build /app /app
RUN chmod +x docker/entrypoint.sh
EXPOSE 3102
HEALTHCHECK --interval=15s --timeout=5s CMD wget -qO- http://127.0.0.1:3102/ >/dev/null || exit 1
ENTRYPOINT ["./docker/entrypoint.sh"]
