<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $perPage = $request->query('per_page', 10);

        $allowedSorts = ['name', 'price', 'created_at', 'stocks_sum_quantity'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $products = Product::query()
            ->select(['id', 'name', 'description', 'thumbnail', 'price', 'created_at', 'created_by'])
            ->withSum('stocks', 'quantity')
            ->with(['creator:id,name'])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Product/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Product/Create');
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $data = $request->safe()->except(['thumbnail', 'initial_quantity', 'initial_unit_cost', 'initial_note']);
        $data['created_by'] = auth()->id();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('productImages', 'public');
        }

        $product = Product::query()->create($data);

        $initialQty = $validated['initial_quantity'] ?? null;
        if ($initialQty) {
            $product->stocks()->create([
                'quantity' => $initialQty,
                'unit_cost' => $validated['initial_unit_cost'] ?? null,
                'type' => 'in',
                'note' => $validated['initial_note'] ?? 'Initial stock',
                'created_by' => auth()->id(),
            ]);
        }

        return redirect()->route('product.index')->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        return Inertia::render('Product/Show', [
            'product' => $product,
            'stocks' => $product->stocks()
                ->select(['id', 'quantity', 'unit_cost', 'type', 'note', 'created_at'])
                ->latest()
                ->get(),
            'currentStock' => $product->currentStock(),
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Product/Edit', [
            'product' => $product,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $data = $request->safe()->except(['thumbnail', 'stock_quantity', 'stock_type', 'stock_unit_cost', 'stock_note']);

        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }

            $data['thumbnail'] = $request->file('thumbnail')->store('productImages', 'public');
        }

        $product->update($data);

        $stockQty = $validated['stock_quantity'] ?? null;
        $stockType = $validated['stock_type'] ?? null;
        if ($stockQty && $stockType) {
            $quantity = abs($stockQty);
            if ($stockType === 'out') {
                $quantity = -$quantity;
            }

            $product->stocks()->create([
                'quantity' => $quantity,
                'unit_cost' => $validated['stock_unit_cost'] ?? null,
                'type' => $stockType,
                'note' => $validated['stock_note'] ?? null,
                'created_by' => auth()->id(),
            ]);
        }

        return redirect()->route('product.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        try {
            $product->delete();
        } catch (QueryException $exception) {
            return back()->with('error', $this->deleteErrorMessage(false, $exception));
        }

        return redirect()->route('product.index')->with('success', 'Product deleted successfully.');
    }

    public function destroySelected(string $ids): RedirectResponse
    {
        $productIds = array_values(array_filter(
            array_map('trim', explode(',', $ids)),
            static fn (string $id): bool => $id !== '' && ctype_digit($id)
        ));

        if ($productIds === []) {
            return back()->with('error', 'No products were selected for deletion.');
        }

        try {
            $deletedCount = DB::transaction(static function () use ($productIds): int {
                $deletedCount = 0;

                Product::query()
                    ->whereKey($productIds)
                    ->get()
                    ->each(static function (Product $product) use (&$deletedCount): void {
                        if ($product->delete()) {
                            $deletedCount++;
                        }
                    });

                return $deletedCount;
            });
        } catch (QueryException $exception) {
            return back()->with('error', $this->deleteErrorMessage(true, $exception));
        }

        if ($deletedCount === 0) {
            return back()->with('error', 'No matching products were deleted.');
        }

        return redirect()->route('product.index')->with('success', 'Selected products deleted successfully.');
    }

    private function deleteErrorMessage(bool $bulk, QueryException $exception): string
    {
        if ($this->isForeignKeyRestrictionViolation($exception)) {
            return $bulk
                ? 'Unable to delete the selected products because they are referenced by related records.'
                : 'Unable to delete this product because it is referenced by related records.';
        }

        return $bulk
            ? 'Unable to delete the selected products due to a database error.'
            : 'Unable to delete this product due to a database error.';
    }

    private function isForeignKeyRestrictionViolation(QueryException $exception): bool
    {
        $sqlState = $exception->errorInfo[0] ?? null;
        $driverCode = $exception->errorInfo[1] ?? null;

        return $sqlState === '23000' && in_array((int) $driverCode, [1451, 1452], true);
    }
}
