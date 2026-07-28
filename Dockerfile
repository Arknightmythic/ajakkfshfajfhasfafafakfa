# syntax=docker/dockerfile:1

# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# PENTING: Vite membaca variabel VITE_* dari file .env SAAT BUILD (di-bake
# langsung ke bundle JS statis), bukan saat container jalan. Karena .env
# TIDAK di-exclude lewat .dockerignore, file .env asli project ini ikut
# ter-COPY di atas dan otomatis dibaca oleh `vite build` di bawah — persis
# seperti kalau kamu jalankan `yarn build` secara lokal.
#
# Konsekuensinya: kalau VITE_BACKEND_URL di .env berubah, image ini HARUS
# di-build ulang (`docker compose build web`) — restart container saja tidak
# cukup, beda dengan service backend yang env-nya dibaca saat runtime.
RUN yarn build

# ── Stage 2: serve hasil build lewat nginx ──────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
