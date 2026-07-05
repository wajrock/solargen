FROM node:20-alpine AS builder
WORKDIR /app

ARG BACKEND_API_KEY=CI_TEST_API_KEY
ENV BACKEND_API_KEY=$BACKEND_API_KEY

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY . .

RUN npm run lint
RUN npm run test
RUN npm run test:e2e

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/src/main.js"]