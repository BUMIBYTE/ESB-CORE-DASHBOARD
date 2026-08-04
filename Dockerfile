# 1. Pilih base image
FROM node:20-alpine

# 2. Tentukan direktori kerja di dalam kontainer
WORKDIR /app

# 3. Salin berkas konfigurasi dependensi & install
COPY package*.json ./
RUN npm install

# 4. Salin seluruh sisa kode aplikasi
COPY . .

# 5. Tentukan port yang dibuka (opsional/dokumentasi)
EXPOSE 5000

# 6. Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]