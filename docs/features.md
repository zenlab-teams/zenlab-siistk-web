# Dokumentasi Fitur

Dokumen ini merangkum fitur yang tersedia pada repo ZENLAB SIISTK berdasarkan route, controller, dan halaman React yang sudah ada.

## Fitur Berdasarkan Role

### Admin

| Modul | Lokasi | Deskripsi |
| --- | --- | --- |
| Login | `app/Http/Controllers/Auth` dan `resources/js/Pages/Login.jsx` | Akses ke sistem untuk role yang valid. |
| Dashboard | `routes/web.php`, `resources/js/Pages/Dashboard.jsx` | Ringkasan operasional dan analitik bisnis. |
| Produk | `app/Http/Controllers/Admin/ProductController.php`, `resources/js/Pages/Product/*` | CRUD produk, bulk create, detail produk, dan stok produk. |
| Stok | `app/Http/Controllers/Admin/StockController.php`, `resources/js/Pages/Product/Stock/Create.jsx` | Input stok masuk sebagai ledger append-only. |
| User | `app/Http/Controllers/Admin/UserController.php`, `resources/js/Pages/User/*` | CRUD pengguna sistem. |
| Customer | `app/Http/Controllers/Admin/CustomerController.php`, `resources/js/Pages/Customer/*` | CRUD data customer dan quick create. |
| Order | `app/Http/Controllers/Admin/OrderController.php`, `resources/js/Pages/Order/*` | Pembuatan, detail, dan pengelolaan order. |
| Invoice / Payment | `app/Http/Controllers/Admin/InvoiceController.php` | Persetujuan dan penolakan pembayaran invoice. |
| Offer | `app/Http/Controllers/Admin/OfferController.php`, `resources/js/Pages/Offer/*` | Alur penawaran, record, approve, reject, dan complete. |

### Sales

| Modul | Lokasi | Deskripsi |
| --- | --- | --- |
| Sales Dashboard | `app/Http/Controllers/Sales/DashboardController.php`, `resources/js/Pages/Sales/Dashboard.jsx` | Ringkasan aktivitas untuk tim sales. |
| Sales Offer | `app/Http/Controllers/Sales/OfferController.php`, `resources/js/Pages/Sales/Offer/*` | Melihat daftar offer dan mengirim offer record. |
| Customer Quick Create | `routes/web.php` | Membuat customer secara cepat dari alur transaksi. |

### Customer

| Modul | Lokasi | Deskripsi |
| --- | --- | --- |
| Customer Dashboard | `app/Http/Controllers/Customer/DashboardController.php`, `resources/js/Pages/Customer/Dashboard.jsx` | Halaman ringkasan untuk customer yang login. |
| Profile / Data Customer | `resources/js/Pages/Customer/*` | Form create dan edit data customer. |
| Public Order | `app/Http/Controllers/PublicOrderController.php`, `resources/js/Pages/Public/Order/Show.jsx` | Halaman publik untuk melihat order dan melakukan payment. |

## Fitur Umum Aplikasi

- Autentikasi login dan logout
- Redirect berdasarkan role setelah login
- Tabel data dengan search, sort, pagination, dan bulk action
- Form input reusable untuk teks, angka, gambar, checkbox, dan select
- Layout dashboard yang konsisten untuk tiap role

## Catatan

- Semua fitur di atas berasal dari route, controller, dan halaman yang memang sudah ada di repo.
- Jika modul baru ditambahkan, dokumen ini perlu diperbarui agar tetap sesuai keadaan proyek.
