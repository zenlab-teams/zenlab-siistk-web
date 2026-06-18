# ZENLAB SIISTK - TelatenKarya Admin Dashboard

ZENLAB SIISTK adalah aplikasi manajemen operasional untuk TelatenKarya yang dibangun dengan Laravel 12, React 19, dan Inertia.js v2. Proyek ini mendukung pengelolaan produk, stok, pesanan, penawaran, pelanggan, dan dashboard per role dalam satu aplikasi web.

## Ringkasan

- Role utama: `admin`, `sales`, dan `customer`
- Arsitektur: Laravel + Inertia + React
- Fokus utama: operasional, transaksi, dan monitoring bisnis

## Tech Stack

- Backend: Laravel 12, PHP 8.2+
- Frontend: React 19, Inertia.js, Vite
- Styling: Tailwind CSS, utility class berbasis komponen
- State: Redux Toolkit
- Testing: Pest PHP
- Code style: Laravel Pint

## Fitur Utama

- Login dan otorisasi berbasis role
- Dashboard admin, sales, dan customer
- Manajemen produk dan stok
- Manajemen pesanan dan invoice
- Alur offer untuk tim sales
- Public order page untuk akses pelanggan
- Komponen tabel, modal, dan input yang reusable

## Screenshot Proyek

| Login | Dashboard | Products | Orders |
| --- | --- | --- | --- |
| ![Login](docs/screenshots/Screenshot%202026-06-18%20235101.png) | ![Dashboard](docs/screenshots/Screenshot%202026-06-18%20235149.png) | ![Products](docs/screenshots/Screenshot%202026-06-18%20235204.png) | ![Orders](docs/screenshots/Screenshot%202026-06-18%20235217.png) |

## Tim Pengembang

| Nama / Identitas | Peran |
| --- | --- |
| Ihsan Nul Amri | Project Manager dan Lead Programmer |
| Dwi Melza Utari | Quality Assurance |
| Achmad Ghozali | AI Specialist |
| Faizul Ananda | System Analyst |

## Dokumentasi

- [Panduan Instalasi](docs/installation.md)
- [Dokumentasi Fitur](docs/features.md)
- [Dokumentasi Dependency](docs/dependency.md)
- [Dokumentasi Refactoring](docs/refactoring.md)
- [Dokumentasi GitHub Actions](docs/github-actions.md)

## Menjalankan Proyek

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
composer run dev
```

## Pengujian

```bash
composer run test
```

## Standar Pengembangan

- Jalankan `vendor/bin/pint --dirty` sebelum commit perubahan PHP.
- Gunakan `php artisan test` atau `composer run test` untuk verifikasi fitur.
- Ikuti pola route naming `resource.action`.

## Lisensi

Proyek ini dikembangkan untuk tujuan Project-Based Learning dan menggunakan lisensi MIT.
