# Dokumentasi Refactoring

Dokumen ini menjelaskan pola refactor yang sudah terlihat pada repo ZENLAB SIISTK.

## DataTable reusable

### Sebelum
Masalah:
- Halaman index berpotensi memakai tabel mentah berulang.
- Search, sort, pagination, selected row, dan action tombol bisa duplikatif di banyak halaman.

### Perubahan
Apa yang diubah:
- Halaman index memakai komponen `resources/js/Components/DataTable.jsx`.

### Alasan
Kenapa refactor diperlukan:
- Mengurangi duplikasi kode tabel.
- Menjaga perilaku list page tetap konsisten.

### Dampak
Hasil setelah refactor:
- Search, sort, pagination, selected row, dan action tombol dikelola dari satu komponen reusable.

## Form Request untuk validasi

### Sebelum
Masalah:
- Validasi berisiko tersebar di controller.
- Controller bisa terlalu banyak menangani detail request.

### Perubahan
Apa yang diubah:
- Validasi dipindahkan ke kelas request di `app/Http/Requests`.

### Alasan
Kenapa refactor diperlukan:
- Memisahkan validasi dari controller.
- Membuat aturan validasi lebih mudah diuji dan dirawat.

### Dampak
Hasil setelah refactor:
- Controller lebih fokus pada alur bisnis.
- Validasi lebih konsisten antar fitur.

## `casts()` pada model

### Sebelum
Masalah:
- Casting atribut model bisa tidak konsisten jika memakai pola lama.

### Perubahan
Apa yang diubah:
- Model memakai method `casts(): array`.

### Alasan
Kenapa refactor diperlukan:
- Menyesuaikan pola Laravel modern.
- Menjaga definisi casting tetap eksplisit.

### Dampak
Hasil setelah refactor:
- Casting atribut lebih konsisten dan mudah dibaca.

## Controller dipisahkan per role

### Sebelum
Masalah:
- Controller berpotensi bercampur antar area akses admin, sales, customer, dan auth.

### Perubahan
Apa yang diubah:
- Controller dipisahkan ke folder role:
  - `app/Http/Controllers/Admin`
  - `app/Http/Controllers/Sales`
  - `app/Http/Controllers/Customer`
  - `app/Http/Controllers/Auth`

### Alasan
Kenapa refactor diperlukan:
- Memperjelas batas tanggung jawab tiap role.
- Memudahkan pembacaan alur bisnis.

### Dampak
Hasil setelah refactor:
- Struktur controller lebih rapi.
- Batas akses dan konteks fitur lebih mudah dipahami.

## Komponen input dan modal reusable

### Sebelum
Masalah:
- Input dan modal berpotensi dibuat ulang di banyak halaman.
- Tampilan dan perilaku UI bisa tidak konsisten.

### Perubahan
Apa yang diubah:
- Frontend memakai komponen bersama untuk input teks, angka, gambar, select, checkbox, dan modal.

### Alasan
Kenapa refactor diperlukan:
- Menjaga konsistensi UI.
- Mempercepat pembuatan halaman baru.

### Dampak
Hasil setelah refactor:
- Komponen form dan modal lebih seragam.
- Duplikasi UI berkurang.

## Routing terstruktur

### Sebelum
Masalah:
- Route berpotensi sulit dibaca jika tidak dikelompokkan.

### Perubahan
Apa yang diubah:
- Route dikelompokkan berdasarkan prefix dan middleware.

### Alasan
Kenapa refactor diperlukan:
- Memperjelas akses admin, sales, customer, dan public order.
- Memudahkan pemeliharaan endpoint.

### Dampak
Hasil setelah refactor:
- Struktur route lebih jelas.
- Endpoint lebih mudah dilacak berdasarkan role dan area fitur.
