# Plan 06a — Fix Sales Reps UX Consistency

> **Perbaikan UX** untuk Plan 06. Sales Reps section harus konsisten dengan Offer Items section menggunakan dynamic form pattern.

## Issue

Di `Offer/Create.jsx`, **Sales Reps** menggunakan checkbox grid statis, sedangkan **Offer Items** menggunakan dynamic form dengan tombol Add/Remove. UX tidak konsisten dan membingungkan user.

**Current Sales Reps (lines 161-182):**
- Checkbox grid statis 2 kolom
- Semua sales ditampilkan sekaligus
- Hanya bisa centang/uncentang
- Tidak ada kontrol dinamis

**Current Offer Items (lines 184-287):**
- Dynamic form dengan Add/Remove
- User kontrol penuh
- Empty state yang jelas
- Tombol aksi per item

## Solution

Ubah Sales Reps menjadi **dynamic form pattern** yang sama seperti Offer Items.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Pages/Offer/Create.jsx` | Rewrite Sales Reps section (lines 161-182) |

---

## Implementation

### 1. Update Form State

Ubah struktur data dari `sale_ids: []` menjadi `sales: []`:

```jsx
const { data, setData, post, processing, errors } = useForm({
    name: "",
    description: "",
    date: "",
    sales: [],  // ← ubah dari sale_ids: []
    items: [],
});
```

### 2. Helper Functions untuk Sales

Tambah setelah helper functions untuk items:

```jsx
const createEmptySales = () => ({
    sale_id: null,
});

const addSales = () => {
    setData("sales", [...data.sales, createEmptySales()]);
};

const removeSales = (index) => {
    const nextSales = data.sales.filter((_, salesIndex) => salesIndex !== index);
    setData("sales", nextSales);
};

const updateSales = (index, saleId) => {
    const nextSales = [...data.sales];
    nextSales[index] = { ...nextSales[index], sale_id: saleId ? Number(saleId) : null };
    setData("sales", nextSales);
};
```

### 3. Sales Options

Tambah setelah `productOptions`:

```jsx
const salesOptions = useMemo(
    () =>
        sales.map((sale) => ({
            value: sale.id,
            label: sale.user?.name ?? "-",
        })),
    [sales]
);

// Filter available sales (exclude already selected)
const getAvailableSalesOptions = (currentIndex) => {
    const selectedIds = data.sales
        .map((s, idx) => idx !== currentIndex ? s.sale_id : null)
        .filter(Boolean);
    
    return salesOptions.filter(option => !selectedIds.includes(option.value));
};
```

### 4. Replace Sales Reps Section

Ganti section Sales Reps (lines 161-182) dengan:

```jsx
<div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-lg font-bold">
            Sales Reps<span className="text-sm text-red-500 font-bold"> *</span>
        </p>
        <button
            type="button"
            className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold transition-all"
            onClick={addSales}
        >
            <TbPlus className="text-xl" /> Add Sales Rep
        </button>
    </div>

    {errors.sales && (
        <p className="text-red-400 font-bold mb-3">{errors.sales}</p>
    )}

    <div className="flex flex-col gap-3">
        {data.sales.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                Belum ada sales rep. Klik <span className="font-bold">Add Sales Rep</span> untuk mulai.
            </div>
        )}

        {data.sales.map((sale, index) => {
            const salesError = errors[`sales.${index}.sale_id`];
            
            return (
                <div
                    key={`sales-${index}`}
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                        <div className="lg:col-span-11">
                            <SelectInput
                                name={`sales_${index}`}
                                label="Sales Representative"
                                placeholder="Pilih sales rep"
                                options={getAvailableSalesOptions(index)}
                                value={sale.sale_id}
                                onChange={(_, value) => updateSales(index, value)}
                                error={salesError}
                                required={true}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <button
                                type="button"
                                className="w-full h-[45px] flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                onClick={() => removeSales(index)}
                            >
                                <TbTrash className="text-2xl" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
</div>
```

### 5. Update Form Submission

Ubah `handleSubmit` untuk transform data sebelum submit:

```jsx
const handleSubmit = (event) => {
    event.preventDefault();
    
    // Transform sales array to sale_ids array for backend
    const submitData = {
        ...data,
        sale_ids: data.sales.map(s => s.sale_id).filter(Boolean),
    };
    delete submitData.sales;
    
    post(route("offer.store"), {
        data: submitData,
    });
};
```

### 6. Update Reset Function

```jsx
const handleReset = () => {
    setData({
        name: "",
        description: "",
        date: "",
        sales: [],  // ← ubah dari sale_ids: []
        items: [],
    });
};
```

### 7. Helper Function untuk Error

Tambah setelah `itemError`:

```jsx
const salesError = (index, field) => errors[`sales.${index}.${field}`];
```

---

## Backend Validation Update

Tidak perlu ubah backend validation. Form tetap mengirim `sale_ids` array seperti sebelumnya, hanya cara input di frontend yang berubah.

---

## Benefits

1. **Konsistensi UX** — Sales Reps dan Offer Items punya pattern yang sama
2. **User Control** — User bisa menambah/menghapus sales sesuai kebutuhan
3. **No Duplicates** — Prevent selecting same sales multiple times
4. **Clear Empty State** — Jelas ketika belum ada sales dipilih
5. **Better Validation** — Error handling per sales item
6. **Responsive** — Grid layout yang sama seperti items

---

## Verification

1. **Empty State** — Halaman load tanpa sales, tampil empty state dengan instruksi
2. **Add Sales** — Klik "Add Sales Rep" → form baru muncul dengan dropdown
3. **Select Sales** — Pilih sales dari dropdown → tersimpan, dropdown lain exclude pilihan ini
4. **Remove Sales** — Klik trash → sales terhapus, dropdown lain include kembali
5. **Validation** — Submit tanpa pilih sales → error per item
6. **Submit** — Data tetap dikirim sebagai `sale_ids` array ke backend
7. **Reset** — Klik Reset → semua sales terhapus, kembali ke empty state
8. **Responsive** — Test di mobile, layout tetap rapi

Pattern harus identik dengan Offer Items section untuk konsistensi UX yang optimal.