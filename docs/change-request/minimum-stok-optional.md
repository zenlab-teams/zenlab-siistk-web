# Change Request: Optional Minimum Stok

Dokumen ini menjelaskan penambahan field `minimum` pada produk untuk kebutuhan stok kritis yang mengikuti batas per produk.

## Latar Belakang

Sebelumnya, stok kritis di sistem menggunakan ambang tetap. Dengan change request ini, setiap produk dapat punya batas minimum sendiri agar pengecekan stok lebih fleksibel.

## Perubahan Perilaku

- Field `minimum` ditambahkan ke produk dan bersifat optional / nullable.
- Jika `minimum` kosong, produk tidak dianggap stok kritis.
- Jika `minimum` terisi, produk dianggap stok kritis ketika `current stock < minimum`.
- Perhitungan stok kritis di dashboard dan index produk mengikuti nilai minimum masing-masing produk.

## Area yang Terdampak

| Area | Dampak |
| --- | --- |
| Create Product | Menambah input `minimum` saat membuat produk. |
| Edit Product | Menambah input `minimum` saat mengubah produk. |
| Bulk Create Product | Mendukung pengisian `minimum` per baris produk. |
| Dashboard | Daftar stok kritis memakai minimum per produk, bukan ambang global. |
| Product Index | Menampilkan penanda stok kritis saat stok berada di bawah minimum. |

## Verifikasi Singkat

- Buat produk tanpa `minimum` dan pastikan produk tidak masuk daftar stok kritis.
- Buat produk dengan `minimum` lalu kurangi stok sampai di bawah batas tersebut.
- Pastikan dashboard dan index menampilkan penanda stok kritis yang sesuai.
- Pastikan produk dengan stok di atas atau sama dengan minimum tidak ditandai kritis.

## Catatan

- Perbandingan stok kritis memakai aturan strictly `< minimum`.
- Perubahan ini dimaksudkan untuk tetap kompatibel dengan alur create, edit, dan bulk create yang sudah ada.
