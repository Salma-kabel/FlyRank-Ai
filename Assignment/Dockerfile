# ---------- Build stage ----------
FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ---------- Runtime stage ----------
FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "start"]