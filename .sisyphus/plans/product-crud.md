# Product CRUD Schema Alignment Plan

## TL;DR
> **Summary**: Align Product CRUD end-to-end with the actual `products` + `stocks` ledger schema by adding missing backend CRUD routes/controller/requests and rewriting Product pages to remove legacy supplier/category/image/stock-edit fields.
> **Deliverables**:
> - Admin-protected Product CRUD backend with named routes compatible with existing frontend calls
> - Rewritten Product Index/Create/Edit pages using `name`, `price`, `description`, and computed stock display
> - Sidebar Products nav entry + command-based verification evidence (no new test files)
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: Task 1 → Task 3 → Tasks 4/5/6 → Task 9

## Context
### Original Request
Audit the existing `.claude/plans/product-crud.md` plan and convert it into a decision-complete executable plan.

### Interview Summary
- User approved full audit and conversion to a decision-complete plan.
- Existing source plan captured the right target area but left naming and failure behaviors ambiguous.
- Repository exploration confirms Product frontend files exist while Product backend CRUD wiring is missing.

### Metis Review (gaps addressed)
- Gap: route naming strategy ambiguous (`product.*` vs `admin.product.*`).
  - Resolution: keep names `product.*` to match current frontend + `ModalDelete` contracts, while keeping admin middleware + `/admin/product` path.
- Gap: unclear delete behavior under FK `RESTRICT` dependencies.
  - Resolution: keep delete action enabled; handle failure server-side with deterministic flash error for single and bulk delete.
- Gap: risk of schema creep from legacy UI fields.
  - Resolution: explicitly remove supplier/category/image/stock-edit from Product CRUD scope.

## Work Objectives
### Core Objective
Deliver a fully wired Product CRUD flow that matches current domain schema (`name`, `description`, `price`, `created_by`) and stock ledger architecture (`stocks` sum), without reintroducing legacy inventoryapp-dummy fields.

### Deliverables
- `StoreProductRequest` and `UpdateProductRequest` with schema-accurate validation
- `App\Http\Controllers\Admin\ProductController` with CRUD + bulk delete
- Product routes under admin middleware and `/admin/product*` paths with route names `product.*`
- Rewritten Product `Index.jsx`, `Create.jsx`, `Edit.jsx`
- Sidebar Products link and active-route highlight integration
- Command-based verification outputs (route/syntax/build/smoke checks) with evidence files

### Definition of Done (verifiable conditions with commands)
- `php artisan route:list --name=product` returns exactly 7 Product routes (`product.index`, `product.create`, `product.store`, `product.edit`, `product.update`, `product.destroy`, `product.destroySelected`) and each path starts with `/admin/product`.
- `npm run build` exits 0.
- Product index renders with columns: Name, Price, Stock, Description, Action and no supplier/category/image columns.

### Must Have
- Admin-only route protection remains enforced by existing `auth` + `role:admin` middleware.
- `created_by` set from authenticated user on create.
- Stock displayed as computed value (`stocks_sum_quantity` fallback `0`), not writable Product field.
- Bulk delete accepts comma-separated IDs and returns clear success/error flash.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must NOT add supplier/category/image fields back into Product forms.
- Must NOT add stock input/edit in Product Create/Edit.
- Must NOT introduce dual route-name systems (`product.*` and `admin.product.*`) for same endpoints.
- Must NOT add browser automation framework setup.
- Must NOT expand into unrelated modules (Supplier/Category/Offer CRUD).

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: none (by request, no new automated test files)
- QA policy: Every task includes agent-executed happy + failure/edge command scenarios (route/syntax/build/smoke), no `tests/Feature/*` additions
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1 (foundation + contracts): Tasks 1, 2, 3, 8
Wave 2 (UI rewrites + integration + full verification): Tasks 4, 5, 6, 7, 9

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1 | - | 3, 4, 5, 6, 7, 9 |
| 2 | - | 3, 9 |
| 3 | 1, 2 | 4, 5, 6, 9 |
| 4 | 1, 3 | 9 |
| 5 | 1, 3 | 9 |
| 6 | 1, 3 | 9 |
| 7 | 1 | 9 |
| 8 | 1 | 4, 9 |
| 9 | 4, 5, 6, 7, 8 | Final Wave |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → implementation (1,2,3), review (8)
- Wave 2 → 5 tasks → visual-engineering (4,5,6,7), testing (9)

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add Product route contract under admin middleware

  **What to do**:
  - Register 7 Product routes in `routes/web.php` under `middleware(['auth','role:admin'])` and `prefix('admin')`.
  - Keep route names exactly `product.index|create|store|edit|update|destroy|destroySelected` (no `admin.` prefix for Product CRUD names).
  - Keep URL paths under `/admin/product*`.

  **Must NOT do**:
  - Do not rename existing dashboard routes.
  - Do not add duplicate alias routes for same Product actions.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: backend routing contract with strict naming/path constraints.
  - Skills: `[]` - no specialized skill required.
  - Omitted: `['frontend-ui-ux']` - not a UI styling task.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3,4,5,6,7,8,9 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `routes/web.php:17-27` - existing admin middleware/prefix grouping style.
  - API/Type: `resources/js/Components/modal/ModalDelete.jsx:19-23` - requires `product.destroy` and `product.destroySelected` names.
  - Pattern: `resources/js/Pages/Product/Index.jsx:257,394` - existing `route('product.create')` and `route('product.edit', id)` expectations.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `php artisan route:list --name=product` shows exactly 7 Product names.
  - [ ] `php artisan route:list --name=product --path=admin/product` shows every Product route path starts with `/admin/product`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Product routes registered with expected names
    Tool: Bash
    Steps: Run `php artisan route:list --name=product`
    Expected: Contains exactly `product.index/create/store/edit/update/destroy/destroySelected`
    Evidence: .sisyphus/evidence/task-1-product-routes.txt

  Scenario: No accidental admin.product names for Product CRUD
    Tool: Bash
    Steps: Run `php artisan route:list --name=admin.product`
    Expected: No rows returned
    Evidence: .sisyphus/evidence/task-1-product-routes-error.txt
  ```

  **Commit**: YES | Message: `feat(routes): add admin-path product CRUD route contract` | Files: [`routes/web.php`]

- [x] 2. Create Product Form Requests for store/update validation

  **What to do**:
  - Create `StoreProductRequest` and `UpdateProductRequest` in `app/Http/Requests/`.
  - Rules: `name` required string max:255, `price` required integer min:0, `description` nullable string.
  - Add explicit return types and class structure consistent with Laravel 12.

  **Must NOT do**:
  - Do not keep inline validation inside ProductController.
  - Do not validate legacy fields (`stock`, `supplier_id`, `product_category_id`, `image`).

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: backend validation scaffolding.
  - Skills: `[]` - no extra skill needed.
  - Omitted: `['frontend-ui-ux']` - no frontend styling work.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3,9 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `app/Http/Controllers/Auth/LoginController.php:19-24` - current inline validation to be replaced by FormRequest pattern for Product.
  - API/Type: `app/Models/Product.php:13-18` - allowed persisted fields.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `php -l app/Http/Requests/StoreProductRequest.php` passes syntax check.
  - [ ] `php -l app/Http/Requests/UpdateProductRequest.php` passes syntax check.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: FormRequest files compile
    Tool: Bash
    Steps: Run `php -l app/Http/Requests/StoreProductRequest.php` and `php -l app/Http/Requests/UpdateProductRequest.php`
    Expected: Both return `No syntax errors detected`
    Evidence: .sisyphus/evidence/task-2-form-requests.txt

  Scenario: Validation contract rejects legacy fields reliance
    Tool: Bash
    Steps: Run `grep -nE "stock|supplier_id|product_category_id|image" app/Http/Requests/StoreProductRequest.php app/Http/Requests/UpdateProductRequest.php`
    Expected: No matches
    Evidence: .sisyphus/evidence/task-2-form-requests-error.txt
  ```

  **Commit**: YES | Message: `feat(validation): add product store and update requests` | Files: [`app/Http/Requests/StoreProductRequest.php`, `app/Http/Requests/UpdateProductRequest.php`]

- [x] 3. Implement Admin ProductController CRUD + deterministic delete failures

  **What to do**:
  - Create `app/Http/Controllers/Admin/ProductController.php` with actions: `index`, `create`, `store`, `edit`, `update`, `destroy`, `destroySelected`.
  - `index`: query products with computed stock (`withSum('stocks','quantity')`) and render `Product/Index`.
  - `store`: create from validated fields + `created_by => auth()->id()`.
  - `update`: update validated fields only.
  - `destroy` and `destroySelected`: on FK `RESTRICT` failure return error flash; on success return success flash.

  **Must NOT do**:
  - Do not write `stock` column on products.
  - Do not silently swallow delete exceptions.

  **Recommended Agent Profile**:
  - Category: `implementation` - Reason: primary backend behavior and edge-case handling.
  - Skills: `[]` - default Laravel implementation flow is sufficient.
  - Omitted: `['pest-testing']` - test authoring handled in Task 9.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4,5,6,9 | Blocked By: 1,2

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `app/Http/Controllers/Admin/DashboardController.php:15-25` - `Inertia::render` + `Model::query()` style.
  - API/Type: `app/Models/Product.php:37-45` - stock relation and computed stock pattern.
  - Pattern: `app/Observers/OrderObserver.php:24-34` - `created_by` from `auth()->id()` and ledger behavior.
  - Pattern: `resources/js/Pages/Product/Index.jsx:138-153` - delete modal expects single and bulk endpoints.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Product index request returns props with `products[*].stocks_sum_quantity` key.
  - [ ] Create/update persist only `name`,`description`,`price`,`created_by` contract.
  - [ ] Delete failure due to FK dependency returns non-200 redirect with error flash message.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Admin CRUD happy path backend behavior
    Tool: Bash
    Steps: Run `php artisan route:list --name=product --path=admin/product`
    Expected: Seven Product routes are registered and discoverable
    Evidence: .sisyphus/evidence/task-3-product-controller.txt

  Scenario: FK-restricted delete is handled gracefully
    Tool: Bash
    Steps: Trigger delete on product referenced by related rows via application flow and capture server response log
    Expected: Redirect response with error flash; no uncaught exception page
    Evidence: .sisyphus/evidence/task-3-product-controller-error.txt
  ```

  **Commit**: YES | Message: `feat(product): add admin product controller and delete guardrails` | Files: [`app/Http/Controllers/Admin/ProductController.php`]

- [x] 4. Rewrite Product Index page to schema-accurate list contract

  **What to do**:
  - Rewrite `resources/js/Pages/Product/Index.jsx` to accept props `flash` + `products` only.
  - Remove supplier/category filter state and related UI blocks.
  - Table columns become: checkbox, Name, Price, Stock, Description, Action.
  - Render stock from `item.stocks_sum_quantity ?? 0` and price as `Rp${item.price.toLocaleString('id-ID')}`.
  - Keep delete modal integration (`type='product'`, `type='product_selected'`) and search-by-name.

  **Must NOT do**:
  - Do not reference `item.image`, `item.supplier`, `item.product_category`, or `item.stock`.
  - Do not change `setCurrentRoute({ route: 'product', subRoute: 'master' })` semantics.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: substantial JSX layout/table rewrite.
  - Skills: `['frontend-ui-ux']` - maintain consistent dashboard UI patterns while rewriting content.
  - Omitted: `['impeccable-style']` - no high-polish redesign requested.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1,3,8

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `resources/js/Pages/Product/Index.jsx:31` - current route-state dispatch shape.
  - Pattern: `resources/js/Pages/Product/Index.jsx:138-153` - ModalDelete type contract.
  - Pattern: `resources/js/Pages/Product/Index.jsx:257,394` - product route usage points.
  - API/Type: `resources/js/Redux/slice.jsx:37-44` - currentRoute structure.
  - API/Type: `app/Models/Product.php:42-45` - stock must be computed/derived.

  **Acceptance Criteria** (agent-executable only):
  - [ ] No references to `supplier_id|product_category_id|item.image|item.supplier|item.product_category|item.stock` remain in Product Index.
  - [ ] `npm run build` passes after rewrite.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Index compiles and uses new data contract
    Tool: Bash
    Steps: Run `npm run build`
    Expected: Build exits 0 with updated Product Index
    Evidence: .sisyphus/evidence/task-4-product-index.txt

  Scenario: Legacy field usage removed from Product Index
    Tool: Bash
    Steps: Run `grep -nE "supplier_id|product_category_id|item\.image|item\.supplier|item\.product_category|item\.stock" resources/js/Pages/Product/Index.jsx`
    Expected: No matches
    Evidence: .sisyphus/evidence/task-4-product-index-error.txt
  ```

  **Commit**: YES | Message: `refactor(product-ui): align index page with zenlab schema` | Files: [`resources/js/Pages/Product/Index.jsx`]

- [x] 5. Rewrite Product Create page to 3-field schema form

  **What to do**:
  - Rewrite `resources/js/Pages/Product/Create.jsx` props to `flash` only.
  - `useForm` fields: `name`, `price`, `description` only.
  - Remove supplier/category/image/stock inputs and options building logic.
  - Keep submit to `post(route('product.store'))` and reset these three fields.

  **Must NOT do**:
  - Do not keep `encType="multipart/form-data"` for non-file form.
  - Do not include required validation flags for removed fields.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: JSX form rewrite with layout preservation.
  - Skills: `['frontend-ui-ux']` - keep consistency with existing component styles.
  - Omitted: `['impeccable-style']` - no visual overhaul needed.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1,3

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `resources/js/Pages/Product/Create.jsx:22-30` - current obsolete form payload to remove.
  - Pattern: `resources/js/Pages/Product/Create.jsx:34,94` - maintain `product.store` and `product.index` route usage.
  - API/Type: `app/Models/Product.php:13-18` - canonical writable product fields.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Product Create uses exactly `name`,`price`,`description` in `useForm`.
  - [ ] `npm run build` passes after rewrite.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Create page build validation
    Tool: Bash
    Steps: Run `npm run build`
    Expected: Build exits 0 with rewritten Create page
    Evidence: .sisyphus/evidence/task-5-product-create.txt

  Scenario: Legacy Create fields removed
    Tool: Bash
    Steps: Run `grep -nE "stock|supplier_id|product_category_id|image|suppliers|categories" resources/js/Pages/Product/Create.jsx`
    Expected: No matches except allowed text labels unrelated to form fields
    Evidence: .sisyphus/evidence/task-5-product-create-error.txt
  ```

  **Commit**: YES | Message: `refactor(product-ui): simplify create form to zenlab schema` | Files: [`resources/js/Pages/Product/Create.jsx`]

- [x] 6. Rewrite Product Edit page to 3-field schema form

  **What to do**:
  - Rewrite `resources/js/Pages/Product/Edit.jsx` props to `flash` + `product` only.
  - Pre-populate `name`,`price`,`description` from product.
  - Submit with `put(route('product.update', product.id))`.
  - Reset button restores original three values.

  **Must NOT do**:
  - Do not keep `post(route('product.update', ...))` method spoofing in this page.
  - Do not reference `product.supplier`, `product.product_category`, `product.image`, or `product.stock`.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: form contract rewrite and method fix.
  - Skills: `['frontend-ui-ux']` - preserve component usage conventions.
  - Omitted: `['impeccable-style']` - no advanced visual redesign required.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1,3

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `resources/js/Pages/Product/Edit.jsx:22-30` - current obsolete form payload to remove.
  - Pattern: `resources/js/Pages/Product/Edit.jsx:34` - currently uses `post`; must switch to `put`.
  - API/Type: `app/Models/Product.php:13-18` - writable field contract.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Edit page submits via Inertia `put` to `route('product.update', product.id)`.
  - [ ] No obsolete field references remain in Edit page.
  - [ ] `npm run build` passes.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Edit page method + build validation
    Tool: Bash
    Steps: Run `npm run build`
    Expected: Build exits 0 and Edit page compiles with `put(...)` submit path
    Evidence: .sisyphus/evidence/task-6-product-edit.txt

  Scenario: Legacy Edit fields removed
    Tool: Bash
    Steps: Run `grep -nE "product\.supplier|product\.product_category|product\.image|product\.stock|supplier_id|product_category_id|image" resources/js/Pages/Product/Edit.jsx`
    Expected: No matches
    Evidence: .sisyphus/evidence/task-6-product-edit-error.txt
  ```

  **Commit**: YES | Message: `fix(product-ui): align edit form and update method` | Files: [`resources/js/Pages/Product/Edit.jsx`]

- [x] 7. Add Products navigation entry to Sidebar

  **What to do**:
  - Update `resources/js/Layouts/Sidebar.jsx` to include Products nav item after Dashboard.
  - Use `route('product.index')` and active-state check `currentRoute.route === 'product'`.
  - Keep existing active/inactive class style pattern from Dashboard item.

  **Must NOT do**:
  - Do not alter existing Dashboard role-based route selection.
  - Do not change sidebar state behavior (`setSidebar`, mobile slide behavior).

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: navigation UI integration.
  - Skills: `['frontend-ui-ux']` - ensure style consistency.
  - Omitted: `['impeccable-style']` - no polish pass required.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `resources/js/Layouts/Sidebar.jsx:58-72` - existing nav item style and active class logic.
  - API/Type: `resources/js/Redux/slice.jsx:39-44` - currentRoute object shape.
  - Pattern: `resources/js/Pages/Product/Index.jsx:31` - Product pages dispatch route marker `route: 'product'`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Sidebar includes Products link using `route('product.index')`.
  - [ ] Active state toggles when `currentRoute.route === 'product'`.
  - [ ] `npm run build` passes.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Sidebar build validation with Products nav
    Tool: Bash
    Steps: Run `npm run build`
    Expected: Build exits 0 with new nav item
    Evidence: .sisyphus/evidence/task-7-sidebar-products.txt

  Scenario: Active state expression regression check
    Tool: Bash
    Steps: Run `grep -n "currentRoute.route === \"product\"" resources/js/Layouts/Sidebar.jsx`
    Expected: Match found exactly for Products nav logic
    Evidence: .sisyphus/evidence/task-7-sidebar-products-error.txt
  ```

  **Commit**: YES | Message: `feat(nav): add products link to sidebar` | Files: [`resources/js/Layouts/Sidebar.jsx`]

- [x] 8. Preserve ModalDelete product type contract with no route-name drift

  **What to do**:
  - Verify `ModalDelete` mapping for `product` and `product_selected` still points to `product.destroy` and `product.destroySelected`.
  - Update only if any accidental route-name changes are introduced by route/controller tasks.

  **Must NOT do**:
  - Do not change existing category/supplier/customer mappings.
  - Do not switch Product mapping to `admin.product.*`.

  **Recommended Agent Profile**:
  - Category: `review` - Reason: compatibility safeguard task.
  - Skills: `[]` - static review task.
  - Omitted: `['frontend-ui-ux']` - no UI redesign.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4,9 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `resources/js/Components/modal/ModalDelete.jsx:19-23` - Product delete route mapping.
  - Pattern: `resources/js/Components/modal/ModalDelete.jsx:18,23` - bulk delete comma-separated IDs.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Product mapping remains exactly `product.destroy` and `product.destroySelected`.
  - [ ] Bulk delete still passes `itemID.join(',')` for selected mode.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Product route mapping contract intact
    Tool: Bash
    Steps: Run `grep -nE "product\.destroy|product\.destroySelected" resources/js/Components/modal/ModalDelete.jsx`
    Expected: Both mappings present
    Evidence: .sisyphus/evidence/task-8-modal-contract.txt

  Scenario: Bulk selected IDs still comma-joined
    Tool: Bash
    Steps: Run `grep -n "itemID.join(\",\")" resources/js/Components/modal/ModalDelete.jsx`
    Expected: Match present for selected delete branches
    Evidence: .sisyphus/evidence/task-8-modal-contract-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`resources/js/Components/modal/ModalDelete.jsx` (only if needed)]

- [x] 9. Run consolidated verification and capture evidence bundle (no test files)

  **What to do**:
  - Execute route list, PHP syntax checks for new backend files, and frontend build.
  - Store outputs in `.sisyphus/evidence/` per task references.
  - Confirm no Product page/form still depends on legacy schema fields.

  **Must NOT do**:
  - Do not mark complete if any command fails.
  - Do not skip evidence capture for failed checks.

  **Recommended Agent Profile**:
  - Category: `testing` - Reason: verification orchestration and evidence collection.
  - Skills: `[]` - standard command execution.
  - Omitted: `['frontend-ui-ux']` - verification task only.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final Wave | Blocked By: 4,5,6,7,8

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `AGENTS.md` testing commands section - preferred commands `php artisan test --compact`, filtered runs.
  - Pattern: `routes/web.php:17-19` - admin route grouping baseline.
  - Pattern: `resources/js/Pages/Product/Index.jsx:138-153` - delete modal behavior to validate in flow.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `php artisan route:list --name=product` passes and includes 7 expected names.
  - [ ] `php -l app/Http/Controllers/Admin/ProductController.php` passes.
  - [ ] `php -l app/Http/Requests/StoreProductRequest.php` and `php -l app/Http/Requests/UpdateProductRequest.php` pass.
  - [ ] `npm run build` exits 0.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Consolidated success verification
    Tool: Bash
    Steps: Run `php artisan route:list --name=product && php -l app/Http/Controllers/Admin/ProductController.php && php -l app/Http/Requests/StoreProductRequest.php && php -l app/Http/Requests/UpdateProductRequest.php && npm run build`
    Expected: All commands succeed with exit code 0
    Evidence: .sisyphus/evidence/task-9-verification.txt

  Scenario: Failure evidence on regression
    Tool: Bash
    Steps: Re-run failed command(s) individually and capture stderr/stdout into evidence files
    Expected: Failure cause is explicit and traceable to file/line or assertion
    Evidence: .sisyphus/evidence/task-9-verification-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`.sisyphus/evidence/*`]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit in 4 slices: backend contracts, product UI rewrite, navigation/modal integration, test+verification updates.
- Message format: `type(scope): desc`.
- No commit during failing tests/build.

## Success Criteria
- Product CRUD is runnable end-to-end for admin users only.
- No legacy product schema fields remain in Product pages/forms.
- Delete success and dependency-failure paths are both deterministic and covered by tests.
- Plan tasks produce verifiable evidence artifacts for each acceptance check.
