# Dokumentasi Dependency

Versi pada tabel diambil dari lock file dan instalasi proyek per 27 Juni 2026.

## Dependency Backend

| Package | Fungsi | Alasan digunakan | Versi | Risiko/Perhatian |
| --- | --- | --- | --- | --- |
| `laravel/framework` | Framework aplikasi | Routing, Eloquent, request, queue, dan fondasi backend | `v12.57.0` | Major update bisa ubah perilaku framework |
| `inertiajs/inertia-laravel` | Bridge Laravel ke Inertia | Mengirim props dari controller ke React tanpa API terpisah | `v2.0.21` | Harus sinkron dengan `@inertiajs/react` |
| `laravel/sanctum` | Auth token dan SPA auth | Disiapkan untuk autentikasi token dan session-based auth | `v4.3.1` | Konfigurasi cookie/domain harus benar |
| `tightenco/ziggy` | Route helper backend ke frontend | Menjaga nama route Laravel tetap bisa dipakai di JavaScript | `v2.6.2` | Rename route bisa memutus referensi frontend |
| `guzzlehttp/guzzle` | HTTP client | Request ke service eksternal jika dibutuhkan | `7.10.0` | Timeout dan retry tetap harus diatur |
| `barryvdh/laravel-dompdf` | Generate PDF | Menyiapkan kebutuhan invoice dan dokumen cetak | `v3.1.2` | Constraint `*` terlalu longgar |
| `laravel/tinker` | REPL Laravel | Debug dan inspeksi cepat data aplikasi | `v2.11.1` | Hanya untuk development, bukan flow production |

## Dependency Development

| Package | Fungsi | Versi | Risiko/Perhatian |
| --- | --- | --- | --- |
| `pestphp/pest` | Framework test utama | `v3.8.6` | Test harus tetap sinkron dengan plugin Laravel |
| `pestphp/pest-plugin-laravel` | Integrasi Pest dan Laravel | `v3.2.0` | Harus cocok dengan versi Pest dan Laravel |
| `laravel/pint` | Formatter PHP | `v1.29.1` | Jalankan sebelum commit perubahan PHP |
| `laravel/boost` | Tool pengembangan Laravel | `v2.0.0` | Hanya dibutuhkan di development |
| `laravel/pail` | Pembaca log Laravel | `v1.2.6` | Jangan mengekspos log sensitif |
| `laravel/sail` | Docker dev environment | `v1.57.0` | Butuh Docker dan konfigurasi lokal yang sesuai |
| `fakerphp/faker` | Data dummy untuk test/seeder | `v1.24.1` | Data hanya sintetis |
| `mockery/mockery` | Mock object untuk test | `1.6.12` | Mock berlebihan bisa bikin test rapuh |
| `nunomaduro/collision` | Output error CLI | `v8.9.4` | Dev only |
| `vite` | Build tool frontend | `7.3.3` | Butuh Node modern |
| `laravel-vite-plugin` | Integrasi Laravel dan Vite | `2.1.0` | Harus cocok dengan Vite 7 |
| `@vitejs/plugin-react` | Plugin React untuk Vite | `4.7.0` | Bergantung pada versi Vite |
| `tailwindcss` | Styling utility-first | `3.4.19` | Bukan Tailwind v4 |
| `concurrently` | Jalankan beberapa proses dev | `9.2.1` | Dipakai lokal, bukan production |

## Dependency Frontend

| Package | Fungsi | Constraint | Risiko/Perhatian |
| --- | --- | --- | --- |
| `react` | UI runtime | `^18.3.1` | Harus sinkron dengan `react-dom` |
| `react-dom` | DOM renderer React | `^18.3.1` | Mismatch dengan React bisa bikin bug render |
| `@inertiajs/react` | Adapter React untuk Inertia | `^2.0` | Harus cocok dengan backend Inertia |
| `ziggy-js` | Helper route Laravel di frontend | `^2.5` | Rename route backend bisa memutus link frontend |
| `@reduxjs/toolkit` | State management modern | `^2.6` | Minimal risk |
| `react-redux` | Bind Redux ke React | `^9.2` | Harus cocok dengan React 18 |
| `redux` | Store core | `^5.0` | Stabil |
| `@table-library/react-table-library` | Komponen tabel data | `^4.1` | Peer styling bisa menambah kompleksitas |
| `chart.js` | Grafik | `^4.4` | Bundle bisa membesar kalau chart dipakai banyak |
| `react-chartjs-2` | Wrapper React untuk Chart.js | `^5.3` | Harus sinkron dengan Chart.js |
| `framer-motion` | Animasi UI | `^12.0` | Bundle bisa berat jika dipakai luas |
| `leaflet` | Peta interaktif | `^1.9.4` | Butuh asset CSS benar |
| `react-leaflet` | Integrasi Leaflet ke React | `^4.2.1` | Perlu perhatian lisensi dan asset map |
| `react-select` | Select dengan search | `^5.10` | Styling override kadang ribet |
| `react-date-picker` | Input tanggal | `^10.6` | Menambah dependency chain kalender |
| `react-hot-toast` | Notifikasi toast | `^2.5` | Minimal risk |
| `react-icons` | Koleksi ikon | `^5.5` | Bundle bisa membengkak bila import tidak disiplin |
| `classnames` | Susun class string | `^2.5` | Minimal risk |
| `nprogress` | Progress bar loading | `^0.2.0` | Package tua, tapi stabil |
| `react-international-phone` | Input nomor telepon internasional | `^4.2` | Tumpang tindih dengan package phone lain |
| `react-phone-input-2` | Input nomor telepon formatted | `^2.15` | Tumpang tindih dengan package phone lain |
| `react-text-mask` | Mask input | `^5.5` | Package lama |
| `text-mask-addons` | Helper mask input | `^3.8` | Ekosistem lama |

## Cara Instalasi

Instal dependency sesuai lock file:

```bash
composer install
npm ci
```

Menambahkan dependency PHP:

```bash
composer require vendor/package
```

Menambahkan dependency frontend:

```bash
npm install package-name
```

Setelah mengubah dependency:

```bash
composer validate
npm run build
php artisan test --compact
```

## Dampak Dependency terhadap Proyek

- Laravel + Inertia mengikat backend dan React tanpa API SPA terpisah.
- React + Redux Toolkit mengelola UI dan state global.
- Vite + Tailwind mempercepat build dan styling, tapi perlu Node modern.
- DomPDF mendukung PDF, tapi bisa berat untuk dokumen besar.
- Leaflet dan react-leaflet mendukung peta, tapi perlu perhatian asset CSS dan lisensi.
- Package telepon dan mask dobel perlu dievaluasi agar bundle tidak gemuk.

## Strategi Pemeliharaan

1. Gunakan `composer outdated --direct` dan `npm outdated` secara berkala.
2. Hindari constraint terlalu longgar seperti `barryvdh/laravel-dompdf: "*"`.
3. Commit `composer.lock` dan `package-lock.json`.
4. Jalankan CI setiap dependency berubah.
5. Uji upgrade mayor di branch terpisah.
6. Audit dependency yang fungsi domainnya tumpang tindih.
