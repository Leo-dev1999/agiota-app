FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter shared build
RUN pnpm --filter api build
RUN pnpm --filter api db:generate

EXPOSE 3000

CMD pnpm --filter api db:migrate:deploy && node apps/api/dist/index.js
