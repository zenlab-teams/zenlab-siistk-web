# ZENLAB SIISTK - TelatenKarya Admin Dashboard

**ZENLAB SIISTK** adalah aplikasi manajemen operasional untuk **TelatenKarya** yang dibangun menggunakan Laravel 12, React 19, dan Inertia.js v2. Aplikasi ini dirancang untuk mempermudah pengelolaan stok, produk, dan transaksi penjualan dengan sistem otorisasi berbasis peran (Role-Based Access Control).

---

## 🚀 Stack Teknologi

- **Backend**: Laravel 12 (PHP ^8.2)
- **Frontend**: React 19 (Inertia.js v2)
- **Styling**: TailwindCSS & Vanilla CSS
- **Database**: MySQL / PostgreSQL
- **Testing**: Pest PHP v3
- **Formatter**: Laravel Pint

---

## ✨ Fitur Utama

- **Multi-Role**: Sistem akses untuk `admin`, `sales`, dan `customer`.
- **Stock Ledger**: Pencatatan stok barang masuk dan keluar secara append-only.
- **Product Management**: Pengelolaan data produk lengkap dengan upload foto (thumbnail).
- **Sales Reporting**: Export laporan penjualan dalam format PDF dan Excel.
- **Interactive Dashboard**: Visualisasi data harian dan mingguan menggunakan Chart.js.
- **DataTable Component**: Komponen tabel yang reusable dengan fitur search, sort, dan pagination.

---

## 🛠️ Instalasi & Persiapan

Ikuti langkah berikut untuk menjalankan proyek di lingkungan lokal:

1. **Clone Repositori**
   ```bash
   git clone https://github.com/zenlab-siistk-web.git
   cd zenlab-siistk-web
   ```

2. **Instalasi Dependency**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Migrasi Database**
   ```bash
   php artisan migrate
   ```

5. **Menjalankan Aplikasi**
   Gunakan perintah berikut untuk menjalankan server Laravel dan Vite secara bersamaan:
   ```bash
   composer run dev
   ```

---

## 📦 Dokumentasi Dependency (5W + 1H)

Berikut adalah daftar package utama yang digunakan dalam proyek ini beserta penjelasannya:

### 1. Inertia.js
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Inertia.js (Bridge Laravel-React) |
| **Why** | Memberikan pengalaman Single Page Application (SPA) tanpa kerumitan membangun API terpisah. |
| **Who** | Admin dan User Sales |
| **When** | Saat perpindahan halaman atau pengiriman data secara asinkron. |
| **Where** | Folder `app/Http/Controllers` dan `resources/js/Pages`. |
| **How** | Menggunakan helper `Inertia::render()` pada controller dan komponen `<Link>` di React. |
| **Reference** | [inertiajs.com](https://inertiajs.com/) |

### 2. Spatie Laravel Permission
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Spatie Laravel Permission |
| **Why** | Memisahkan hak akses fitur untuk role `admin`, `sales`, dan `customer`. |
| **Who** | Admin Sistem |
| **When** | Saat login dan pengecekan otorisasi akses menu/fitur. |
| **Where** | Middleware, Controller, dan Model User. |
| **How** | Menggunakan trait `HasRoles` dan pengecekan via `$user->can()` atau middleware `role`. |
| **Reference** | [spatie.be/docs/laravel-permission](https://spatie.be/docs/laravel-permission) |

### 3. Laravel DomPDF
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Laravel DomPDF |
| **Why** | Memudahkan pembuatan dokumen resmi (invoice/laporan) yang siap cetak. |
| **Who** | Admin dan Sales |
| **When** | Saat user menekan tombol "Cetak Laporan" atau "Download PDF". |
| **Where** | Modul Laporan dan Invoice. |
| **How** | Mengubah tampilan Blade HTML menjadi file PDF menggunakan facade `Pdf`. |
| **Reference** | [github.com/barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) |

### 4. Tightenco Ziggy
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Tightenco Ziggy |
| **Why** | Menghindari hardcoding URL di frontend sehingga route tetap sinkron dengan backend. |
| **Who** | Developer |
| **When** | Saat mendefinisikan endpoint URL pada komponen React. |
| **Where** | File `.jsx` di dalam folder `resources/js`. |
| **How** | Memanggil helper `route('nama.route')` langsung di JavaScript. |
| **Reference** | [github.com/tighten/ziggy](https://github.com/tighten/ziggy) |

### 5. Maatwebsite Laravel Excel
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Laravel Excel |
| **Why** | Mempercepat implementasi fitur export/import data tanpa membuat fungsi manual. |
| **Who** | Admin Sistem |
| **When** | Saat admin melakukan export laporan transaksi atau import data stok. |
| **Where** | Modul Laporan dan Manajemen Stok. |
| **How** | Install via Composer dan dipanggil pada controller menggunakan facade `Excel`. |
| **Reference** | [laravel-excel.com](https://docs.laravel-excel.com/) |

### 6. Spatie Laravel Medialibrary
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Spatie Laravel Medialibrary |
| **Why** | Menangani optimasi gambar dan pembuatan thumbnail secara otomatis. |
| **Who** | Admin |
| **When** | Saat mengupload foto produk atau profil user. |
| **Where** | Model Product dan modul upload gambar. |
| **How** | Menggunakan interface `HasMedia` dan method `addMediaFromRequest`. |
| **Reference** | [spatie.be/docs/laravel-medialibrary](https://spatie.be/docs/laravel-medialibrary) |

### 7. Laravel Debugbar
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Laravel Debugbar |
| **Why** | Memantau query database, performa, dan log aplikasi secara real-time. |
| **Who** | Developer |
| **When** | Saat tahap pengembangan (development) dan perbaikan bug. |
| **Where** | Ditampilkan di bagian bawah browser saat aplikasi dijalankan. |
| **How** | Install via Composer (dev) dan otomatis muncul di aplikasi Laravel. |
| **Reference** | [github.com/barryvdh/laravel-debugbar](https://github.com/barryvdh/laravel-debugbar) |

### 8. Laravel Pint
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Laravel Pint |
| **Why** | Memastikan seluruh kode PHP mengikuti standar penulisan yang rapi dan konsisten. |
| **Who** | Developer |
| **When** | Sebelum melakukan commit atau setelah merubah kode PHP. |
| **Where** | Lingkungan pengembangan via Terminal. |
| **How** | Menjalankan perintah `vendor/bin/pint` di terminal. |
| **Reference** | [laravel.com/docs/11.x/pint](https://laravel.com/docs/11.x/pint) |

### 9. Pest PHP
| 5W+1H | Penjelasan |
| :--- | :--- |
| **What** | Pest PHP |
| **Why** | Mempermudah penulisan tes aplikasi dengan sintaks yang lebih deskriptif. |
| **Who** | Developer (QA) |
| **When** | Saat melakukan Automated Testing (Unit/Feature Test). |
| **Where** | Folder `tests/` dalam struktur Laravel. |
| **How** | Menggunakan fungsi `it()` atau `test()` untuk memverifikasi logika fitur. |
| **Reference** | [pestphp.com](https://pestphp.com/) |

---

## 🛠️ Standar Pengembangan

- **Code Style**: Selalu jalankan `vendor/bin/pint --dirty` sebelum melakukan commit untuk menjaga kerapian kode PHP.
- **Testing**: Gunakan `php artisan test` untuk menjalankan pengujian menggunakan Pest PHP.
- **Route Naming**: Gunakan format `resource.action` (contoh: `product.index`, `product.store`).

---

## 📄 Lisensi

Proyek ini dikembangkan untuk tujuan PBL (Project-Based Learning) dan menggunakan lisensi [MIT](https://opensource.org/licenses/MIT).
