# Dokumentasi Refactoring

Dokumen ini menjelaskan pola refactoring yang sudah terlihat pada repo ZENLAB SIISTK.

## Pola Refactoring Utama

### 1. DataTable reusable

Halaman index tidak dibangun sebagai tabel mentah berulang, tetapi memakai komponen `resources/js/Components/DataTable.jsx`. Pola ini mengurangi duplikasi untuk search, sort, pagination, selected row, dan action tombol.

### 2. Form Request untuk validasi

Validasi dipindahkan ke kelas request seperti `StoreProductRequest`, `UpdateProductRequest`, `StoreOrderRequest`, dan request lain di `app/Http/Requests`. Hasilnya controller lebih bersih dan aturan validasi lebih mudah dirawat.

### 3. `casts()` pada model

Model mengikuti pola `casts(): array` agar casting atribut didefinisikan secara konsisten di kelas model, bukan lewat properti lama.

### 4. Controller dipisahkan per role

Controller dibedakan menurut area akses:

- `app/Http/Controllers/Admin`
- `app/Http/Controllers/Sales`
- `app/Http/Controllers/Customer`
- `app/Http/Controllers/Auth`

Pembagian ini memudahkan pembacaan alur bisnis dan batas tanggung jawab tiap role.

### 5. Komponen input dan modal yang reusable

Frontend memakai komponen bersama seperti input teks, angka, gambar, select, checkbox, dan modal. Pola ini menjaga konsistensi UI dan mempercepat pembuatan halaman baru.

### 6. Routing yang terstruktur

Route dikelompokkan berdasarkan prefix dan middleware. Struktur ini membuat akses admin, sales, customer, dan public order lebih jelas, sekaligus memudahkan pemeliharaan endpoint.

## Manfaat

- Mengurangi duplikasi kode
- Memudahkan maintenance
- Menjaga konsistensi UI dan validasi
- Memisahkan tanggung jawab antar layer aplikasi

## Catatan

- Dokumen ini merangkum pola yang sudah berjalan di repo, bukan daftar refactor yang masih direncanakan.
- Jika pola baru ditambahkan, bagian ini perlu diperbarui.
