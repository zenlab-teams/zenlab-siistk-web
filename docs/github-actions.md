# GitHub Actions Documentation

Dokumen ini menjelaskan workflow GitHub Actions untuk build dan test proyek Laravel + React SIISTK.

## Workflow yang Digunakan

CI workflow untuk:

- Checkout source code.
- Setup PHP 8.2.
- Install dependency Composer.
- Setup Node.js 20.
- Install dependency NPM.
- Build asset frontend.
- Setup environment testing.
- Menjalankan test Laravel/Pest.

## Lokasi File

Rencana lokasi workflow:

```text
.github/workflows/ci.yml
```

## Trigger

Workflow dijalankan saat:

- `push` ke branch utama atau branch fitur.
- `pull_request` ke branch utama.

Contoh trigger:

```yaml
on:
  push:
  pull_request:
```

## Tahapan Workflow

1. Checkout code dari repository.
2. Setup PHP 8.2 dan ekstensi yang dibutuhkan Laravel.
3. Install dependency Composer dengan `composer install`.
4. Salin `.env.example` menjadi `.env` dan generate application key.
5. Setup Node.js 20.
6. Install dependency frontend dengan `npm ci`.
7. Build asset dengan `npm run build`.
8. Jalankan test dengan `composer run test` memakai SQLite in-memory.

## Contoh Rencana `ci.yml`

```yaml
name: Laravel CI

on:
  push:
  pull_request:

jobs:
  build-and-test:
    name: Build and test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, dom, fileinfo, mysql, sqlite, pdo_sqlite
          coverage: none

      - name: Install Composer dependencies
        run: composer install --no-interaction --prefer-dist --optimize-autoloader

      - name: Prepare application
        run: |
          cp .env.example .env
          php artisan key:generate

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install Node dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build

      - name: Run tests
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: ':memory:'
        run: composer run test
```

## Hasil Workflow

Saat workflow sudah dibuat, dokumentasi ini perlu dilengkapi dengan:

- Screenshot workflow berhasil di tab GitHub Actions.
- Status badge di `README.md`.
- Catatan jika ada test yang perlu database service khusus.

Contoh badge setelah workflow tersedia:

```markdown
[![Laravel CI](https://github.com/zenlab-teams/zenlab-siistk-web/actions/workflows/ci.yml/badge.svg)](https://github.com/zenlab-teams/zenlab-siistk-web/actions/workflows/ci.yml)
```

## Catatan Implementasi Final

- Jika test memakai MySQL, tambahkan service MySQL di workflow.
- Jika test dapat memakai SQLite memory, atur environment testing agar lebih cepat.
- Jangan menyimpan secret di file workflow.
- Semua secret harus masuk ke GitHub Repository Secrets.
