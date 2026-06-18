# Dokumentasi GitHub Actions

Repositori ini belum memiliki workflow GitHub Actions nyata. Dokumen ini menjelaskan rancangan CI sederhana yang cocok untuk proyek Laravel + React ini.

## Tujuan CI

- Memastikan kode PHP tetap rapi dengan Pint
- Menjalankan test otomatis dengan Pest
- Memastikan frontend berhasil dibuild

## Alur Workflow yang Direkomendasikan

1. Checkout repository
2. Setup PHP dan Composer
3. Install dependency backend
4. Setup Node.js
5. Install dependency frontend
6. Jalankan formatter check
7. Jalankan test
8. Jalankan build frontend

## Contoh Struktur Workflow

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-interaction --prefer-dist
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: vendor/bin/pint --dirty
      - run: composer run test
      - run: npm run build
```

## Kapan Dijalankan

- `push` ke branch utama atau branch fitur
- `pull_request` sebelum merge

## Catatan

- Contoh di atas hanya ilustrasi dokumentasi.
- Jika workflow nyata ditambahkan ke repo, dokumen ini perlu diselaraskan dengan file `.github/workflows/*.yml`.
