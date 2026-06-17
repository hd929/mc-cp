FROM node:20-bookworm-slim AS base

# Cài đặt Java và công cụ (bao gồm zip, unzip, p7zip cho giải nén)
RUN apt-get update && \
    apt-get install -y --no-install-recommends default-jre-headless curl zip unzip p7zip-full && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy các tệp cấu hình package
COPY package*.json ./

# Cài đặt thư viện Node với cache optimization
RUN npm ci --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# Copy toàn bộ mã nguồn vào image
COPY . .

# Tự động đồng ý EULA của Minecraft - ghi vào đúng thư mục minecraft
RUN mkdir -p /app/minecraft && echo "eula=true" > /app/minecraft/eula.txt

# Mở cổng 3000 cho Web Panel và 25565 cho Minecraft Server
EXPOSE 3000 25565

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/stats || exit 1

# Khởi chạy ứng dụng với memory optimization
CMD ["node", "--max-old-space-size=256", "server.js"]
