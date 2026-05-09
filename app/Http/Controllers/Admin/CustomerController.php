<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $perPage = $request->query('per_page', 10);

        $allowedSorts = ['name', 'email', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $customers = Customer::query()
            ->select(['id', 'name', 'email', 'phone as number_phone', 'address', 'created_at', 'created_by'])
            ->with('creator:id,name')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customer/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Customer::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'],
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('customer.index')->with('success', 'Customer created successfully.');
    }

    /**
     * Quick store for modal use — redirects back to the calling page.
     */
    public function storeQuick(StoreCustomerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Customer::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'],
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Customer created successfully.');
    }

    public function edit(Customer $customer): Response
    {
        $customer->number_phone = $customer->phone;

        return Inertia::render('Customer/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(StoreCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validated();

        $customer->update([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'],
        ]);

        return redirect()->route('customer.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customer.index')->with('success', 'Customer deleted successfully.');
    }

    public function destroySelected(string $ids): RedirectResponse
    {
        $customerIds = array_values(array_filter(
            array_map('trim', explode(',', $ids)),
            static fn (string $id): bool => $id !== '' && ctype_digit($id)
        ));

        if ($customerIds === []) {
            return back()->with('error', 'No customers were selected for deletion.');
        }

        Customer::query()->whereKey($customerIds)->delete();

        return redirect()->route('customer.index')->with('success', 'Selected customers deleted successfully.');
    }
}
