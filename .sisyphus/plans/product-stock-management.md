# Product Stock Management Modal

## TL;DR
> **Summary**: Tambahkan modal stock management di halaman product list, tetap memakai ledger `stocks` yang sudah ada.
> **Deliverables**:
> - route + controller flow untuk modal stock per product
> - stock history paginated di modal
> - form add/reduce stock manual
> - validasi server-side agar stock tidak bisa minus
> - fix `NumberInput` agar `unit_cost` tidak hardcoded ke `price`
> **Effort**: Medium
> **Parallel**: NO
> **Critical Path**: 1 → 2 → 4 → 5 → 6

## Context

### Original Request
- Integrasikan feature product dengan table `stocks`
- Bisa lihat riwayat stock per product
- Bisa tambah dan kurangi stock

### Interview Summary
- UI harus berupa modal dari product list
- Stock-out di atas stock tersedia harus ditolak
- Tidak menambah automated tests
- Manual entry wajib `quantity`, `unit_cost`, `note`

### Metis Review (gaps addressed)
- Tetap gunakan Inertia page flow, bukan JSON endpoint terpisah
- Tampilkan row manual + order dalam satu history table
- Simpan input quantity selalu positif; sign ditentukan server
- Jangan preload seluruh history product di index

## Work Objectives

### Core Objective
Admin dapat membuka modal stock dari product list, melihat current stock + history, lalu menambah atau mengurangi stock melalui ledger `stocks` tanpa mengubah alur stock-out dari order.

### Deliverables
- nested product stock routes
- backend handler untuk modal data + manual stock write
- request validation untuk stock-in dan stock-out
- modal component stock history + form
- integrasi action `Stock` di `Product/Index.jsx`
- fix binding `unit_cost` pada `NumberInput`

### Definition of Done (verifiable conditions with commands)
- `php artisan route:list --name=product.stock` menampilkan route stock modal
- `vendor/bin/pint --dirty` lolos
- `npm run build` lolos

### Must Have
- Sumber kebenaran tetap `stocks`
- History menampilkan row manual dan row order
- Manual entry pakai `reference_type = manual`, `reference_id = null`
- History dipaginasi 10 row per page
- Submit stock kembali ke route modal agar modal tetap terbuka setelah redirect

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Jangan buat halaman inventory terpisah
- Jangan edit/delete row ledger
- Jangan pakai `adjustment`
- Jangan percaya stock dari client untuk stock-out
- Jangan preload history semua product
- Jangan tambah automated test

## Verification Strategy

> ZERO HUMAN INTERVENTION - tetap mandatory, tapi dipersingkat.

- Verifikasi cukup: route, lint/format PHP, build frontend, dan cek UI inti
- QA global: 1 happy-path + 1 rejection-path untuk flow stock
- Evidence tetap ke `.sisyphus/evidence/`

## Execution Strategy

### Parallel Execution Waves
> Untuk hemat token, pakai satu executor utama saja. Jangan pecah ke banyak subagent kecuali benar-benar perlu.

- Wave 1: Task 1, 2, 3
- Wave 2: Task 4, 5, 6
- Final: F1-F4

### Dependency Matrix (full, all tasks)

| Task | Depends On | Blocks |
|---|---|---|
| 1 | None | 2, 4, 5, 6 |
| 2 | 1 | 5, 6 |
| 3 | None | 5 |
| 4 | 1 | 5, 6 |
| 5 | 2, 3, 4 | 6 |
| 6 | 5 | F1-F4 |
| F1-F4 | 1-6 | Completion |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 3 tasks → implementation/quick
- Wave 2 → 3 tasks → implementation
- Final → 4 tasks → mandatory review only

## TODOs

> Implementation + verification tetap satu task, tetapi ditulis ringkas.

- [ ] 1. Tambah route stock modal dan response contract

  **What to do**: Tambah route `product.stock.show`, `product.stock.storeIn`, `product.stock.storeOut` di group `product.` yang sudah ada. Tambah method controller yang tetap render `Product/Index`, tetapi mengirim prop `stockModal` hanya untuk product terpilih. Isi `stockModal`: `isOpen`, `product`, `currentStock`, `history`, `pagination`, `routes`.
  **Must NOT do**: Jangan buat page baru, jangan buat endpoint JSON, jangan preload semua history.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: Laravel route + Inertia response work
  - Skills: `[]`
  - Omitted: `[frontend-ui-ux]` - belum masuk UI detail

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 4, 5, 6 | Blocked By: none

  **References**:
  - `routes/web.php:18-29`
  - `app/Http/Controllers/Admin/ProductController.php:17-25`
  - `app/Models/Product.php:37-45`
  - `app/Models/Stock.php:10-31`

  **Acceptance Criteria**:
  - [ ] route stock muncul di `route:list`
  - [ ] `product.stock.show` tetap render `Product/Index`
  - [ ] `stockModal` hanya ada saat modal dibuka

  **QA Scenarios**:
  - Happy: buka `/admin/product/{id}/stock`, `stockModal.product.id` sesuai product
  - Failure: buka `/admin/product`, pastikan history modal tidak ikut terkirim

  **Commit**: NO | Message: `n/a` | Files: `routes/web.php`, `app/Http/Controllers/Admin/ProductController.php`

- [ ] 2. Implement manual stock-in dan stock-out

  **What to do**: Buat dua Form Request untuk stock-in dan stock-out. Validasi: `quantity` integer min 1, `unit_cost` integer min 1, `note` string max 255. `storeIn` membuat row `in` dengan quantity positif. `storeOut` melakukan fresh stock check dalam transaction; jika melebihi current stock, reject dengan flash error; jika valid, buat row `out` dengan quantity negatif. Semua row manual pakai `reference_type = 'manual'` dan `reference_id = null`.
  **Must NOT do**: Jangan ubah `OrderObserver`, jangan pakai `adjustment`, jangan hitung stock dari client.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: validation + ledger write logic
  - Skills: `[]`
  - Omitted: `[frontend-ui-ux]`

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References**:
  - `app/Http/Requests/StoreProductRequest.php:20-26`
  - `app/Models/Stock.php:10-27`
  - `app/Observers/OrderObserver.php:24-34`
  - `database/migrations/2026_04_24_154755_create_stocks_table.php:13-20`

  **Acceptance Criteria**:
  - [ ] stock-in membuat row `in` dengan quantity positif
  - [ ] stock-out membuat row `out` dengan quantity negatif
  - [ ] overdraw ditolak tanpa insert row baru

  **QA Scenarios**:
  - Happy: submit stock-in `5 / 12000 / "Initial stock"`, row baru tercatat
  - Failure: submit stock-out melebihi stock tersedia, request ditolak dan ledger tidak berubah

  **Commit**: NO | Message: `n/a` | Files: `app/Http/Controllers/Admin/ProductController.php`, `app/Http/Requests/*Stock*.php`

- [ ] 3. Fix `NumberInput` untuk `unit_cost`

  **What to do**: Ubah branch `currency` di `NumberInput` agar `name` memakai prop, bukan hardcoded `price`. Jangan ubah perilaku masking Rupiah yang sudah ada.
  **Must NOT do**: Jangan rewrite total component dan jangan merusak binding `price` di product form.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: single-file functional fix
  - Skills: `[]`
  - Omitted: `[frontend-ui-ux]`

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5 | Blocked By: none

  **References**:
  - `resources/js/Components/input/NumberInput.jsx:35-45`
  - `resources/js/Components/input/NumberInput.jsx:138-160`
  - `resources/js/Pages/Product/Create.jsx:72-81`

  **Acceptance Criteria**:
  - [ ] field currency mengirim name yang benar
  - [ ] input `price` tetap normal
  - [ ] input `unit_cost` bisa dipakai

  **QA Scenarios**:
  - Happy: isi `price`, form tetap bind ke `price`
  - Failure: isi `unit_cost`, pastikan tidak lagi bind ke `price`

  **Commit**: NO | Message: `n/a` | Files: `resources/js/Components/input/NumberInput.jsx`

- [ ] 4. Buat modal stock history

  **What to do**: Buat `ModalProductStock.jsx` dengan pola portal seperti `ModalDelete`. Tampilkan nama product, current stock, tabel history, empty state, tombol close, dan pagination `Previous/Next`. Kolom: `Date`, `Type`, `Quantity`, `Unit Cost`, `Note`, `Source`. Tampilkan `Order #id` untuk row order dan `-` jika `unit_cost` null.
  **Must NOT do**: Jangan fetch manual via Axios/fetch dan jangan sembunyikan row order.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: UI baru tapi masih bounded admin component work
  - Skills: `[]`
  - Omitted: `[frontend-ui-ux, impeccable-style]` - hemat subagent

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 5, 6 | Blocked By: 1

  **References**:
  - `resources/js/Components/modal/ModalDelete.jsx:7-87`
  - `resources/js/Layouts/Default.jsx:20-37`
  - `resources/js/config/tableConfig.jsx:4-53`
  - `app/Observers/OrderObserver.php:24-34`

  **Acceptance Criteria**:
  - [ ] modal mount ke `#modal-root`
  - [ ] empty state tampil saat belum ada ledger
  - [ ] row order tampil aman dengan `unit_cost = -`

  **QA Scenarios**:
  - Happy: buka modal product yang punya history, tabel tampil normal
  - Failure: buka modal product tanpa history, tampil empty state tanpa error

  **Commit**: NO | Message: `n/a` | Files: `resources/js/Components/modal/ModalProductStock.jsx`

- [ ] 5. Tambah form add/reduce stock di modal

  **What to do**: Di `ModalProductStock`, buat form `useForm` dengan mode `Add Stock` dan `Reduce Stock`. Data: `quantity`, `unit_cost`, `note`. Route submit diambil dari `stockModal.routes.storeIn` atau `storeOut`. Reduce mode harus disable submit saat current stock = 0. Reset form + errors saat product berubah atau modal ditutup.
  **Must NOT do**: Jangan kirim quantity negatif dari client, jangan biarkan state product lama terbawa.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: form + Inertia submit flow
  - Skills: `[]`
  - Omitted: `[frontend-ui-ux]`

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6 | Blocked By: 2, 3, 4

  **References**:
  - `resources/js/Pages/Product/Create.jsx:19-28`
  - `resources/js/Pages/Product/Create.jsx:60-105`
  - `resources/js/Components/input/NumberInput.jsx:64-99`
  - `resources/js/Components/input/NumberInput.jsx:138-160`

  **Acceptance Criteria**:
  - [ ] kedua mode wajib `quantity`, `unit_cost`, `note`
  - [ ] reduce mode blocked jika stock 0
  - [ ] state reset saat pindah product

  **QA Scenarios**:
  - Happy: submit add stock berhasil dan row baru muncul di atas
  - Failure: submit form tidak lengkap, tampil error inline dan tidak ada row baru

  **Commit**: NO | Message: `n/a` | Files: `resources/js/Components/modal/ModalProductStock.jsx`

- [ ] 6. Integrasi modal ke `Product/Index.jsx`

  **What to do**: Tambah action `Stock` di row action product. Open modal lewat route `product.stock.show`, close kembali ke `product.index`, dan pagination history tetap di product yang sama. Pakai `preserveState`, `preserveScroll`, `replace`. Jangan rusak search, sort, bulk select, edit, delete.
  **Must NOT do**: Jangan hilangkan action lama dan jangan biarkan modal stock overlap dengan modal delete.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: final integration seam
  - Skills: `[]`
  - Omitted: `[frontend-ui-ux, impeccable-style]`

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: F1-F4 | Blocked By: 5

  **References**:
  - `resources/js/Pages/Product/Index.jsx:32-37`
  - `resources/js/Pages/Product/Index.jsx:93-117`
  - `resources/js/Pages/Product/Index.jsx:288-302`
  - `resources/js/Layouts/Default.jsx:13-18`

  **Acceptance Criteria**:
  - [ ] action `Stock` muncul di setiap row
  - [ ] modal open/close tidak merusak context list
  - [ ] build frontend tetap lolos

  **QA Scenarios**:
  - Happy: filter list, buka modal stock, close, context list tetap sama
  - Failure: pindah dari product A ke B, state form/history harus reset ke B

  **Commit**: NO | Message: `n/a` | Files: `resources/js/Pages/Product/Index.jsx`, `resources/js/Components/modal/ModalProductStock.jsx`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> Blok mandatory dipertahankan dalam bentuk paling ringkas.

- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Satu commit final setelah implementasi dan review mandatory selesai
- Commit message: `feat(product): add per-product stock management modal`

## Success Criteria
- Modal stock bisa dibuka dari product list
- History stock tampil per product
- Add/reduce stock manual berhasil
- Overdraw ditolak
- Build tetap lolos
