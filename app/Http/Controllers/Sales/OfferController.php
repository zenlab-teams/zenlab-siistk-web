<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesOfferRecordRequest;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferRecord;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    private function currentSale(): Sale
    {
        $sale = Sale::query()->where('user_id', auth()->id())->first();

        if ($sale === null) {
            abort(403, 'Akun sales Anda belum terdaftar. Hubungi administrator.');
        }

        return $sale;
    }

    public function index(Request $request): Response
    {
        $sale = $this->currentSale();
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
            ->select(['id', 'name', 'date', 'rejected_at', 'completed_at', 'created_at', 'created_by'])
            ->whereHas('offerSales', fn ($query) => $query->where('sale_id', $sale->id))
            ->withCount('items')
            ->with(['creator:id,name'])
            ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Sales/Offer/Index', [
            'offers' => $offers,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function show(Offer $offer): Response
    {
        $sale = $this->currentSale();

        if (! $offer->offerSales()->where('sale_id', $sale->id)->exists()) {
            abort(403);
        }

        $offer->load([
            'items.product:id,name,thumbnail',
            'offerSales.sale.user:id,name',
            'creator:id,name',
            'records.customer:id,name',
            'records.order:id,offer_record_id',
            'records.sale.user:id,name',
            'records.items.product:id,name',
            'records.items:id,offer_record_id,product_id,quantity,sold_price,subtotal',
        ]);

        return Inertia::render('Sales/Offer/Show', [
            'offer' => $offer,
            'customers' => Customer::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'currentSaleId' => $sale->id,
        ]);
    }

    public function storeRecord(StoreSalesOfferRecordRequest $request, Offer $offer): RedirectResponse
    {
        $sale = $this->currentSale();

        if (! $offer->offerSales()->where('sale_id', $sale->id)->exists()) {
            abort(403);
        }

        if ($offer->completed_at || $offer->rejected_at) {
            return back()->with('error', 'Cannot add record to a finished offer.');
        }

        DB::transaction(function () use ($request, $offer, $sale): void {
            $validated = $request->validated();

            $record = OfferRecord::query()->create([
                'offer_id' => $offer->id,
                'sale_id' => $sale->id,
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

        return back()->with('success', 'Laporan penjualan berhasil dikirim.');
    }
}
