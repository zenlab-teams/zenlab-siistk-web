# Dokumentasi Dependency

Dokumen ini mencatat dependency yang benar-benar ada di `composer.json` dan `package.json`, lalu menjelaskan pemakaiannya dalam format tabel 5W1H.

## Backend Dependency

### `laravel/framework`

| 5W1H | Penjelasan |
| --- | --- |
| What | Framework utama aplikasi Laravel. |
| Why | Menjadi fondasi routing, controller, request, queue, view, dan lifecycle aplikasi. |
| Who | Seluruh layer backend. |
| When | Saat request masuk sampai response dikirim ke browser. |
| Where | `app/Http/Controllers`, `app/Http/Requests`, `routes/web.php`, dan model. |
| How | Controller mengembalikan response, request menangani validasi, dan route mengatur alur akses. |

### `inertiajs/inertia-laravel`

| 5W1H | Penjelasan |
| --- | --- |
| What | Bridge antara Laravel dan React melalui Inertia. |
| Why | Membuat aplikasi terasa seperti SPA tanpa harus membangun API terpisah untuk semua halaman. |
| Who | Controller backend dan halaman React. |
| When | Saat controller merender halaman frontend dari data backend. |
| Where | Banyak dipakai pada controller dashboard, product, order, offer, dan login. |
| How | Controller memanggil `Inertia::render()` untuk mengirim props ke komponen React. |

### `barryvdh/laravel-dompdf`

| 5W1H | Penjelasan |
| --- | --- |
| What | Library untuk membuat file PDF dari tampilan HTML. |
| Why | Dipakai untuk kebutuhan invoice dan dokumen cetak. |
| Who | Admin dan sales yang mengelola order dan invoice. |
| When | Saat user mengunduh invoice atau laporan PDF. |
| Where | Terlihat pada controller order dan view PDF. |
| How | Controller memanggil facade `Pdf::loadView()` lalu mengirim file hasil render ke browser. |

### `tightenco/ziggy`

| 5W1H | Penjelasan |
| --- | --- |
| What | Helper route Laravel di sisi frontend. |
| Why | Mencegah hardcode URL di React dan menjaga nama route tetap sinkron dengan backend. |
| Who | Developer frontend. |
| When | Saat membuat link, form submit, dan navigasi di komponen React. |
| Where | Banyak muncul di `resources/js/Pages`, `resources/js/Components`, dan layout. |
| How | Komponen React memanggil `route('nama.route')` langsung dari JavaScript. |

### `laravel/sanctum`

| 5W1H | Penjelasan |
| --- | --- |
| What | Paket autentikasi token untuk Laravel. |
| Why | Disiapkan untuk kebutuhan autentikasi berbasis token atau integrasi API. |
| Who | Layer autentikasi backend. |
| When | Saat sistem membutuhkan proteksi endpoint berbasis token. |
| Where | Pada layer autentikasi Laravel, walau alur utama repo ini masih berbasis session. |
| How | Laravel menyediakan middleware dan guard yang bisa dipakai bila endpoint API ditambahkan. |

### `guzzlehttp/guzzle`

| 5W1H | Penjelasan |
| --- | --- |
| What | HTTP client untuk request keluar. |
| Why | Membantu integrasi ke layanan eksternal bila dibutuhkan. |
| Who | Backend developer. |
| When | Saat aplikasi perlu mengambil data dari service lain. |
| Where | Di layer service atau controller jika integrasi eksternal ditambahkan. |
| How | Request keluar dibuat lewat client Guzzle dari PHP. |

### `laravel/tinker`

| 5W1H | Penjelasan |
| --- | --- |
| What | REPL untuk menjalankan kode Laravel dari CLI. |
| Why | Memudahkan inspeksi cepat data model, query, dan helper saat development. |
| Who | Developer backend. |
| When | Saat debugging atau mengecek data tanpa membuka UI. |
| Where | Dijalankan dari terminal proyek. |
| How | Developer menjalankan `php artisan tinker`. |

## Dev Dependency Backend

### `fakerphp/faker`

| 5W1H | Penjelasan |
| --- | --- |
| What | Generator data palsu. |
| Why | Memudahkan pembuatan data dummy untuk testing dan seeder. |
| Who | Developer backend. |
| When | Saat menyiapkan data contoh. |
| Where | Biasanya di factory atau seeder. |
| How | Helper Faker mengisi nama, alamat, angka, dan field acak lain. |

### `laravel/boost`

| 5W1H | Penjelasan |
| --- | --- |
| What | Tooling tambahan untuk workflow Laravel. |
| Why | Dipakai sebagai dukungan pengembangan pada project ini. |
| Who | Developer. |
| When | Saat environment development disinkronkan atau diperbarui. |
| Where | Lewat Composer scripts. |
| How | Dijalankan melalui perintah Composer terkait update tooling. |

### `laravel/pail`

| 5W1H | Penjelasan |
| --- | --- |
| What | Viewer log aplikasi dari CLI. |
| Why | Membantu debugging log tanpa membuka file log manual. |
| Who | Developer backend. |
| When | Saat mencari error runtime atau perilaku aneh. |
| Where | Terminal development. |
| How | Log dipantau langsung melalui command artisan terkait. |

### `laravel/pint`

| 5W1H | Penjelasan |
| --- | --- |
| What | Formatter kode PHP. |
| Why | Menjaga konsistensi style code dan kerapian file PHP. |
| Who | Seluruh developer backend. |
| When | Sebelum commit atau setelah mengubah file PHP. |
| Where | Dijalankan dari terminal repo. |
| How | Gunakan `vendor/bin/pint` atau `vendor/bin/pint --dirty`. |

### `laravel/sail`

| 5W1H | Penjelasan |
| --- | --- |
| What | Environment development berbasis Docker. |
| Why | Memberi opsi environment Laravel yang konsisten lintas mesin. |
| Who | Developer yang ingin environment containerized. |
| When | Saat development memakai Docker. |
| Where | Konfigurasi runtime lokal. |
| How | Sail menjalankan stack Laravel lewat container. |

### `mockery/mockery`

| 5W1H | Penjelasan |
| --- | --- |
| What | Library mocking object. |
| Why | Membantu test yang perlu meniru dependency atau behaviour tertentu. |
| Who | Penulis test. |
| When | Saat test butuh isolasi logika. |
| Where | Dalam file test PHP. |
| How | Object palsu dibuat untuk memverifikasi interaksi yang diharapkan. |

### `nunomaduro/collision`

| 5W1H | Penjelasan |
| --- | --- |
| What | Handler error CLI yang lebih nyaman dibaca. |
| Why | Memperjelas output error saat artisan command atau test gagal. |
| Who | Developer. |
| When | Saat error muncul di terminal. |
| Where | Otomatis aktif pada lingkungan dev Laravel. |
| How | Memberi tampilan exception yang lebih informatif. |

### `pestphp/pest`

| 5W1H | Penjelasan |
| --- | --- |
| What | Framework testing utama. |
| Why | Memberi sintaks test yang lebih ringkas dan mudah dibaca. |
| Who | Developer dan QA. |
| When | Saat membuat atau menjalankan feature test dan unit test. |
| Where | Folder `tests/`. |
| How | Test dijalankan lewat `php artisan test` atau `composer run test`. |

### `pestphp/pest-plugin-laravel`

| 5W1H | Penjelasan |
| --- | --- |
| What | Integrasi Pest untuk Laravel. |
| Why | Membuat testing Laravel berjalan natural dengan helper dan assertion Laravel. |
| Who | Test suite proyek. |
| When | Saat test Laravel berjalan. |
| Where | Konfigurasi test dan file `tests/`. |
| How | Plugin ini memperluas kemampuan Pest di environment Laravel. |

## Frontend Dependency

### `react`

| 5W1H | Penjelasan |
| --- | --- |
| What | Runtime UI React. |
| Why | Menjadi basis seluruh halaman dan komponen frontend. |
| Who | Semua halaman React. |
| When | Setiap halaman aplikasi dibuka atau dinavigasi. |
| Where | `resources/js/app.jsx`, `resources/js/Pages`, dan komponen bersama. |
| How | Halaman dirender sebagai komponen React lalu menerima props dari backend via Inertia. |

### `react-dom`

| 5W1H | Penjelasan |
| --- | --- |
| What | Renderer React untuk DOM browser. |
| Why | Dibutuhkan agar komponen React bisa tampil di halaman web. |
| Who | Seluruh UI frontend. |
| When | Saat aplikasi dirender di browser. |
| Where | Dipakai lewat bootstrap React di entrypoint aplikasi. |
| How | React mengikat komponen ke DOM browser melalui ReactDOM. |

### `@inertiajs/react`

| 5W1H | Penjelasan |
| --- | --- |
| What | Integrasi React dengan Inertia. |
| Why | Menjaga alur SPA-like antara Laravel dan React. |
| Who | Halaman React dan komponen navigasi. |
| When | Saat berpindah halaman, submit form, atau menerima props dari controller. |
| Where | `resources/js/app.jsx`, `resources/js/Pages`, dan komponen interaktif. |
| How | Komponen memakai `Link`, `useForm`, dan helper Inertia lain. |

### `@reduxjs/toolkit`

| 5W1H | Penjelasan |
| --- | --- |
| What | Toolkit Redux untuk state management. |
| Why | Menyimpan state global seperti mode tampilan atau state UI bersama. |
| Who | Layout, page, dan komponen interaktif. |
| When | Saat aplikasi perlu state yang dipakai bersama antar halaman atau komponen. |
| Where | `resources/js/Redux`. |
| How | Store dan slice disiapkan lalu dibagikan lewat `Provider`. |

### `react-redux`

| 5W1H | Penjelasan |
| --- | --- |
| What | Binding Redux untuk React. |
| Why | Menghubungkan store Redux dengan komponen React. |
| Who | Komponen yang membaca atau mengubah state global. |
| When | Saat state global diakses oleh page atau layout. |
| Where | Digunakan di layout, page, dan komponen UI. |
| How | Komponen memakai `useDispatch` dan `useSelector`. |

### `@table-library/react-table-library`

| 5W1H | Penjelasan |
| --- | --- |
| What | Library tabel untuk data list yang kompleks. |
| Why | Dipakai untuk tabel yang butuh sort, pagination, row select, dan aksi. |
| Who | Halaman index seperti product, customer, supplier, order, dan public order. |
| When | Saat menampilkan daftar data dalam jumlah banyak. |
| Where | `resources/js/Components/DataTable.jsx` dan beberapa halaman list. |
| How | Tabel dibangun lewat komponen dan helper dari library ini agar reusable. |

### `@vitejs/plugin-react`

| 5W1H | Penjelasan |
| --- | --- |
| What | Plugin React untuk Vite. |
| Why | Membuat Vite memahami JSX dan pipeline React. |
| Who | Tooling frontend. |
| When | Saat build atau development frontend berjalan. |
| Where | Konfigurasi Vite. |
| How | Plugin ini mengaktifkan transform React di bundler. |

### `chart.js`

| 5W1H | Penjelasan |
| --- | --- |
| What | Library chart untuk visualisasi data. |
| Why | Dipakai untuk analitik dashboard bisnis. |
| Who | Halaman dashboard admin dan sales. |
| When | Saat menampilkan ringkasan penjualan, qty, atau metrik periodik. |
| Where | Komponen dashboard seperti `resources/js/Components/dashboard/AnalyticsCard.jsx`. |
| How | Data backend dikirim ke chart lalu dirender sebagai line atau bar chart. |

### `classnames`

| 5W1H | Penjelasan |
| --- | --- |
| What | Helper untuk menyusun className secara dinamis. |
| Why | Mempermudah pengelolaan class yang bergantung pada state. |
| Who | Komponen React. |
| When | Saat styling berubah berdasarkan kondisi. |
| Where | Hampir semua komponen UI. |
| How | Class disusun lewat ekspresi kondisional yang lebih bersih. |

### `framer-motion`

| 5W1H | Penjelasan |
| --- | --- |
| What | Library animasi UI. |
| Why | Membuat transisi lebih halus dan komponen terasa responsif. |
| Who | Komponen interaktif dan layout. |
| When | Saat modal, tombol, sidebar, atau navigasi berubah state. |
| Where | `resources/js/Layouts`, `resources/js/Components`, dan page tertentu. |
| How | Animasi diatur lewat motion component dan transition props. |

### `leaflet`

| 5W1H | Penjelasan |
| --- | --- |
| What | Engine peta. |
| Why | Dipakai untuk fitur lokasi dan tampilan peta. |
| Who | Form atau komponen lokasi. |
| When | Saat user memilih atau melihat lokasi. |
| Where | `resources/js/Components/LocationDisplay.jsx` dan `resources/js/Components/input/LocationPicker.jsx`. |
| How | Peta dirender dengan marker dan tile layer Leaflet. |

### `nprogress`

| 5W1H | Penjelasan |
| --- | --- |
| What | Progress bar navigasi. |
| Why | Memberi indikasi loading saat pindah halaman. |
| Who | Semua user aplikasi. |
| When | Saat navigasi Inertia berlangsung. |
| Where | Entry frontend dan layout aplikasi. |
| How | Bar loading ditampilkan dan disembunyikan otomatis mengikuti navigasi. |

### `react-chartjs-2`

| 5W1H | Penjelasan |
| --- | --- |
| What | Binding React untuk Chart.js. |
| Why | Memudahkan render chart di komponen React. |
| Who | Komponen dashboard. |
| When | Saat visualisasi data diperlukan. |
| Where | Komponen analytics dashboard. |
| How | Data chart dikirim ke komponen Line atau Bar dari wrapper React. |

### `react-date-picker`

| 5W1H | Penjelasan |
| --- | --- |
| What | Komponen date picker. |
| Why | Memudahkan input tanggal yang konsisten. |
| Who | Form yang butuh input tanggal. |
| When | Saat user memilih tanggal di form. |
| Where | Komponen input React yang membutuhkan calendar picker. |
| How | User memilih tanggal lewat UI kalender, bukan mengetik manual. |

### `react-hot-toast`

| 5W1H | Penjelasan |
| --- | --- |
| What | Notifikasi toast. |
| Why | Memberi feedback sukses, error, atau info secara cepat. |
| Who | Semua user aplikasi. |
| When | Setelah aksi form, update data, atau validasi berhasil/gagal. |
| Where | Layout dan komponen form. |
| How | Toast ditampilkan sebagai overlay singkat di UI. |

### `react-icons`

| 5W1H | Penjelasan |
| --- | --- |
| What | Paket ikon berbasis React. |
| Why | Menyediakan ikon untuk tombol, menu, status, dan aksi tabel. |
| Who | Hampir semua komponen UI. |
| When | Saat halaman butuh affordance visual yang jelas. |
| Where | Layout, sidebar, button, modal, dan page. |
| How | Ikon dipanggil sebagai komponen React. |

### `react-international-phone`

| 5W1H | Penjelasan |
| --- | --- |
| What | Komponen input nomor telepon internasional. |
| Why | Menjaga input telepon tetap terstruktur dan mudah dipahami. |
| Who | Form customer, supplier, dan data kontak. |
| When | Saat user mengisi nomor telepon. |
| Where | Komponen input di `resources/js/Components/input`. |
| How | Input telepon dibungkus dengan kontrol khusus untuk format internasional. |

### `react-leaflet`

| 5W1H | Penjelasan |
| --- | --- |
| What | Binding React untuk Leaflet. |
| Why | Memungkinkan peta Leaflet dipakai sebagai komponen React. |
| Who | Komponen lokasi. |
| When | Saat user memilih atau melihat lokasi. |
| Where | Komponen peta dan location picker. |
| How | React mengontrol peta melalui komponen `MapContainer`, `Marker`, dan `TileLayer`. |

### `react-phone-input-2`

| 5W1H | Penjelasan |
| --- | --- |
| What | Input telepon dengan format khusus. |
| Why | Menyediakan alternatif input nomor telepon yang rapi. |
| Who | Form yang membutuhkan nomor telepon. |
| When | Saat user mengisi kontak. |
| Where | Komponen input React. |
| How | Nomor telepon diformat melalui komponen khusus. |

### `react-select`

| 5W1H | Penjelasan |
| --- | --- |
| What | Komponen select modern dengan pencarian. |
| Why | Membuat pilihan data lebih nyaman dibanding select standar. |
| Who | Form dan filter data. |
| When | Saat user memilih kategori, produk, atau data relasi lain. |
| Where | Banyak dipakai di input dan dashboard analytics. |
| How | Opsi dirender dengan fitur search dan styling yang lebih fleksibel. |

### `react-text-mask`

| 5W1H | Penjelasan |
| --- | --- |
| What | Library masking input. |
| Why | Menjaga format angka atau teks tetap konsisten. |
| Who | Form input khusus. |
| When | Saat user mengisi field yang butuh pola tertentu. |
| Where | Komponen input di `resources/js/Components/input`. |
| How | Input dibatasi dengan mask agar pola tetap seragam. |

### `text-mask-addons`

| 5W1H | Penjelasan |
| --- | --- |
| What | Helper tambahan untuk masking input. |
| Why | Melengkapi kebutuhan format angka pada input masked. |
| Who | Komponen input yang memakai mask. |
| When | Saat format input numerik diterapkan. |
| Where | Digunakan bersama `react-text-mask`. |
| How | Helper ini menyuplai pola mask tambahan. |

### `redux`

| 5W1H | Penjelasan |
| --- | --- |
| What | Core Redux state container. |
| Why | Menyediakan fondasi state management global. |
| Who | Store aplikasi. |
| When | Saat state global disusun dan dibagikan. |
| Where | Layer Redux di frontend. |
| How | Toolkit Redux dibangun di atas container state ini. |

## Dev Dependency Frontend

### `autoprefixer`

| 5W1H | Penjelasan |
| --- | --- |
| What | Penambah prefix CSS otomatis. |
| Why | Menjaga kompatibilitas style lintas browser. |
| Who | Pipeline CSS. |
| When | Saat build CSS berjalan. |
| Where | PostCSS pipeline. |
| How | Prefix vendor ditambahkan otomatis pada CSS hasil build. |

### `axios`

| 5W1H | Penjelasan |
| --- | --- |
| What | HTTP client JavaScript. |
| Why | Tersedia untuk kebutuhan request data dari frontend bila diperlukan. |
| Who | Frontend developer. |
| When | Saat frontend butuh komunikasi AJAX. |
| Where | Layer JavaScript frontend. |
| How | Request HTTP dibuat melalui API axios. |

### `concurrently`

| 5W1H | Penjelasan |
| --- | --- |
| What | Utilitas menjalankan beberapa command sekaligus. |
| Why | Dipakai untuk menjalankan server, queue listener, dan Vite dalam satu perintah. |
| Who | Developer saat lokal development. |
| When | Saat menjalankan `composer run dev`. |
| Where | Script `dev:all` di `package.json`. |
| How | Beberapa proses dijalankan paralel dari satu command. |

### `laravel-vite-plugin`

| 5W1H | Penjelasan |
| --- | --- |
| What | Integrasi Vite dengan Laravel. |
| Why | Menghubungkan asset frontend ke template Laravel dengan benar. |
| Who | Stack frontend-backend proyek. |
| When | Saat asset frontend dimuat oleh aplikasi Laravel. |
| Where | Konfigurasi Vite dan entrypoint asset. |
| How | Plugin membantu Laravel membaca manifest build dari Vite. |

### `postcss`

| 5W1H | Penjelasan |
| --- | --- |
| What | Processor CSS. |
| Why | Menjadi tahap transform style sebelum CSS dibundel. |
| Who | Toolchain frontend. |
| When | Saat build asset. |
| Where | Pipeline Vite dan Tailwind. |
| How | CSS diproses melalui plugin PostCSS. |

### `tailwindcss`

| 5W1H | Penjelasan |
| --- | --- |
| What | Utility-first CSS framework. |
| Why | Dipakai untuk styling komponen dan layout di seluruh aplikasi. |
| Who | Frontend developer. |
| When | Saat menulis class pada JSX atau CSS utility. |
| Where | File React, CSS, dan layout UI. |
| How | Class utility Tailwind dirangkai langsung di markup. |

### `vite`

| 5W1H | Penjelasan |
| --- | --- |
| What | Bundler dan dev server frontend. |
| Why | Mempercepat development dan build aset frontend. |
| Who | Developer frontend. |
| When | Saat `npm run dev` atau `npm run build`. |
| Where | Pipeline frontend proyek. |
| How | Vite menangani bundling asset React dan CSS. |

## Ringkasan Package Pendukung

| Package | Peran Singkat |
| --- | --- |
| `laravel/boost` | tooling tambahan untuk workflow Laravel |
| `laravel/pail` | pemantauan log dari CLI |
| `laravel/sail` | environment Laravel berbasis Docker |
| `nunomaduro/collision` | output error CLI yang lebih jelas |

## Catatan

- Semua isi dokumen ini mengikuti manifest yang ada saat file ini dibuat.
- Jika dependency berubah, bagian 5W1H dan tabel ringkasan harus diperbarui agar tetap akurat.
