# ADR-001 — Pemilihan Layered Monolith untuk Sistem Inventaris Toko Bangunan Telaten Karya

## 1. Task 1 — Define

### 1.1 Business Context

#### Latar Belakang
Sistem Inventaris Toko Bangunan Telaten Karya dibangun untuk menjawab kebutuhan pengelolaan persediaan yang selama ini masih dilakukan secara manual. Pada kondisi manual, pencatatan barang masuk, barang keluar, stok aktual, transaksi penjualan, dan pembuatan laporan sangat bergantung pada ketelitian manusia. Pola seperti ini rawan menimbulkan selisih stok, keterlambatan informasi, serta kesulitan dalam menelusuri riwayat transaksi ketika terjadi ketidaksesuaian data.

Dalam operasional toko bangunan, volume barang cenderung banyak, jenis barang sangat beragam, dan frekuensi pergerakan stok dapat terjadi setiap hari. Kondisi tersebut menuntut sistem yang mampu menyediakan informasi stok secara cepat, akurat, dan mudah diaudit. Karena itu, aplikasi berbasis web menjadi solusi yang relevan untuk mengintegrasikan proses login, manajemen user, manajemen barang, kategori, supplier, barang masuk, barang keluar, transaksi penjualan, pembuatan nota, laporan PDF, monitoring stok, serta notifikasi stok minimum.

#### Tujuan Bisnis
Tujuan bisnis utama sistem ini adalah mendigitalisasi seluruh proses inventaris agar pengelolaan persediaan menjadi lebih terstruktur, cepat, dan andal. Sistem dirancang untuk mengurangi ketergantungan pada pencatatan manual, mempercepat pelayanan transaksi, dan menyediakan data operasional yang dapat digunakan untuk pengambilan keputusan oleh admin maupun owner.

Selain itu, sistem ini bertujuan memperkuat kontrol terhadap stok barang. Dengan data yang tersimpan terpusat, setiap pergerakan barang dapat dipantau secara real-time, sehingga toko dapat segera mengetahui kondisi stok minimum, mencegah kekosongan barang, dan mengurangi risiko kehilangan peluang penjualan akibat data persediaan yang tidak akurat.

#### Business Value
Business value dari sistem ini dapat dipandang dari dua sisi, yaitu tangible dan intangible.

**Tangible Value**
Tangible value muncul dalam bentuk manfaat yang dapat diukur secara langsung. Pertama, sistem mempercepat proses transaksi penjualan dan pencatatan barang masuk atau keluar, sehingga waktu layanan kasir dan admin menjadi lebih efisien. Kedua, penggunaan laporan digital mengurangi biaya operasional untuk pencetakan dokumen, rekap manual, dan koreksi data berulang. Ketiga, keakuratan stok yang lebih baik membantu mencegah selisih persediaan yang dapat menimbulkan kerugian finansial. Keempat, notifikasi stok minimum mendukung keputusan pembelian ulang lebih cepat sehingga mengurangi potensi kehilangan penjualan.

**Intangible Value**
Intangible value terletak pada peningkatan kualitas tata kelola informasi dan kepercayaan terhadap sistem. Data yang tersusun rapi meningkatkan transparansi aktivitas inventaris dan memudahkan audit internal. Sistem juga membangun budaya kerja yang lebih tertib karena setiap transaksi memiliki jejak digital yang jelas. Bagi manajemen, ketersediaan informasi yang cepat dan konsisten meningkatkan kualitas pengambilan keputusan, sedangkan bagi pelanggan, nota yang tertata dan proses pelayanan yang lebih cepat meningkatkan pengalaman layanan secara keseluruhan.

### 1.2 Technical Context

#### Arsitektur Sistem Secara Umum
Secara umum, sistem ini menggunakan arsitektur web berbasis aplikasi terpusat. Pengguna mengakses sistem melalui browser, kemudian permintaan diproses oleh lapisan presentasi, controller, service, dan repository sebelum berinteraksi dengan database. Pola ini memungkinkan pemisahan tanggung jawab yang jelas antara antarmuka, logika aplikasi, dan akses data.

Dalam konteks implementasi Laravel, pendekatan ini cocok karena framework menyediakan dukungan kuat untuk routing, middleware, ORM, autentikasi, validasi, pengelolaan file, dan rendering antarmuka berbasis server maupun Inertia.js. Arsitektur tersebut memudahkan pengembangan fitur administratif yang dominan pada sistem inventaris.

#### Aktor Sistem
Aktor utama dalam sistem ini adalah admin, sales, owner, dan pelanggan. Admin berperan mengelola user, barang, kategori, supplier, stok, transaksi, dan laporan. Sales menangani transaksi dan kebutuhan operasional penjualan. Owner berfokus pada pemantauan ringkasan bisnis, laporan, serta kondisi stok. Pelanggan tidak memiliki akses administratif penuh, tetapi dapat melihat nota atau informasi transaksi yang relevan.

Perbedaan hak akses antar aktor penting untuk menjaga keamanan data dan memastikan setiap pengguna hanya mengakses fitur sesuai perannya. Dengan demikian, proses bisnis tetap terkendali dan struktur otorisasi menjadi lebih mudah dipelihara.

#### Fitur Utama
Fitur inti sistem meliputi login, logout, dashboard, manajemen user, manajemen barang, manajemen kategori, manajemen supplier, barang masuk, barang keluar, stok barang, transaksi penjualan, pembuatan nota, monitoring stok, laporan PDF, riwayat transaksi, dan notifikasi stok minimum. Seluruh fitur tersebut saling terhubung dalam alur inventaris yang berkesinambungan.

Fitur dashboard memberikan ringkasan operasional, sedangkan laporan PDF dan riwayat transaksi mendukung kebutuhan dokumentasi dan evaluasi. Monitoring stok dan notifikasi minimum berperan sebagai kontrol preventif agar ketersediaan barang tetap terjaga.

#### Kendala Teknis
Kendala teknis utama sistem ini adalah kebutuhan akurasi data yang tinggi, konsistensi transaksi stok, serta kemudahan pemeliharaan kode. Karena stok merupakan data yang sensitif terhadap perubahan, sistem harus mampu mencegah update yang tidak sah dan memastikan setiap transaksi tercatat dengan benar.

Kendala lain adalah kebutuhan performa yang cukup stabil saat banyak pengguna mengakses laporan, transaksi, dan data stok secara bersamaan. Di sisi lain, sistem harus tetap mudah dikembangkan oleh tim kecil, sehingga kompleksitas infrastruktur tidak boleh terlalu tinggi. Aspek integrasi antarmodul juga menjadi tantangan karena proses barang masuk, barang keluar, penjualan, dan laporan memiliki dependensi bisnis yang erat.

#### Teknologi yang Sesuai Jika Menggunakan Laravel
Teknologi yang sesuai untuk sistem ini adalah Laravel sebagai framework utama, PHP sebagai bahasa pemrograman, MySQL sebagai basis data, JavaScript untuk interaktivitas antarmuka, dan Tailwind atau Bootstrap untuk styling. Laravel cocok karena menyediakan ekosistem yang matang untuk autentikasi, middleware, queue, validasi, file storage, dan ORM Eloquent.

Jika diperlukan integrasi antarlapisan, REST API dapat digunakan sebagai antarmuka komunikasi data yang terstruktur. Untuk kebutuhan tampilan modern dan responsif, Laravel dapat dipadukan dengan Inertia.js atau komponen frontend berbasis React. Kombinasi teknologi tersebut memberikan keseimbangan antara produktivitas pengembangan dan kemudahan pemeliharaan.

### 1.3 Architecture Characteristics

#### Security
Keamanan merupakan karakteristik arsitektur yang paling penting karena sistem mengelola data operasional, data user, dan data transaksi yang bersifat sensitif. Setiap pengguna memiliki peran dan hak akses berbeda, sehingga sistem harus menerapkan autentikasi, otorisasi berbasis role, pembatasan akses route, dan perlindungan terhadap tindakan tidak sah.

Selain pembatasan akses, keamanan juga mencakup perlindungan data selama proses input dan penyimpanan. Validasi form, sanitasi input, penggunaan middleware, dan pencatatan aktivitas penting membantu mencegah kesalahan maupun penyalahgunaan. Dalam konteks toko bangunan, kebocoran data stok atau transaksi dapat berdampak langsung pada kerugian finansial dan turunnya kepercayaan manajemen.

#### Performance
Performa diperlukan agar sistem tetap responsif ketika menampilkan daftar barang, riwayat transaksi, laporan, dan dashboard. Karena data inventaris dapat bertambah terus-menerus, arsitektur harus mampu memproses query dengan efisien, menggunakan seleksi data yang tepat, dan menghindari beban berlebih pada aplikasi.

Dalam implementasi Laravel, performa dapat dijaga dengan optimasi query, eager loading, pagination, caching untuk data yang sering dibaca, serta pemisahan tanggung jawab logika bisnis. Dengan pendekatan ini, sistem tetap cepat digunakan tanpa harus mengorbankan konsistensi data.

#### Maintainability
Maintainability penting karena sistem inventaris biasanya terus berkembang mengikuti kebutuhan operasional toko. Struktur kode yang rapi memudahkan penambahan modul baru, perubahan aturan bisnis, serta perbaikan bug tanpa mengganggu fitur lain. Karena itu, pemisahan controller, service, repository, dan model menjadi sangat relevan.

Arsitektur yang mudah dipelihara juga mengurangi waktu onboarding bagi pengembang baru. Dokumentasi yang baik, penamaan modul yang konsisten, dan pemisahan tanggung jawab yang tegas akan membantu tim menjaga kualitas sistem dalam jangka panjang.

#### Reliability
Reliability atau keandalan dibutuhkan agar sistem dapat menyimpan dan menampilkan data secara konsisten. Pada sistem inventaris, satu kesalahan kecil dalam pencatatan dapat menyebabkan selisih stok dan mempersulit audit. Karena itu, transaksi data harus dirancang agar aman dari kehilangan data dan inkonsistensi.

Keandalan juga berarti sistem tetap berjalan sesuai aturan bisnis ketika terjadi proses yang berulang, seperti pencatatan barang masuk atau penjualan. Dengan desain yang baik, setiap perubahan stok tercatat sebagai jejak yang dapat ditelusuri kembali, sehingga integritas data tetap terjaga.

#### Scalability
Scalability menjadi penting karena jumlah data barang, transaksi, dan laporan dapat meningkat seiring pertumbuhan usaha. Walaupun sistem tidak langsung membutuhkan skala sangat besar, arsitektur harus cukup fleksibel untuk menangani pertumbuhan data dan pengguna tanpa perubahan struktural yang ekstrem.

Dalam konteks ini, skalabilitas bukan berarti langsung membangun sistem terdistribusi. Yang lebih tepat adalah memastikan aplikasi monolit tetap memiliki struktur internal yang modular, sehingga penambahan kapasitas server, optimasi query, dan pemisahan layer dapat dilakukan dengan mudah saat beban meningkat.

#### Availability
Availability diperlukan agar sistem dapat digunakan pada jam operasional toko ketika transaksi berlangsung aktif. Jika sistem tidak tersedia, proses penjualan, pencatatan stok, dan pembuatan nota dapat terhambat. Hal ini dapat mengganggu pelayanan pelanggan dan operasional kasir.

Ketersediaan sistem dapat dijaga melalui pengelolaan server yang baik, backup database rutin, monitoring error, serta desain aplikasi yang tidak bergantung pada komponen terlalu kompleks. Bagi sistem inventaris, availability yang stabil lebih bernilai daripada arsitektur yang terlalu rumit tetapi sulit dipelihara.

#### Usability
Usability sangat penting karena pengguna sistem berasal dari latar belakang operasional yang beragam, bukan hanya pengembang atau staf teknis. Antarmuka harus mudah dipahami, alur input harus ringkas, dan informasi penting seperti stok minimum atau status transaksi harus mudah ditemukan.

Kemudahan penggunaan berpengaruh langsung pada adopsi sistem. Jika aplikasi terlalu rumit, pengguna cenderung kembali ke pencatatan manual. Oleh karena itu, desain antarmuka yang sederhana, konsisten, dan responsif menjadi bagian dari karakteristik arsitektur yang wajib dipenuhi.

## 2. Task 2 — Significant Architectural Decision

### 2.1 Layered Monolith Architecture
Layered Monolith adalah pendekatan arsitektur di mana seluruh fungsi utama aplikasi ditempatkan dalam satu sistem terpusat, tetapi tetap dipisahkan ke dalam beberapa layer logis. Setiap layer memiliki tanggung jawab yang berbeda, misalnya presentation layer untuk tampilan, controller layer untuk menerima request, service layer untuk logika bisnis, repository layer untuk akses data, dan database untuk penyimpanan.

Pendekatan ini cocok untuk Sistem Inventaris Toko Bangunan Telaten Karya karena domain bisnisnya cukup luas, tetapi alur integrasinya masih erat dan saling bergantung. Dengan monolit berlapis, pengembangan tetap terfokus dalam satu codebase, namun struktur internalnya tetap rapi dan mudah diorganisasi.

#### Diagram Layer Sederhana
Presentation Layer
↓
Controller Layer
↓
Service Layer
↓
Repository Layer
↓
Database

#### Penempatan Modul pada Layer
- **Login** ditempatkan pada presentation untuk form dan tampilan, controller untuk proses autentikasi, service untuk validasi alur login, repository untuk akses user, dan database untuk penyimpanan kredensial.
- **User** dikelola pada controller dan service untuk CRUD, role assignment, dan sinkronisasi profil, dengan repository sebagai perantara ke database.
- **Barang** ditempatkan pada service untuk aturan bisnis produk, repository untuk query data barang, dan presentation untuk daftar serta form input.
- **Supplier** mengikuti pola yang sama dengan user dan barang, dengan logika bisnis sederhana yang tetap dipisahkan dari akses data.
- **Kategori** berada pada layer yang ringan, tetapi tetap diproses melalui service agar konsisten dengan modul lain.
- **Barang Masuk** dan **Barang Keluar** memerlukan service yang lebih dominan karena keduanya memengaruhi stok dan riwayat transaksi.
- **Penjualan** melibatkan controller, service, repository, dan database karena prosesnya terhubung dengan stok, nota, dan histori transaksi.
- **Laporan** ditempatkan pada service untuk agregasi data, sementara presentation hanya menampilkan hasil atau ekspor PDF.
- **Dashboard** memanfaatkan service untuk kompilasi ringkasan data dari beberapa modul.

#### Alasan Pemilihan Layered Monolith
1. Kompleksitas sistem masih berada pada tingkat menengah sehingga belum memerlukan pemisahan layanan yang ekstrem.
2. Satu codebase memudahkan pengembangan, debugging, dan pengujian oleh tim kecil.
3. Integrasi antarfitur inventaris, stok, dan penjualan lebih sederhana karena seluruh logika berada dalam satu aplikasi.
4. Biaya infrastruktur lebih rendah dibandingkan pendekatan microservices yang memerlukan banyak layanan dan orkestrasi.
5. Deploy lebih cepat dan risiko integrasi antarservice lebih kecil.
6. Struktur berlapis tetap mendukung maintainability tanpa menambah kompleksitas distribusi.
7. Cocok untuk kebutuhan akademik dan operasional PBL yang menuntut solusi realistis, terukur, dan mudah dijelaskan.

## 3. Task 3 — Compare Two Architecture Options

### 3.1 Option 1: Layered Monolith
Layered Monolith adalah arsitektur tunggal yang memisahkan tanggung jawab ke dalam layer-layer internal. Seluruh modul bisnis berjalan dalam satu aplikasi, tetapi antarbagian tetap diatur agar tidak saling bercampur secara berlebihan.

**Kelebihan**
- Implementasi lebih cepat.
- Struktur mudah dipahami.
- Testing dan debugging lebih sederhana.
- Deployment lebih ringkas.
- Biaya operasional lebih rendah.

**Kekurangan**
- Skalabilitas horizontal per modul terbatas.
- Risiko coupling internal tetap ada jika disiplin layer tidak dijaga.
- Perubahan besar pada satu area dapat berdampak ke area lain bila desain tidak rapi.

### 3.2 Option 2: Microservices
Microservices memecah sistem menjadi layanan-layanan kecil yang berdiri sendiri, misalnya layanan user, layanan stok, layanan transaksi, dan layanan laporan. Setiap layanan dapat dikembangkan dan di-deploy terpisah.

**Kelebihan**
- Skalabilitas tiap layanan lebih fleksibel.
- Tim besar dapat bekerja paralel.
- Isolasi kegagalan antarservice lebih baik.
- Teknologi per layanan dapat berbeda bila dibutuhkan.

**Kekurangan**
- Kompleksitas desain dan operasional jauh lebih tinggi.
- Komunikasi antarservice menambah latensi dan risiko kegagalan integrasi.
- Dibutuhkan orkestrasi, observability, dan manajemen deployment yang lebih rumit.
- Biaya infrastruktur dan pemeliharaan meningkat.

### 3.3 Tabel Perbandingan

| Aspek | Layered Monolith | Microservices |
|---|---|---|
| Kompleksitas | Lebih rendah dan mudah dikendalikan | Lebih tinggi karena banyak service |
| Deployment | Satu paket aplikasi | Banyak service terpisah |
| Maintenance | Lebih mudah untuk tim kecil | Lebih sulit karena koordinasi antarservice |
| Skalabilitas | Cukup untuk kebutuhan sistem inventaris | Sangat fleksibel per layanan |
| Biaya Infrastruktur | Lebih rendah | Lebih tinggi |
| Cocok untuk Sistem Inventaris | Sangat cocok | Kurang efisien untuk skala ini |

### 3.4 Keputusan Akhir
Berdasarkan kebutuhan bisnis dan kondisi operasional Sistem Inventaris Toko Bangunan Telaten Karya, Layered Monolith dipilih sebagai arsitektur utama. Alasan teknisnya adalah sistem membutuhkan alur transaksi yang erat antarfitur, konsistensi data stok, dan kemudahan pemeliharaan oleh tim yang tidak besar. Alasan bisnisnya adalah solusi ini lebih cepat diterapkan, lebih hemat biaya, dan cukup stabil untuk mendukung proses inventaris harian.

Microservices memang unggul untuk organisasi besar dengan skala operasi dan tim pengembang yang luas, tetapi pada konteks ini kompleksitas tambahan tidak sebanding dengan manfaat yang diperoleh. Oleh karena itu, Layered Monolith merupakan pilihan paling rasional, efektif, dan selaras dengan tujuan proyek PBL.

## 4. Task 4 — Architecture Decision Record (ADR)

### ADR-001

**Title**  
Pemilihan Layered Monolith untuk Sistem Inventaris Toko Bangunan Telaten Karya

**Status**  
Accepted

**Context**  
Sistem Inventaris Toko Bangunan Telaten Karya memerlukan platform web yang mampu mengelola login, user, barang, kategori, supplier, barang masuk, barang keluar, transaksi penjualan, nota, laporan, monitoring stok, dan notifikasi stok minimum secara terintegrasi. Kebutuhan utama sistem adalah menjaga akurasi stok, mempercepat proses operasional, serta mempermudah pelaporan dan pengawasan.

Karena domain bisnis saling berhubungan erat dan tim pengembang bekerja pada skala yang terbatas, sistem membutuhkan arsitektur yang mudah dipahami, mudah dipelihara, dan tidak menambah beban infrastruktur secara berlebihan. Pendekatan layered monolith dipandang paling sesuai untuk memenuhi kebutuhan tersebut tanpa mengorbankan konsistensi data dan kecepatan implementasi.

**Decision**  
Sistem Inventaris Toko Bangunan Telaten Karya akan dibangun menggunakan Layered Monolith Architecture dengan pemisahan tanggung jawab ke dalam presentation layer, controller layer, service layer, repository layer, dan database. Seluruh modul bisnis akan tetap berada dalam satu aplikasi terpusat, tetapi pengolahan logika, akses data, dan tampilan akan dipisahkan secara sistematis agar codebase tetap rapi dan terkelola.

Keputusan ini juga berarti bahwa pengembangan fitur akan mengikuti pola modular di dalam monolit, bukan memecah sistem menjadi microservices. Dengan demikian, setiap modul dapat dikembangkan secara konsisten, diuji secara terpusat, dan dideploy dalam satu kesatuan aplikasi.

**Consequences**  
**Positif**
1. Arsitektur lebih mudah dipahami oleh tim pengembang dan reviewer.
2. Integrasi antarfitur inventaris, stok, dan penjualan menjadi lebih sederhana.
3. Proses deployment lebih cepat karena hanya satu aplikasi yang dikelola.
4. Biaya infrastruktur dan operasional lebih rendah.
5. Debugging dan testing lebih mudah dilakukan pada satu codebase.
6. Konsistensi data lebih mudah dijaga, terutama untuk stok dan transaksi.
7. Pemeliharaan modul dapat dilakukan tanpa kompleksitas komunikasi antarservice.
8. Cocok untuk kebutuhan PBL yang menuntut solusi realistis dan terukur.

**Negatif**
1. Skalabilitas per modul tidak sefleksibel microservices.
2. Jika struktur layer tidak disiplin, coupling internal dapat meningkat.
3. Perubahan besar pada satu bagian tetap berpotensi memengaruhi area lain dalam aplikasi.
4. Untuk pertumbuhan skala yang sangat besar, arsitektur ini mungkin perlu evolusi di masa depan.
