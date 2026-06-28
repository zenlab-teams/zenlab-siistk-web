<p align="center">
  <img src="resources/assets/image/Logo.svg" alt="SIISTK Logo" width="160" />
</p>

<h1 align="center">SIISTK</h1>

<p align="center">
  <a href="https://github.com/zenlab-teams/zenlab-siistk-web/actions/workflows/ci.yml">
    <img src="https://github.com/zenlab-teams/zenlab-siistk-web/actions/workflows/ci.yml/badge.svg" alt="Laravel CI" />
  </a>
</p>

## Deskripsi Proyek

SIISTK adalah Sales Information & Inventory System Toolkit untuk TelatenKarya. Aplikasi ini dipakai untuk kelola produk, stok, pesanan, penawaran, customer, dan dashboard operasional dalam satu web app.

## Features

- Auth login/logout dengan role admin, sales, dan customer.
- Dashboard per role.
- Manajemen produk dan stok.
- Manajemen pesanan dan invoice.
- Alur offer untuk sales dan admin.
- Customer management.
- Reusable DataTable dan komponen UI.

## Tech Stack

- Laravel 12
- PHP 8.2+
- React 18
- Inertia.js v2
- Tailwind CSS v3
- Redux Toolkit
- Vite
- Pest
- Laravel Pint

## Instalasi Singkat

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
composer run dev
```

## Screenshoot

<p align="center">
  <img src="docs/screenshots/Screenshot%202026-06-18%20235101.png" alt="Login" width="100%" />
</p>

<p align="center">
  <img src="docs/screenshots/Screenshot%202026-06-18%20235149.png" alt="Dashboard" width="100%" />
</p>

<p align="center">
  <img src="docs/screenshots/Screenshot%202026-06-18%20235204.png" alt="Products" width="100%" />
</p>

<p align="center">
  <img src="docs/screenshots/Screenshot%202026-06-18%20235217.png" alt="Orders" width="100%" />
</p>
