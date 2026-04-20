FROM node:20-bookworm-slim

# Cài đặt Java (default-jre-headless trên Debian Bookworm cung cấp Java 17 - cực chuẩn cho Minecraft mới)
RUN apt-get update && \
    apt-get install -y default-jre-headless curl && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt Bun thông qua npm (do dùng node base image)
RUN npm install -g bun

WORKDIR /app

# Copy các tệp cấu hình package
COPY package.json bun.lock* ./

# Cài đặt thư viện Node/Bun
RUN bun install

# Copy toàn bộ mã nguồn vào image
COPY . .

# Tự động đồng ý EULA của Minecraft để tránh bị dừng khi khởi chạy lần đầu
RUN echo "eula=true" > eula.txt

# Mở cổng 3000 cho Web Panel và 25565 cho Minecraft Server
EXPOSE 3000 25565

# Khởi chạy ứng dụng
CMD ["bun", "run", "server.js"]
