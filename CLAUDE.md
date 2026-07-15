# Agent Guidance

Guidance for every AI agent planning, implementing, or reviewing work in this repository.
`AGENTS.md` and `CLAUDE.md` must remain identical.

## Operating Rules

- Follow the user's requested scope. Plan, implement, and review as needed.
- Read relevant files before editing. Reuse existing patterns and components.
- Prefer minimal targeted changes. Do not refactor unrelated code.
- Follow numbered plans in `.claude/plans/` when the task references one.
- Check plan dependencies before implementation. Do not assume documented status is current.
- Do not run `php artisan migrate:fresh`; the user controls destructive database resets.
- During active development, edit an existing migration instead of adding a corrective migration.
- Never push, open a PR, or delete user data without explicit approval.
- Preserve existing user changes. Do not modify `.claude/worktrees/` copies.

## Project

**ZENLAB SIISTK** is the **TelatenKarya** sales and inventory admin application.

- Backend: PHP 8.2+, Laravel 12
- Frontend: React 18, Inertia.js v2, Redux Toolkit
- Styling: Tailwind CSS 3.4 with `selector` dark mode
- Build: Vite 7
- Tests: Pest 3
- Primary database: MySQL; tests and CI may use SQLite in memory
- Roles: `admin`, `sales`, `customer`

Use dependency manifests as the source of truth for versions:
`composer.json`, `package.json`, and `package-lock.json`.

## Commands

```bash
composer run setup
composer run dev
npm run dev
npm run build
php artisan test --compact
php artisan test --compact --filter=TestName
vendor/bin/pint --dirty
php artisan route:list --name=<prefix>
```

Before running a `php artisan make:*` command, inspect available commands through Laravel
Boost when available. Always pass `--no-interaction`.

## Repository Structure

```text
app/
  Http/
    Controllers/
      Admin/             Admin workflows
      Auth/              Authentication
      Customer/          Customer workflows
      Sales/             Sales workflows
    Middleware/          Role and request middleware
    Requests/            Form Request validation
  Models/                Eloquent models
  Observers/             Domain side effects
  Providers/             Service registration
bootstrap/app.php         Middleware aliases and application bootstrap
database/
  factories/             Model factories
  migrations/            Database schema
  seeders/               Development seed data
resources/js/
  Components/             Shared React components
    button/
    input/
    modal/
    DataTable.jsx
  Layouts/                Inertia layouts
  Pages/                  Inertia pages grouped by domain
  Redux/slice.jsx         Shared Redux slices
  app.jsx                 Frontend entry point
routes/web.php             Named web routes and role groups
tests/Feature/             Pest feature tests
.claude/plans/             Numbered implementation plans
```

## Backend Conventions

- Controllers use explicit return types.
- Validation belongs in Form Request classes under `app/Http/Requests/`.
- Use `$request->safe()` or `$request->validated()` after authorization and validation.
- Prefer `Model::query()` over `DB::table()` for domain data.
- Reporting and aggregate queries may use the query builder when Eloquent adds no value.
- Eager-load relationships required by views. Prevent N+1 queries.
- Select only required columns, including foreign keys needed by relationships.
- Models define casts through `casts(): array`, not the `$casts` property.
- Use named routes and `route()` for URL generation.
- Use `config()` outside configuration files; never call `env()` directly there.
- Use constructor property promotion for injected dependencies.
- Always use braces for control structures.
- Use database transactions for multi-write operations that must succeed atomically.
- Set `created_by` on auditable records. Load `creator:id,name` when displaying it.
- Keep user-facing errors in Indonesian; logs and code comments in English.

### Controller Query Pattern

```php
public function index(Request $request): Response
{
    $products = Product::query()
        ->select(['id', 'name', 'price', 'created_at', 'created_by'])
        ->with(['creator:id,name'])
        ->when($request->string('search')->toString(), function ($query, string $search): void {
            $query->where('name', 'like', "%{$search}%");
        })
        ->latest()
        ->paginate($request->integer('per_page', 10))
        ->withQueryString();

    return Inertia::render('Product/Index', ['products' => $products]);
}
```

Whitelist user-controlled sort columns before passing them to `orderBy()`.

### Form Request Pattern

```php
public function store(StoreProductRequest $request): RedirectResponse
{
    $product = Product::query()->create([
        ...$request->safe()->except('thumbnail'),
        'created_by' => auth()->id(),
    ]);

    return redirect()->route('product.show', $product)->with('success', 'Produk berhasil dibuat.');
}
```

Handle upload failures with context. Store product images on the `public` disk under
`productImages/`; persist the relative path and expose it through `/storage/...`.

## Frontend Conventions

- Pages receive server data through Inertia props. Do not add client fetching unnecessarily.
- Use `useForm` from `@inertiajs/react` for forms, errors, and processing state.
- Use shared inputs from `resources/js/Components/input/`.
- Shared input handlers generally use `(name, value)`; inspect the component before use.
- Use `<DataTable>` for CRUD index pages. Raw tables are acceptable for dashboard summaries.
- DataTable filtering is server-side through `router.get()` and Laravel paginator metadata.
- DataTable `sortKey` values match whitelisted database columns, usually lowercase.
- Use Redux through `useSelector` and `useDispatch`; never mutate shared state.
- Set `currentRoute` in page effects and include `dispatch` in dependencies.
- Use named Ziggy routes through `route()`.
- Include responsive and `dark:` variants for backgrounds, text, and borders.
- Prefer semantic interactive elements (`button`, `Link`) over clickable icons or `div` elements.
- Preserve keyboard access, focus styles, labels, and accessible names.
- Format prices as `Rp${value.toLocaleString('id-ID')}`.
- For file uploads on update, submit with `post()` and `_method: 'PUT'`.
- Keep components focused. Extract shared code only after actual reuse appears.

### DataTable Pattern

```jsx
<DataTable
    data={products}
    title="Products"
    addHref={route("product.create")}
    addLabel="Add Product"
    columns={columns}
    selectable
    deleteType="product"
/>
```

Column order for standard CRUD indexes:

1. `#` generated by DataTable
2. `Action`
3. Domain columns
4. `Created At` with `sortKey: "created_at"`
5. `Created By` rendering `item.creator?.name ?? "-"`

### Form Pattern

```jsx
const { data, setData, post, errors, processing } = useForm({
    name: "",
    price: "",
});

const handleSubmit = (event) => {
    event.preventDefault();
    post(route("product.store"));
};
```

## Domain Rules

### Stock

`stocks` is an append-only ledger:

- Positive `quantity`: stock in
- Negative `quantity`: stock out
- Current stock: `SUM(quantity)`
- Never update or delete historical stock rows
- Order checkout stock changes belong in the registered order observer/domain flow

### Orders

Order status is derived from timestamps; no `status` column:

- `pending`: no terminal/payment timestamps
- `paid`: `paid_at` set, `checked_out_at` null
- `completed`: `checked_out_at` set
- `cancelled`: `cancelled_at` set
- `expired`: `expired_at` set

Preserve status-transition invariants. Lock or transact concurrent stock/payment updates where
races could oversell stock or duplicate confirmation.

### Database

- Foreign keys generally use `RESTRICT` for update/delete.
- Domain tables use timestamps and auditable `created_by` fields.
- Sessions, queues, and cache may use database drivers.
- Avoid schema assumptions; inspect migrations before changing queries or validation.

## Testing Workflow

Behavior changes use TDD when practical:

1. Add the smallest failing Pest regression or feature test.
2. Run the focused test and confirm the expected failure.
3. Implement the minimum change.
4. Run the focused test and adjacent tests.
5. Run `vendor/bin/pint --dirty` after PHP changes.
6. Run `npm run build` after frontend changes.

Use `RefreshDatabase` for database feature tests. Prefer HTTP, authorization, validation,
redirect, Inertia prop, and database assertions over implementation-detail assertions.
Never weaken or delete a failing test merely to make the suite pass.

## Review Checklist

- Requested behavior and plan requirements satisfied
- Authorization and Form Request validation present
- No unsafe user-controlled sorting, paths, or mass assignment
- Transactions protect atomic multi-write flows
- No N+1 queries; selected columns include relationship keys
- Domain invariants preserved, especially stock and order state
- Named routes and existing shared components reused
- CRUD indexes use DataTable consistently
- Dark mode, responsive layout, and accessibility covered
- User-facing errors Indonesian; logs/comments English
- Focused tests, adjacent tests, formatting, and frontend build pass
- No unrelated files, generated worktrees, or user changes modified

## Laravel Boost

When available, prefer Laravel Boost tools:

- `application-info`: inspect installed versions and models
- `search-docs`: version-specific Laravel ecosystem documentation
- `list-artisan-commands`: verify generator commands
- `database-schema` and `database-query`: inspect schema/data read-only
- `tinker`: narrow runtime inspection
- `browser-logs` and `last-error`: diagnose frontend/backend failures
- `get-absolute-url`: generate project URLs

Documentation describes intended standards. Existing exceptions are not precedent; avoid widening
them. If code and documentation disagree, verify manifests, migrations, routes, and runtime behavior,
then update the narrowest incorrect source.