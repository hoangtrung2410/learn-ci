# ---------- BUILD STAGE ----------
FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY . .
COPY .env ./                                                                         

RUN yarn build


FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

EXPOSE 3456


CMD ["node", "dist/main"]
