# --- Stage 1: Build Layer ---
FROM node:22-alpine AS builder
WORKDIR /app

# Cho phép dùng Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy cấu hình trước
COPY package.json pnpm-lock.yaml .npmrc ./

# Cài đặt toàn bộ dependencies (bao gồm devDeps để build)
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- Stage 2: Runner Layer (Siêu nhẹ) ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy kết quả build và node_modules (chỉ production)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Để cho chắc chắn và chuyên nghiệp, ta cài lại deps production ở stage runner 
# hoặc copy từ stage builder nếu builder đã chạy --prod. 
# Nhưng pnpm hoisted thường cần môi trường sạch.
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY .npmrc ./
RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/main.js"]
