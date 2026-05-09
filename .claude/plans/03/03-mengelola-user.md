# Plan 03 — Mengelola User

## Context

Admin perlu bisa melihat, menambah, mengedit, dan menghapus akun user (admin, sales,
pelanggan). Model `User` sudah ada dengan kolom `name, email, password, role (enum:
admin/sales/customer)`. Model `Sale` (data sales rep) dan `Customer` (data pelanggan) adalah
extension dari User via relasi `hasOne`.

---

## Files to Create

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Admin/UserController.php` | CRUD user |
| `app/Http/Requests/StoreUserRequest.php` | Validasi create user |
| `app/Http/Requests/UpdateUserRequest.php` | Validasi update user |
| `resources/js/Pages/User/Index.jsx` | Daftar semua user |
| `resources/js/Pages/User/Create.jsx` | Form tambah user |
| `resources/js/Pages/User/Edit.jsx` | Form edit user |

## Files to Modify

| File | Perubahan |
|---|---|
| `routes/web.php` | Tambah resource routes untuk user |
| `resources/js/Layouts/Sidebar.jsx` | Tambah link "Users" di nav |

---

## Implementation Steps

### 1. StoreUserRequest
```php
'name'     => 'required|string|max:255',
'email'    => 'required|email|unique:users,email',
'password' => 'required|string|min:8|confirmed',
'role'     => 'required|in:admin,sales,customer',
// Jika role = customer: address, city, postal_code (opsional)
// Jika role = sales: phone (opsional)
'phone'    => 'nullable|string|max:20',
'address'  => 'nullable|string|max:255',
'city'     => 'nullable|string|max:100',
'postal_code' => 'nullable|string|max:10',
```

### 2. UpdateUserRequest
```php
'name'     => 'required|string|max:255',
'email'    => 'required|email|unique:users,email,{user}',  // ignore current user
'password' => 'nullable|string|min:8|confirmed',           // opsional saat update
'role'     => 'required|in:admin,sales,customer',
'phone'    => 'nullable|string|max:20',
'address'  => 'nullable|string|max:255',
'city'     => 'nullable|string|max:100',
'postal_code' => 'nullable|string|max:10',
```

### 3. UserController

**index()** — server-side search, sort, pagination (ikuti pola Plan 00c):
```php
public function index(Request $request): Response
{
    $search    = $request->query('search', '');
    $sort      = $request->query('sort', 'created_at');
    $direction = $request->query('direction', 'desc');
    $perPage   = $request->query('per_page', 10);

    $allowedSorts = ['name', 'email', 'role', 'created_at'];
    if (! in_array($sort, $allowedSorts, true)) {
        $sort = 'created_at';
    }
    if (! in_array($direction, ['asc', 'desc'], true)) {
        $direction = 'desc';
    }

    $users = User::query()
        ->select(['id', 'name', 'email', 'role', 'created_at', 'created_by'])
        ->with(['sale:id,user_id,phone', 'customer:id,user_id,city', 'creator:id,name'])
        ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%"))
        ->orderBy($sort, $direction)
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('User/Index', [
        'users'   => $users,
        'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
    ]);
}
```

**store()** — buat user + buat Sale/Customer record sesuai role:
```php
$user = User::query()->create([...]);
if ($data['role'] === 'sales') {
    $user->sale()->create(['phone' => $data['phone'] ?? null, 'created_by' => auth()->id()]);
}
if ($data['role'] === 'customer') {
    $user->customer()->create([...address fields..., 'created_by' => auth()->id()]);
}
```

**update()** — update user, jika password diisi hash dulu.
**Guard:** admin tidak bisa hapus/ubah role dirinya sendiri.
**destroy()** — hapus user (FK restrict → handle QueryException).

### 4. Routes
```php
Route::controller(UserController::class)->prefix('/user')->name('user.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{user}/edit', 'edit')->name('edit');
    Route::match(['put', 'patch'], '/{user}', 'update')->name('update');
    Route::delete('/{user}', 'destroy')->name('destroy');
    Route::delete('/destroy-selected/{ids}', 'destroySelected')->name('destroySelected');
});
```

### 5. User/Index.jsx
- Gunakan `<DataTable>` server-side (Plan 00c)
- Grid: `"0.5fr 1.5fr 1.5fr 1fr 1fr 0.8fr"` (6 user columns: actions, name, email, role, created_at, created_by)
- Props wajib: `nodes={users.data}`, `meta={users}`, `filters={filters}`, `routeName="user.index"`
- `deleteType="user"`, `addHref={route("user.create")}`
- Tidak ada `sortFns` prop — sort via `sortKey` (server-side)
- Tidak ada explicit `headerClassName`/`cellClassName` — DataTable auto-handles edge styling

```jsx
const UserIndex = ({ flash, users, filters }) => { ... }

<DataTable
    nodes={users.data}
    meta={users}
    filters={filters}
    routeName="user.index"
    searchPlaceholder="Search by Name or Email"
    gridLayout="0.5fr 1.5fr 1.5fr 1fr 1fr 0.8fr"
    title="Users"
    deleteType="user"
    deleteDescription="Are you sure to delete this user?"
    addHref={route("user.create")}
    addLabel="Add User"
    columns={[
    {
        key: "actions",
        label: "Action",
        render: (item, { onDelete }) => (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex gap-3 justify-center"
            >
                <Link href={route("user.edit", item.id)}>
                    <TbEdit className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                </Link>
                <TbTrash
                    className="text-3xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                    onClick={() => onDelete(item.id)}
                />
            </motion.div>
        ),
    },
    {
        key: "name",
        label: "Name",
        sortKey: "name",
        render: (item) => (
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                {item.name}
            </motion.div>
        ),
    },
    {
        key: "email",
        label: "Email",
        sortKey: "email",
        render: (item) => item.email,
    },
    {
        key: "role",
        label: "Role",
        render: (item) => {
            const map = {
                admin:    'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
                sales:    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                customer: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
            };
            return <span className={`px-2 py-1 rounded-lg text-sm font-bold ${map[item.role]}`}>{item.role}</span>;
        },
    },
    {
        key: "created_at",
        label: "Created At",
        sortKey: "created_at",
        render: (item) => (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-slate-500 dark:text-slate-400 text-sm"
            >
                {new Date(item.created_at).toLocaleDateString("id-ID")}
            </motion.div>
        ),
    },
    {
        key: "created_by",
        label: "Created By",
        render: (item) => (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-slate-500 dark:text-slate-400 text-sm"
            >
                {item.creator?.name ?? "-"}
            </motion.div>
        ),
    },
]}
```

### 6. User/Create.jsx
- Field utama: TextInput (name), TextInput (email), PasswordInput (password), PasswordInput
  (password_confirmation), SelectInput (role: admin/sales/customer)
- Section dinamis berdasarkan role (tampil via conditional):
  - role=sales: TextInput (phone)
  - role=customer: TextInput (address), TextInput (city), TextInput (postal_code)
- Submit ke `user.store`

### 7. User/Edit.jsx
- Sama dengan Create tapi password opsional
- Pre-populate dari `user` prop (termasuk sale.phone / customer fields)
- Switch `put` → `post` + `_method: 'PUT'` jika ada file upload (tidak ada di sini, tetap `put`)

### 8. Sidebar
Tambah link "Users" dengan icon `TbUsers` di bawah Products, hanya visible untuk role admin.

---

## Guard Penting

- Admin tidak bisa hapus akun dirinya sendiri → cek `$user->id !== auth()->id()`
- Admin tidak bisa ubah role dirinya sendiri → cek di update
- Password di-hash dengan `bcrypt()` sebelum disimpan (atau gunakan `Hash::make()`)

---

## Utilities to Reuse

- `DataTable` — `resources/js/Components/DataTable.jsx` (Plan 00)
- `SelectInput` — `resources/js/Components/input/SelectInput.jsx`
- `PasswordInput` — `resources/js/Components/input/PasswordInput.jsx`
- `TextInput` — `resources/js/Components/input/TextInput.jsx`

---

## Verification

1. `php artisan route:list --name=user` → 7 routes muncul
2. Create user role=sales → record di tabel `sales` ikut terbuat
3. Create user role=customer → record di tabel `customers` ikut terbuat
4. Edit user → password kosong = tidak berubah
5. Hapus diri sendiri → error / tombol disable
6. Role badge tampil dengan warna yang benar di Index
