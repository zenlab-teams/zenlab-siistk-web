# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role in This Project

**Claude Code acts as code reviewer only.** Implementation is done by the user or other AI
models. When asked to review, check for: correctness against the plan, N+1 queries,
missing Form Request validation, hardcoded values, dark mode support, and Tailwind class
consistency. Do not refactor beyond what the plan specifies.

## Project

**ZENLAB SIISTK** — Sales Information & Inventory System Toolkit Web. A Laravel 12 admin
dashboard for managing products, orders, offers, payments, customers, and sales targets.
Brand name: **TelatenKarya**.

## Commands

```bash
# First-time setup
composer run setup         # install deps, generate key, migrate, build frontend

# Development (runs all three concurrently)
composer run dev           # Laravel server + queue listener + Vite dev server

# Individual processes
php artisan serve          # Laravel on :8000
npm run dev                # Vite only
npm run build              # Production frontend build

# Testing (Pest v3)
php artisan test --compact
php artisan test --compact --filter=TestName
php artisan make:test --pest {Name}    # create a new Pest test

# Code formatting — always run before finalizing PHP changes
vendor/bin/pint --dirty    # fix changed files only
vendor/bin/pint            # fix all PHP files
```

> **migrate:fresh** — user runs `php artisan migrate:fresh` (not `migrate`) during active
> development. Edit existing migration files directly instead of creating new ones.

## Plan System

Implementation is driven by numbered plan files in `.claude/plans/`:

| Plan | Feature | Status |
|---|---|---|
| `00-datatable-component.md` | Reusable DataTable component (server-side, columns API) | ✅ completed |
| `01-thumbnail-produk.md` | Product thumbnail upload | pending |
| `02-mengelola-stock.md` | Stock management & history | pending |
| `03-mengelola-user.md` | User CRUD (admin) | pending |
| `04-mengelola-pesanan.md` | Order management & payment confirmation | pending |
| `05-rekap-harian.md` | Admin dashboard with daily stats | pending |
| `06-penawaran-ngampas.md` | Weekly offer workflow (sales → admin → order) | pending |

**Execute plans in order.** Plan 00 is prerequisite for all Index pages.

## Architecture

**Framework:** Laravel 12. No `app/Http/Kernel.php` — middleware registered in
`bootstrap/app.php` via `Application::configure()->withMiddleware()`. Service providers
listed in `bootstrap/providers.php`.

**Frontend:** React 19 + Inertia.js v2 (JSX, not Blade). Tailwind CSS v3.4 with `selector`
dark mode strategy. Framer Motion 12 for animations. React Hot Toast for flash notifications.
Ziggy 2.5 for `route()` helper in JSX. Entry point: `resources/js/app.jsx`.

**State Management:** Redux Toolkit v2.6 with 4 slices in `resources/js/Redux/slice.jsx`:
- `auth` — user session (`setUser`, `logout`); persists to localStorage (remember me) or sessionStorage
- `currentRoute` — active nav tracking (`setCurrentRoute`, shape: `{ route, subRoute }`)
- `darkMode` — theme toggle (`setDarkMode`); persists to sessionStorage
- `sidebar` — mobile nav toggle (`toggleSidebar`, `setSidebar`); not persisted

**Layouts:**
- `Default.jsx` — main wrapper; includes `<Navbar />` (mobile), `<Sidebar />`, backdrop overlay for mobile, and `pt-14 sm:pt-0` wrapper for children
- `Navbar.jsx` — mobile-only (`sm:hidden`), z-10, hamburger + TelatenKarya brand
- `Sidebar.jsx` — fixed, z-30, `w-80`; desktop always visible, mobile slides in via `translateX`

**Components** (`resources/js/Components/`):
- `button/` — Button, ActionButtonTable, DarkModeToggle, PaginationButton
- `input/` — TextInput, PasswordInput, TextAreaInput, CheckboxInput, NumberInput, ImageInput, SelectInput
- `modal/` — ModalCart, ModalConfirm, ModalDelete
- `DataTable.jsx` — reusable table with search, pagination, select, bulk delete (added in Plan 00)

**Database:** MySQL. Sessions, queues, and cache use the database driver.

**Testing:** Pest v3 with `pestphp/pest-plugin-laravel`. Feature tests preferred.

## Domain Model

| Table | Key columns |
|---|---|
| `users` | role enum (admin/sales/customer), standard auth |
| `products` | name, description, thumbnail (nullable), price, created_by |
| `stocks` | product_id, quantity (±), unit_cost, type (in/out/adjustment), reference_id, reference_type, note, created_by |
| `orders` | status via timestamps: checked_out_at, cancelled_at, expired_at, paid_at; total_price, created_by |
| `orders_items` | order_id, product_id, quantity, price |
| `offers` | name, description, date |
| `offers_items` | offer_id, product_id, quantity, offered_price |
| `offers_sales` | Junction: offer_id ↔ sale_id |
| `payments` | order_id, amount, proof_image |
| `sales` | user_id, phone (sales representatives) |
| `sales_targets` | sale_id, target_amount, start_date, end_date |
| `customers` | address, city, postal_code |

Foreign keys use `RESTRICT` on delete/update — no soft deletes. All tables have
`created_at`/`updated_at` and a `created_by` audit field.

**Stock tracking:** `stocks` is an append-only ledger. Positive quantity = stock in,
negative = stock out. Current stock per product = `SUM(quantity)`. Auto stock-out on
order checkout via `OrderObserver` (registered in `AppServiceProvider`).

**Order status** is derived from timestamps (no `status` column):
- `pending` — no timestamps set
- `paid` — `paid_at` set, `checked_out_at` null
- `completed` — `checked_out_at` set
- `cancelled` — `cancelled_at` set
- `expired` — `expired_at` set

## PHP / Laravel Conventions

- Controllers live in `app/Http/Controllers/Admin/`.
- Always use Form Request classes in `app/Http/Requests/` — never inline `$request->validate()`.
- Models use the `casts()` method, not the `$casts` property.
- Use `Model::query()` over `DB::`. Always eager-load to prevent N+1 queries.
- Use named routes and the `route()` helper for URL generation.
- Use PHP 8 constructor property promotion.
- Always declare explicit return types on methods.
- Always use curly braces for control structures, even single-line bodies.
- Use `config('key')` instead of `env()` outside of config files.
- Use `php artisan make:` with `--no-interaction` flag.
- File uploads: store in `public` disk under `productImages/` → URL via `/storage/productImages/filename`.
- For form update with file upload: use `post` + `_method: 'PUT'` (not `put` directly).

## Frontend Conventions

- Pages receive data as Inertia props — no client-side data fetching.
- Use `useForm` from `@inertiajs/react` for all forms (handles loading state + errors).
- **All list/index pages use `<DataTable>` component** (Plan 00) — do not write raw table boilerplate.
- Read Redux state with `useSelector`; dispatch with `useDispatch`.
- `currentRoute` is set in each page's `useEffect` on mount — shape: `{ route: 'product', subRoute: null }`.
- Flash messages come via Inertia shared props and are shown with `react-hot-toast`.
- Responsive breakpoint: `sm:` (640px). Mobile-first layout — sidebar slides in on mobile.
- Price format: `Rp${value.toLocaleString('id-ID')}`.
- ModalDelete routes: `{resource}.destroy` (single), `{resource}.destroySelected` (bulk, comma-separated IDs).
- Dark mode: always include `dark:` variants for bg, text, border. Base: `slate-800` bg, `slate-400` text.
- **DataTable column order (mandatory):** `#` auto-rendered by DataTable. First user column is always `Action` (no explicit `headerClassName`/`cellClassName` — DataTable auto-styles edges). Last two columns are always `Created At` (sortKey: "created_at") and `Created By` (no sortKey, renders `item.creator?.name ?? "-"`). Every controller `index()` must include `'created_at', 'created_by'` in `->select([...])` and eager-load `->with(['creator:id,name'])`.

## Laravel Boost (MCP)

When available, prefer Boost tools over manual lookups:
- `search-docs` — version-specific docs for Laravel 12, Pest v3, Tailwind v3
- `tinker` — debug and inspect app state
- `database-query` — read-only DB queries
- `browser-logs` — frontend JS errors
- `list-artisan-commands` — before running `php artisan make:`
