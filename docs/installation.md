# Panduan Instalasi

Dokumen ini menjelaskan langkah instalasi lokal untuk proyek ZENLAB SIISTK.

## Prasyarat

- PHP 8.2 atau lebih baru
- Composer
- Node.js dan npm
- Database MySQL atau PostgreSQL
- Git

## Langkah Instalasi

### 1. Clone repository

```bash
git clone https://github.com/zenlab-siistk-web.git
cd zenlab-siistk-web
```

### 2. Install dependency backend dan frontend

```bash
composer install
npm install
```

### 3. Siapkan environment

Salin file `.env.example` menjadi `.env`, lalu buat application key.

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi database

Atur `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` pada file `.env` sesuai lingkungan lokal.

### 5. Jalankan migrasi

```bash
php artisan migrate
```

### 6. Buat storage link

```bash
php artisan storage:link
```

### 7. Jalankan aplikasi

```bash
composer run dev
```

Perintah di atas menjalankan server Laravel, queue listener, dan Vite secara bersamaan.

## Pengujian

Untuk memastikan proyek berjalan dengan benar, jalankan:

```bash
composer run test
```

## Catatan

- Jika memakai data dummy, jalankan seeder yang tersedia setelah migrasi.
- Pastikan folder `storage` dan `bootstrap/cache` memiliki izin tulis yang cukup.
