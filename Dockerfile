FROM node:20-bookworm-slim

# Cài đặt Java và công cụ (bao gồm zip, unzip, p7zip cho giải nén)
RUN apt-get update && \
    apt-get install -y default-jre-headless curl zip unzip p7zip-full && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy các tệp cấu hình package
COPY package*.json ./

# Cài đặt thư viện Node
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn vào image
COPY . .

# Tự động đồng ý EULA của Minecraft để tránh bị dừng khi khởi chạy lần đầu
RUN echo "eula=true" > eula.txt

# Mở cổng 3000 cho Web Panel và 25565 cho Minecraft Server
EXPOSE 3000 25565

# Khởi chạy ứng dụng
CMD ["node", "server.js"]
