# AGENTS.md

Guidance for AI agents implementing features in this repository.

## Roles & Workflow

**You (the implementing agent):** Read a plan file, implement it exactly, then stop.
**Claude Code (reviewer):** Reviews your output for correctness, conventions, and quality.

Do not implement beyond what the plan specifies. Do not refactor unrelated code.
Do not create new plan files — plans are managed by the human and Claude Code.

## Before You Start

1. **Read the target plan file** in `.claude/plans/` (e.g., `00-datatable-component.md`)
2. **Read every file you will modify** before editing — understand existing patterns
3. **Check plan dependencies** — if the plan says "depends on Plan 00", confirm
   `resources/js/Components/DataTable.jsx` exists before proceeding
4. **Do not run `migrate:fresh`** — the human runs this. You only edit migration files
   if the plan explicitly says to edit an existing migration directly.

## Plan Execution Rules

- Implement **one plan at a time**, in numerical order (00 → 01 → 02 → ...)
- Follow the plan's "Files to Modify" and "Files to Create" lists exactly
- If a plan step is ambiguous, implement the most conservative interpretation
- After completing all files, run `vendor/bin/pint --dirty` on any PHP files changed
- Do not skip the Verification section — use it as your checklist before finishing

## Project Overview

**ZENLAB SIISTK** — Laravel 12 + React 19 + Inertia.js v2 admin dashboard.
Brand name: **TelatenKarya**. Three roles: `admin`, `sales`, `customer`.

```bash
composer run dev    # starts Laravel + queue + Vite concurrently
vendor/bin/pint --dirty   # PHP formatter — run after every PHP change
php artisan route:list --name=<prefix>  # verify routes
```

## Architecture Quick Reference

```
app/
  Http/
    Controllers/Admin/   # all admin controllers
    Requests/            # always use Form Requests, never inline validate()
  Models/                # use casts() method, not $casts property

resources/js/
  Pages/                 # Inertia pages (React JSX)
  Components/
    DataTable.jsx        # reusable list component — use for ALL index pages
    input/               # TextInput, NumberInput, ImageInput, SelectInput, ...
    modal/               # ModalDelete, ModalConfirm, ModalCart
    columns={[
        {
            key: "name",
            label: "Name",
            sortKey: "NAME",
            render: (item) => item.name,
        },
        {
            key: "actions",
            label: "Action",
            render: (item, { onDelete }) => (
                <div className="flex gap-3 justify-center">
                    <Link href={route("product.edit", item.id)}>
                        <TbEdit className="text-3xl text-slate-500 hover:text-sky-500 transition-all" />
                    </Link>
                    <TbTrash
                        className="text-3xl text-slate-500 hover:text-red-500 transition-all"
                        onClick={() => onDelete(item.id)}
                    />
                </div>
            ),
        },
    ]}
/>
    selectable={true}
    deleteType="product"
    deleteDescription="Are you sure to delete this product?"
    title="Products"
    addHref={route("product.create")}
    addLabel="Add Product"
    headers={<>
        <HeaderCellSort sortKey="NAME" className="!py-2 !px-3 border-y-2 ...">Name</HeaderCellSort>
        <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 ...">Action</HeaderCell>
    </>}
>
    {({ item, onDelete }) => (
        <>
            <Cell className="!p-3">{item.name}</Cell>
            <Cell className="!p-3">
                <div className="flex gap-3 justify-center">
                    <Link href={route("product.edit", item.id)}>
                        <TbEdit className="text-3xl text-slate-500 hover:text-sky-500 transition-all" />
                    </Link>
                    <TbTrash
                        className="text-3xl text-slate-500 hover:text-red-500 transition-all"
                        onClick={() => onDelete(item.id)}
                    />
                </div>
            </Cell>
        </>
    )}
</DataTable>
```

## PHP Conventions

```php
// ✅ Correct patterns
public function index(): Response                          // explicit return types
{
    return Inertia::render('Product/Index', [
        'products' => Product::query()                     // always Model::query()
            ->select(['id', 'name', 'price'])              // select only needed columns
            ->withSum('stocks', 'quantity')                // eager-load, no N+1
            ->latest()
            ->get(),
    ]);
}

public function store(StoreProductRequest $request): RedirectResponse  // Form Request
{
    $data = $request->safe()->except(['thumbnail']);       // safe() over validated()
    $data['created_by'] = auth()->id();

    if ($request->hasFile('thumbnail')) {
        $data['thumbnail'] = $request->file('thumbnail')->store('productImages', 'public');
    }

    Product::query()->create($data);
    return redirect()->route('product.index')->with('success', 'Product created.');
}

// ✅ Curly braces always, even single-line
if ($condition) {
    return $value;
}

// ✅ casts() method not $casts property
protected function casts(): array
{
    return ['price' => 'integer'];
}
```

## Frontend Conventions

```jsx
// ✅ currentRoute in every page useEffect
useEffect(() => {
    dispatch(setCurrentRoute({ route: 'product', subRoute: null }));
}, []);

// ✅ useForm for all forms
const { data, setData, post, errors, processing } = useForm({
    name: '',
    price: null,
});

// ✅ File upload with PUT: use post + _method spoofing
const { data, setData, post, errors } = useForm({
    name: product.name,
    _method: 'PUT',
    thumbnail: 'old',   // sentinel: keep existing image
});
const handleSubmit = (e) => {
    e.preventDefault();
    post(route('product.update', product.id));   // not put()
};

// ✅ Price format
Rp{item.price.toLocaleString('id-ID')}

// ✅ Dark mode — always include dark: variants
className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"

// ✅ Thumbnail URL
src={'/storage/' + item.thumbnail}

// ✅ Stock badge colors
// in = emerald, out = red, adjustment = yellow
```

## Domain Notes

**Stock ledger:** `stocks` is append-only. Never update/delete stock rows.
Positive qty = in, negative qty = out. Current stock = `SUM(quantity)`.

**Order status** (derived, no column):
- `pending` → no timestamps set
- `paid` → `paid_at` IS NOT NULL, `checked_out_at` IS NULL
- `completed` → `checked_out_at` IS NOT NULL
- `cancelled` → `cancelled_at` IS NOT NULL
- `expired` → `expired_at` IS NOT NULL

**File uploads** → stored via `Storage::disk('public')`, path saved as `productImages/filename.jpg`,
URL accessed via `/storage/productImages/filename.jpg`.

**Routes** — product routes naming convention:
- `product.index`, `product.create`, `product.store`, `product.show`, `product.edit`,
  `product.update`, `product.destroy`, `product.destroySelected`
- Stock sub-routes: `product.stock.create`, `product.stock.store`

## Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|---|---|
| `$request->validate([...])` inline | Use Form Request class |
| `DB::table(...)` | `Model::query()` |
| `$model->casts = [...]` property | `casts(): array` method |
| Write raw table boilerplate | Use `<DataTable>` component |
| `put(route(...))` with file upload | `post(route(...))` + `_method: 'PUT'` |
| Create new migration for existing table | Edit the existing migration file directly |
| Forget `created_by => auth()->id()` | Always set `created_by` on create |
| Hardcode colors without dark: variant | Always pair with `dark:` class |
| `env('KEY')` outside config files | `config('app.key')` |
