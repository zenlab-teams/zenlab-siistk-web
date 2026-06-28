# Installation Documentation

Dokumen ini menjelaskan cara memasang dan menjalankan proyek ZENLAB SIISTK di environment lokal developer.

## Persyaratan Sistem

| Kebutuhan | Versi / Catatan |
| --- | --- |
| PHP | `^8.2` sesuai `composer.json` |
| Composer | Versi terbaru yang kompatibel dengan PHP lokal |
| Node.js dan NPM | Dibutuhkan untuk Vite dan Tailwind CSS |
| MySQL | Direkomendasikan MySQL 8 atau kompatibel dengan `utf8mb4` |
| Git | Untuk clone repository |

Stack utama proyek:

- Laravel 12
- React 18
- Inertia.js v2
- Vite
- Tailwind CSS v3
- Pest
- Laravel Pint

## Langkah Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/zenlab-teams/zenlab-siistk-web.git
cd zenlab-siistk-web
```

### 2. Install Dependency Backend

```bash
composer install
```

### 3. Install Dependency Frontend

```bash
npm install
```

### 4. Setup Environment

Salin file environment:

```bash
cp .env.example .env
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

Sesuaikan konfigurasi database di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zenlab_siistk
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Setup Database

Buat database sesuai nama di `.env`, lalu jalankan migration:

```bash
php artisan migrate
```

Jika seed data tersedia dan dibutuhkan:

```bash
php artisan db:seed
```

### 6. Build Asset

Untuk development:

```bash
npm run dev
```

Untuk production build:

```bash
npm run build
```

### 7. Jalankan Aplikasi

```bash
php artisan serve
```

Atau jalankan stack development lengkap:

```bash
composer run dev
```

Buka:

```text
http://127.0.0.1:8000
```

### 8. Jalankan Test

```bash
php artisan test --compact
```

Atau memakai script Composer:

```bash
composer run test
```

## Troubleshooting

### Permission Storage atau Cache

Pastikan folder berikut bisa ditulis:

```bash
storage
bootstrap/cache
```

### Config Lama Masih Terbaca

Bersihkan cache Laravel:

```bash
php artisan optimize:clear
```

### Asset Tidak Muncul

Jalankan ulang build frontend:

```bash
npm run build
```

Saat development, jalankan:

```bash
npm run dev
```

### Storage Image Tidak Muncul

Buat ulang symlink storage:

```bash
php artisan storage:link
```

### Migration Gagal

Cek ulang koneksi database di `.env`, lalu pastikan database lokal sudah dibuat.

## Checklist Instalasi

- Repository berhasil di-clone.
- Dependency Composer dan NPM berhasil terpasang.
- File `.env` sudah dibuat dan disesuaikan.
- `APP_KEY` sudah dibuat.
- Database sudah dibuat.
- Migration berhasil dijalankan.
- Storage link berhasil dibuat.
- Asset berhasil dibuild.
- Aplikasi bisa dibuka di browser.
- Test berhasil dijalankan.
