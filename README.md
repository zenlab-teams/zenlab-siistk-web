<p align="center">
  <img src="resources/assets/image/Logo.svg" alt="Logo SIISTK" width="160">
</p>

<h1 align="center">SIISTK</h1>

<p align="center">
  <strong>Sistem Informasi Inventory Stok Telaten Karya</strong>
</p>

<p align="center">
  <a href="https://github.com/zenlab-teams/zenlab-siistk-web/actions/workflows/ci.yml">
    <img src="https://github.com/zenlab-teams/zenlab-siistk-web/actions/workflows/ci.yml/badge.svg" alt="Laravel CI">
  </a>
</p>

## Deskripsi Proyek

SIISTK adalah aplikasi berbasis web untuk membantu TelatenKarya mengelola
penjualan, inventori, customer, penawaran, pesanan, pembayaran, dan target sales
secara terpusat.

Aplikasi ini dibangun untuk mempermudah pemantauan stok, mempercepat pencatatan
pesanan, menjaga alur penawaran dari sales ke admin, dan menyediakan dashboard
operasional bagi setiap role pengguna.

Target pengguna SIISTK adalah admin operasional, sales representative, dan
customer yang berinteraksi dengan proses pemesanan produk TelatenKarya.

## Fitur Utama

- Login dan logout dengan pemisahan role admin, sales, dan customer.
- Dashboard berbeda untuk admin, sales, dan customer.
- Manajemen produk lengkap dengan harga, deskripsi, thumbnail, dan audit pembuat.
- Ledger stok append-only untuk stok masuk, stok keluar, dan penyesuaian.
- Perhitungan stok produk berdasarkan total mutasi stok.
- Manajemen customer untuk kebutuhan transaksi dan administrasi.
- Manajemen order, item order, pembayaran, dan invoice.
- Status order berbasis timestamp: pending, paid, completed, cancelled, dan expired.
- Alur penawaran mingguan dari sales ke admin.
- Pencatatan produk yang dibawa sales dalam offer.
- Pencatatan laporan penjualan sales melalui record offer.
- Approval, rejection, dan completion offer oleh admin.
- Manajemen user dengan role admin, sales, dan customer.
- Target sales berdasarkan periode tanggal.
- Upload gambar produk melalui public storage.
- Tabel reusable dengan search, pagination, select row, dan bulk delete.
- Komponen UI reusable untuk button, input, modal, dan pagination.
- Dark mode berbasis Redux dan session storage.
- Antarmuka responsif untuk desktop dan mobile.

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
| --- | --- |
| PHP 8.2+ | Bahasa pemrograman backend |
| Laravel 12 | Framework utama aplikasi |
| React 18 | Library antarmuka frontend |
| Inertia.js 2 | Bridge Laravel dan React tanpa API terpisah |
| Redux Toolkit 2 | State management frontend |
| Tailwind CSS 3.4 | Styling antarmuka |
| Vite 7 | Build tool aset frontend |
| MySQL | Basis data aplikasi |
| DomPDF 3 | Generate dokumen PDF |
| Pest 3 | Pengujian aplikasi |
| Laravel Pint | Format kode PHP |
| GitHub Actions | Build dan test otomatis |

## Instalasi Singkat

### Prasyarat

Pastikan perangkat sudah memiliki:

- PHP 8.2 atau lebih baru
- Composer
- Node.js dan npm
- MySQL
- Git

### Langkah Instalasi

1. Clone repositori dan masuk ke direktori proyek.

    ```bash
    git clone https://github.com/zenlab-teams/zenlab-siistk-web.git
    cd zenlab-siistk-web
    ```

2. Instal dependensi backend dan frontend.

    ```bash
    composer install
    npm install
    ```

3. Salin berkas konfigurasi lingkungan dan buat application key.

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

    Pada Windows PowerShell, salin `.env` dengan perintah berikut.

    ```powershell
    Copy-Item .env.example .env
    ```

4. Buat database MySQL bernama `zenlab_siistk`, kemudian sesuaikan konfigurasi
   database pada berkas `.env`.

    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=zenlab_siistk
    DB_USERNAME=root
    DB_PASSWORD=
    ```

5. Jalankan migrasi, seeder, dan storage link.

    ```bash
    php artisan migrate --seed
    php artisan storage:link
    ```

6. Build aset frontend.

    ```bash
    npm run build
    ```

7. Jalankan aplikasi.

    ```bash
    composer run dev
    ```

Aplikasi dapat dibuka melalui `http://127.0.0.1:8000`.

### Akun Pengembangan

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@zenlab.dev` | `password` |
| Sales | `sales@zenlab.dev` | `password` |

> Akun di atas berasal dari seeder dan hanya ditujukan untuk lingkungan
> pengembangan. Ganti kredensial sebelum aplikasi digunakan pada lingkungan
> produksi.

### Catatan Pengembangan

- Jalankan `php artisan migrate:fresh --seed` jika ingin reset database lokal.
- Jalankan `vendor/bin/pint --dirty` sebelum menyelesaikan perubahan PHP.
- Gunakan Form Request untuk validasi request Laravel.
- Gunakan `DataTable` untuk halaman index/list.
- Simpan upload produk di disk `public` melalui path `productImages/`.

## Screenshot Proyek

### Halaman Login

![Halaman Login](docs/screenshots/Screenshot%202026-06-18%20235101.png)

### Dashboard

![Dashboard](docs/screenshots/Screenshot%202026-06-18%20235149.png)

### Manajemen Produk

![Manajemen Produk](docs/screenshots/Screenshot%202026-06-18%20235204.png)

### Manajemen Pesanan

![Manajemen Pesanan](docs/screenshots/Screenshot%202026-06-18%20235217.png)

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [Panduan instalasi](docs/installation.md) | Persyaratan, setup, test, dan troubleshooting |
| [Dokumentasi fitur](docs/features.md) | Aktor, alur, route, controller, dan status fitur |
| [Dokumentasi dependency](docs/dependency.md) | Package, versi, fungsi, dampak, dan risiko |
| [Dokumentasi refactoring](docs/refactoring.md) | Masalah, perubahan, alasan, dampak, dan bukti commit |
| [Dokumentasi GitHub Actions](docs/github-actions.md) | Trigger, tahapan CI, hasil, dan pengembangan lanjutan |
| [Changelog](CHANGELOG.md) | Riwayat perubahan dan evolusi proyek |

## Menjalankan Verifikasi

```bash
npm run build
php artisan test --compact
```

## Tim Pengembang

| Nama | NIM | Peran |
| --- | --- | --- |
| Ihsan Nul Amri | 2411082008 | Project Manager & Lead Programmer |
| Dwi Melza Utari | 2411083005 | Quality Assurance |
| Achmad Ghozali | 2411083001 | AI Specialist |
| Faizul Ananda | 2411083006 | System Analyst |

---