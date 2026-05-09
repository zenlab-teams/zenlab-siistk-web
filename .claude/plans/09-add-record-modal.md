# Plan 09 — Add Record: Card → Modal

## Context

Form "Add Record" saat ini berada di card terpisah di bawah Sale Records,
dengan tombol toggle yang expand/collapse form secara inline. Form dipindah
ke modal overlay agar UX lebih baik, dan tombol trigger-nya dipindah ke
dalam header card Sale Records.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Pages/Offer/Show.jsx` | Pindah form ke modal; tombol ke header Sale Records |
| `resources/js/Pages/Sales/Offer/Show.jsx` | Sama |

---

## Changes — Berlaku untuk Kedua File

### 1. Tambah imports

```jsx
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Tambah TbX ke import tb yang sudah ada:
import { TbPhoto, TbPlus, TbTrash, TbX } from "react-icons/tb";
```

> `AnimatePresence` dan `motion` belum diimport di kedua Show page.

---

### 2. State `showRecordForm`

Tidak berubah — `const [showRecordForm, setShowRecordForm] = useState(false)`.
Sekarang mengontrol buka/tutup modal, bukan toggle inline.

---

### 3. Sale Records — card header (toolbar DataTable)

Karena plan 08 sudah diimplementasi, Sale Records sudah menggunakan `<DataTable>`.
Tombol masuk ke prop `toolbar`:

```jsx
<DataTable
    nodes={records}
    paginated={false}
    selectable={false}
    gridLayout="1.5fr 1fr 1fr 0.8fr 1fr"
    title="Sale Records"
    toolbar={
        offer.status === "active" ? (
            <button
                type="button"
                onClick={() => setShowRecordForm(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-800 px-4 py-2 rounded-lg font-bold transition-all"
            >
                Tambah Laporan Penjualan
            </button>
        ) : null
    }
    columns={[...]}
/>
```

Sales `Sales/Offer/Show.jsx` — gridLayout `"1.5fr 1fr 1fr 1fr"`, tanpa kolom Actions.

---

### 4. Hapus card "Add Record"

Hapus seluruh blok di bawah Sale Records:
```jsx
{offer.status === "active" && (
    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl mb-5">
        ...tombol + form...
    </div>
)}
```

---

### 5. Tambah Modal (via createPortal)

Tempatkan di dalam return, sebelum `<Layout>` menggunakan fragment `<>`:

```jsx
<>
    <AnimatePresence>
        {showRecordForm && createPortal(
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
                <motion.div
                    className="fixed inset-0 bg-black/30 dark:bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowRecordForm(false)}
                />
                <motion.div
                    className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-xl font-bold">Tambah Laporan Penjualan</p>
                        <button
                            type="button"
                            onClick={() => setShowRecordForm(false)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-all"
                        >
                            <TbX className="text-xl" />
                        </button>
                    </div>
                    <div className="p-5">
                        <form onSubmit={handleSubmitRecord} className="flex flex-col gap-4">
                            {/* konten form sama persis dari card lama */}
                        </form>
                    </div>
                </motion.div>
            </div>,
            document.getElementById("modal-root")
        )}
    </AnimatePresence>
    <Layout flash={flash}>
        ...
    </Layout>
</>
```

> Klik backdrop → tutup modal. Box tidak perlu `e.stopPropagation()` karena
> backdrop dan box adalah elemen `fixed` yang berbeda.

---

### 6. `handleSubmitRecord` — tutup modal di onSuccess

**Admin (`Offer/Show.jsx`):**
```jsx
const handleSubmitRecord = (event) => {
    event.preventDefault();
    post(route("offer.record.store", offer.id), {
        onSuccess: () => {
            reset("sale_id", "customer_id", "notes", "items");
            setShowRecordForm(false);
        },
    });
};
```

**Sales (`Sales/Offer/Show.jsx`):**
```jsx
const handleSubmitRecord = (event) => {
    event.preventDefault();
    post(route("sales.offer.record.store", offer.id), {
        onSuccess: () => {
            reset("customer_id", "notes", "items");
            setShowRecordForm(false);
        },
    });
};
```

---

## Perbedaan Admin vs Sales

| Bagian | Admin | Sales |
|---|---|---|
| Form: field pertama | `SelectInput sale_id` (pilih sales) | Tidak ada |
| Form: reset fields | `"sale_id", "customer_id", "notes", "items"` | `"customer_id", "notes", "items"` |
| Route submit | `offer.record.store` | `sales.offer.record.store` |
| DataTable gridLayout | `"1.5fr 1fr 1fr 0.8fr 1fr"` | `"1.5fr 1fr 1fr 1fr"` |
| DataTable kolom | + kolom Actions | Tanpa Actions |

---

## Verification

1. `/admin/offer/{id}` offer status `active`:
   - DataTable Sale Records punya tombol "Tambah Laporan Penjualan" di toolbar ✓
   - Klik → modal muncul dengan form ✓
   - Klik backdrop → modal tutup ✓
   - Klik X → modal tutup ✓
   - Submit valid → modal tutup, flash success, Sale Records reload ✓
2. `/sales/offer/{id}` offer status `active` — sama ✓
3. Offer status `completed`/`rejected` — tombol tidak muncul ✓
