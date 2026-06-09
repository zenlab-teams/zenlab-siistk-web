<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfferRecordRequest;
use App\Http\Requests\StoreOfferRequest;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferRecord;
use App\Models\OfferRecordItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Stock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $perPage = $request->query('per_page', 10);

        $allowedSorts = ['name', 'date', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $offers = Offer::query()
            ->select(['id', 'name', 'date', 'location', 'rejected_at', 'completed_at', 'created_at', 'created_by'])
            ->with(['offerSales.sale.user:id,name', 'creator:id,name'])
            ->withCount('items')
            ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Offer/Index', [
            'offers' => $offers,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Offer/Create', [
            'sales' => Sale::query()
                ->select(['id', 'user_id'])
                ->with('user:id,name')
                ->get(),
            'products' => Product::query()
                ->select(['id', 'name', 'price'])
                ->withSum('stocks', 'quantity')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreOfferRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $validated = $request->validated();

            $offer = Offer::query()->create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'date' => $validated['date'],
                'location' => $validated['location'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $offer->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'offered_price' => $item['offered_price'],
                    'subtotal' => $item['quantity'] * $item['offered_price'],
                    'created_by' => auth()->id(),
                ]);
            }

            foreach ($validated['sale_ids'] as $saleId) {
                $offer->offerSales()->create([
                    'sale_id' => $saleId,
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return redirect()->route('offer.index')->with('success', 'Offer created successfully.');
    }

    public function show(Offer $offer): Response
    {
        $offer->load([
            'items.product:id,name,thumbnail',
            'offerSales.sale.user:id,name',
            'creator:id,name',
            'records.customer:id,name',
            'records.order.invoice.payments:id,invoice_id,amount,status',
            'records.sale.user:id,name',
            'records.items.product:id,name',
            'records.items:id,offer_record_id,product_id,quantity,sold_price,subtotal',
        ]);

        return Inertia::render('Offer/Show', [
            'offer' => $offer,
            'customers' => Customer::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function complete(Offer $offer): RedirectResponse
    {
        if ($offer->completed_at || $offer->rejected_at) {
            return back()->with('error', 'Offer is already finished.');
        }

        DB::transaction(function () use ($offer): void {
            $soldByProduct = OfferRecordItem::query()
                ->whereHas('record', function ($query) use ($offer) {
                    $query->where('offer_id', $offer->id)
                        ->where('status', 'approved');
                })
                ->selectRaw('product_id, SUM(quantity) as sold_qty')
                ->groupBy('product_id')
                ->pluck('sold_qty', 'product_id');

            foreach ($offer->load('items')->items as $item) {
                $sold = (int) ($soldByProduct[$item->product_id] ?? 0);
                $unsold = $item->quantity - $sold;
                if ($unsold > 0) {
                    Stock::query()->create([
                        'product_id' => $item->product_id,
                        'quantity' => $unsold,
                        'type' => 'in',
                        'reference_id' => $offer->id,
                        'reference_type' => Offer::class,
                        'note' => "Retur ngampas: {$offer->name}",
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            $offer->update(['completed_at' => now()]);
        });

        return back()->with('success', 'Offer completed. Unsold stock returned.');
    }

    public function reject(Offer $offer): RedirectResponse
    {
        if ($offer->rejected_at || $offer->completed_at) {
            return back()->with('error', 'Offer is already finished.');
        }

        DB::transaction(function () use ($offer): void {
            foreach ($offer->load('items')->items as $item) {
                Stock::query()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'type' => 'in',
                    'reference_id' => $offer->id,
                    'reference_type' => Offer::class,
                    'note' => "Batal ngampas: {$offer->name}",
                    'created_by' => auth()->id(),
                ]);
            }

            $offer->update(['rejected_at' => now()]);
        });

        return back()->with('success', 'Offer rejected. All stock returned.');
    }

    public function storeRecord(StoreOfferRecordRequest $request, Offer $offer): RedirectResponse
    {
        if ($offer->completed_at || $offer->rejected_at) {
            return back()->with('error', 'Cannot add record to a finished offer.');
        }

        DB::transaction(function () use ($request, $offer): void {
            $validated = $request->validated();

            $record = OfferRecord::query()->create([
                'offer_id' => $offer->id,
                'sale_id' => $validated['sale_id'],
                'customer_id' => $validated['customer_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $record->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'sold_price' => $item['sold_price'],
                    'subtotal' => $item['quantity'] * $item['sold_price'],
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Sale record added.');
    }

    public function approveRecord(Offer $offer, OfferRecord $record): RedirectResponse
    {
        if ($record->offer_id !== $offer->id) {
            abort(404);
        }
        if ($record->status !== 'pending') {
            return back()->with('error', 'Record is already processed.');
        }

        $order = DB::transaction(function () use ($record) {
            $record->load('items');
            $totalPrice = $record->items->sum('subtotal');

            $orderData = [
                'customer_id' => $record->customer_id,
                'offer_record_id' => $record->id,
                'total_price' => $totalPrice,
                'checked_out_at' => now(),
                'created_by' => auth()->id(),
            ];

            $order = Order::query()->create($orderData);

            foreach ($record->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->sold_price,
                    'subtotal' => $item->subtotal,
                    'created_by' => auth()->id(),
                ]);
            }

            $order->invoice()->create([
                'total_amount' => $totalPrice,
                'created_by' => auth()->id(),
            ]);

            $record->update(['status' => 'approved']);

            return $order;
        });

        return redirect()->route('order.show', $order)
            ->with('success', 'Record approved. Order and invoice created.');
    }

    public function rejectRecord(Offer $offer, OfferRecord $record): RedirectResponse
    {
        if ($record->offer_id !== $offer->id) {
            abort(404);
        }
        if ($record->status !== 'pending') {
            return back()->with('error', 'Record is already processed.');
        }

        $record->update(['status' => 'rejected']);

        return back()->with('success', 'Record rejected.');
    }
}
