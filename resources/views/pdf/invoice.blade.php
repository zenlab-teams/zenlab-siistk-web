<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            color: #334155;
            margin: 0;
            padding: 40px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 40px;
        }
        .header-left {
            display: table-cell;
            vertical-align: top;
        }
        .header-right {
            display: table-cell;
            vertical-align: top;
            text-align: right;
        }
        .brand {
            font-size: 24px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            text-transform: uppercase;
            color: #1e293b;
            margin-bottom: 10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .info-table td {
            vertical-align: top;
            padding-bottom: 20px;
        }
        .label {
            color: #64748b;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .value {
            font-size: 13px;
            color: #1e293b;
            font-weight: bold;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            padding: 12px 10px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
        }
        .items-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #f1f5f9;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            width: 100%;
            display: table;
        }
        .totals-left {
            display: table-cell;
            width: 60%;
        }
        .totals-right {
            display: table-cell;
            width: 40%;
        }
        .total-row {
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .total-row.grand-total {
            border-bottom: none;
            padding-top: 20px;
        }
        .grand-total .value {
            font-size: 20px;
            color: #0ea5e9;
        }
        .footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            color: #94a3b8;
            font-size: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-completed { background-color: #f0fdf4; color: #16a34a; }
        .status-pending { background-color: #f8fafc; color: #64748b; }
        .status-cancelled { background-color: #fef2f2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="brand">TelatenKarya</div>
            <div style="color: #64748b;">SIISTK - Sistem Informasi Sales & Stock</div>
        </div>
        <div class="header-right">
            <div class="invoice-title">Invoice</div>
            <div class="value">#INV-{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
        </div>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 33.33%;">
                <div class="label">Bill To</div>
                <div class="value">{{ $order->customer->name ?? 'Walk-in Customer' }}</div>
                @if($order->customer?->phone)
                    <div style="color: #64748b; font-size: 11px; margin-top: 3px;">{{ $order->customer->phone }}</div>
                @endif
            </td>
            <td style="width: 33.33%;">
                <div class="label">Date Issued</div>
                <div class="value">{{ $order->created_at->format('d M Y') }}</div>
            </td>
            <td style="width: 33.33%;" class="text-right">
                <div class="label">Status</div>
                <div class="status-badge status-{{ $order->status }}">
                    {{ $order->status }}
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Sales Representative</div>
                <div class="value">{{ $order->offerRecord->sale->user->name ?? $order->creator->name ?? '-' }}</div>
            </td>
            <td>
                @if($order->invoice?->due_date)
                    <div class="label">Due Date</div>
                    <div class="value">{{ \Carbon\Carbon::parse($order->invoice->due_date)->format('d M Y') }}</div>
                @endif
            </td>
            <td class="text-right">
                <div class="label">Payment Status</div>
                @php
                    $paidAmount = $order->invoice?->paid_amount ?? 0;
                    $isPaid = $paidAmount >= $order->total_price;
                @endphp
                <div class="value" style="color: {{ $isPaid ? '#16a34a' : '#f59e0b' }}">
                    {{ $isPaid ? 'Fully Paid' : ($paidAmount > 0 ? 'Partially Paid' : 'Unpaid') }}
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 40px;">#</th>
                <th>Product Description</th>
                <th class="text-right" style="width: 80px;">Qty</th>
                <th class="text-right" style="width: 120px;">Unit Price</th>
                <th class="text-right" style="width: 140px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="value">{{ $item->product->name }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">Rp{{ number_format($item->price, 0, ',', '.') }}</td>
                    <td class="text-right" class="value">Rp{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-left">
            @if($order->invoice?->notes)
                <div class="label">Notes</div>
                <div style="font-size: 11px; line-height: 1.5; color: #64748b;">
                    {{ $order->invoice->notes }}
                </div>
            @endif
        </div>
        <div class="totals-right">
            <div class="total-row" style="display: table; width: 100%;">
                <div style="display: table-cell;" class="label">Subtotal</div>
                <div style="display: table-cell;" class="text-right value">Rp{{ number_format($order->total_price, 0, ',', '.') }}</div>
            </div>
            <div class="total-row" style="display: table; width: 100%;">
                <div style="display: table-cell;" class="label">Tax (0%)</div>
                <div style="display: table-cell;" class="text-right value">Rp0</div>
            </div>
            <div class="total-row grand-total" style="display: table; width: 100%;">
                <div style="display: table-cell; vertical-align: bottom;" class="label">Total Amount</div>
                <div style="display: table-cell;" class="text-right value">Rp{{ number_format($order->total_price, 0, ',', '.') }}</div>
            </div>
            
            @if($paidAmount > 0)
                <div class="total-row" style="display: table; width: 100%; margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
                    <div style="display: table-cell;" class="label">Amount Paid</div>
                    <div style="display: table-cell;" class="text-right value" style="color: #16a34a;">- Rp{{ number_format($paidAmount, 0, ',', '.') }}</div>
                </div>
                <div class="total-row" style="display: table; width: 100%;">
                    <div style="display: table-cell;" class="label">Balance Due</div>
                    <div style="display: table-cell;" class="text-right value">Rp{{ number_format(max(0, $order->total_price - $paidAmount), 0, ',', '.') }}</div>
                </div>
            @endif
        </div>
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer generated invoice and no signature is required.</p>
        <p>© {{ date('Y') }} TelatenKarya - SIISTK</p>
    </div>
</body>
</html>
