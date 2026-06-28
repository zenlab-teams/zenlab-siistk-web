# Feature Documentation

Dokumen ini menjadi baseline fitur ZENLAB SIISTK. Detail bisa dilengkapi saat implementasi makin stabil.

## Authentication dan Role Access

- Tujuan: memberi akses login dan redirect sesuai role.
- Aktor: admin, sales, customer.
- Alur: user login, sistem cek role, lalu arahkan ke dashboard yang sesuai.
- Route: login/logout dan redirect role dari `routes/web.php`.
- Controller: `app/Http/Controllers/Auth`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Admin Dashboard

- Tujuan: menampilkan ringkasan operasional admin.
- Aktor: admin.
- Alur: admin login, masuk dashboard, melihat metrik utama dan aktivitas terbaru.
- Route: dashboard admin.
- Controller: `app/Http/Controllers/Admin/DashboardController.php`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Product dan Stock Management

- Tujuan: mengelola produk dan ledger stok.
- Aktor: admin.
- Alur: admin tambah, ubah, dan lihat produk lalu mencatat stok masuk atau penyesuaian.
- Route: product, stock, bulk create.
- Controller: `Admin/ProductController`, `Admin/StockController`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Order dan Invoice Management

- Tujuan: mengelola order dan konfirmasi invoice.
- Aktor: admin, customer.
- Alur: order dibuat, invoice dikonfirmasi, lalu data transaksi dipantau.
- Route: order dan invoice route di `routes/web.php`.
- Controller: `Admin/OrderController`, `Admin/InvoiceController`, `PublicOrderController`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Offer Workflow

- Tujuan: mengelola alur penawaran dari sales ke admin.
- Aktor: admin, sales.
- Alur: sales kirim offer record, admin review, lalu approve, reject, atau complete.
- Route: offer dan sales offer route di `routes/web.php`.
- Controller: `Admin/OfferController`, `Sales/OfferController`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Customer Management

- Tujuan: mengelola data customer.
- Aktor: admin, sales, customer.
- Alur: data customer dibuat, diperbarui, dan dipakai di transaksi.
- Route: customer route di `routes/web.php`.
- Controller: `Admin/CustomerController`, `Customer/DashboardController`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Sales Dashboard

- Tujuan: memberi ringkasan aktivitas sales.
- Aktor: sales.
- Alur: sales login, lihat aktivitas dan offer yang sedang berjalan.
- Route: dashboard sales.
- Controller: `Sales/DashboardController`.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Reusable UI Components

- Tujuan: menjaga UI konsisten dan reusable.
- Aktor: developer.
- Alur: halaman memakai komponen bersama untuk tabel, input, modal, dan button.
- Route: semua halaman UI yang memakai komponen shared.
- Controller: tidak spesifik; dipakai lintas page.
- Screenshot: Placeholder
- Status: Baseline tersedia.

## Catatan Update

- Screenshot aplikasi aktual perlu diganti dari placeholder.
- Detail validasi form penting perlu dilengkapi.
- Kondisi sukses, gagal, empty state, dan error state perlu ditulis.
- Hak akses per fitur perlu diperinci.
- Acceptance criteria bisa ditambahkan per fitur.
