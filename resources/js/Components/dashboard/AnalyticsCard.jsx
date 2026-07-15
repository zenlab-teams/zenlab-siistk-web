import { useEffect, useState, useRef, useCallback } from "react";
import { TbChartBar, TbChartLine, TbCalendar, TbFilter, TbLoader2 } from "react-icons/tb";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import Select from "react-select";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const formatRp = (val) => `Rp${Number(val ?? 0).toLocaleString("id-ID")}`;
const formatNum = (val) => Number(val ?? 0).toLocaleString("id-ID");

const SummaryCard = ({ label, value, color }) => {
    const colorMap = {
        sky: "bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:border-sky-800/30",
        emerald: "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30",
        orange: "bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/30",
        rose: "bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30",
    };
    const textMap = {
        sky: "text-sky-600 dark:text-sky-400",
        emerald: "text-emerald-600 dark:text-emerald-400",
        orange: "text-orange-600 dark:text-orange-400",
        rose: "text-rose-600 dark:text-rose-400",
    };

    return (
        <div className={`rounded-xl p-4 border ${colorMap[color]}`}>
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">{label}</p>
            <p className={`text-lg font-bold ${textMap[color]}`}>{value}</p>
        </div>
    );
};

const AnalyticsCard = () => {
    const [activeTab, setActiveTab] = useState("sales");
    const [groupBy, setGroupBy] = useState("daily");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const debounceRef = useRef(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        const params = {
            start_date: startDate,
            end_date: endDate,
            group_by: groupBy,
        };
        if (selectedProducts.length > 0) {
            params.product_ids = selectedProducts.map((p) => p.value).join(",");
        }

        axios
            .get(route("admin.dashboard.analytics"), { params })
            .then((res) => {
                setData(res.data);
                if (res.data.products) {
                    setProducts(res.data.products.map((p) => ({ value: p.id, label: p.name })));
                }
            })
            .catch((err) => console.error("Analytics fetch error:", err))
            .finally(() => setLoading(false));
    }, [startDate, endDate, groupBy, selectedProducts]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(fetchData, 300);
        return () => clearTimeout(debounceRef.current);
    }, [fetchData]);

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const chartOptions = (labelY1, labelY2) => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                position: "top",
                labels: { color: isDark ? "#94a3b8" : "#64748b", usePointStyle: true, padding: 20, font: { size: 12 } },
            },
            tooltip: {
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                titleColor: isDark ? "#e2e8f0" : "#1e293b",
                bodyColor: isDark ? "#cbd5e1" : "#475569",
                borderColor: isDark ? "#334155" : "#e2e8f0",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => {
                        const label = ctx.dataset.label || "";
                        const val = ctx.parsed.y;
                        if (label.toLowerCase().includes("pendapatan") || label.toLowerCase().includes("modal") || label.toLowerCase().includes("cost")) {
                            return `${label}: ${formatRp(val)}`;
                        }
                        return `${label}: ${formatNum(val)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: { color: isDark ? "#94a3b8" : "#64748b", font: { size: 11 } },
                grid: { color: isDark ? "#334155" : "#f1f5f9" },
            },
            y: {
                type: "linear",
                display: true,
                position: "left",
                title: { display: true, text: labelY1, color: isDark ? "#94a3b8" : "#64748b", font: { size: 11 } },
                ticks: {
                    color: isDark ? "#94a3b8" : "#64748b",
                    font: { size: 11 },
                    callback: (val) => (labelY1.includes("Rp") ? formatRp(val) : formatNum(val)),
                },
                grid: { color: isDark ? "#334155" : "#f1f5f9" },
            },
            ...(labelY2
                ? {
                      y1: {
                          type: "linear",
                          display: true,
                          position: "right",
                          title: { display: true, text: labelY2, color: isDark ? "#94a3b8" : "#64748b", font: { size: 11 } },
                          ticks: { color: isDark ? "#94a3b8" : "#64748b", font: { size: 11 } },
                          grid: { drawOnChartArea: false },
                      },
                  }
                : {}),
        },
    });

    const salesChartData = data
        ? {
              labels: data.sales.labels,
              datasets: [
                  {
                      label: "Pendapatan",
                      data: data.sales.datasets.revenue,
                      borderColor: "#0ea5e9",
                      backgroundColor: "rgba(14, 165, 233, 0.1)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 3,
                      pointHoverRadius: 6,
                      yAxisID: "y",
                  },
                  {
                      label: "Jumlah Terjual",
                      data: data.sales.datasets.quantity,
                      borderColor: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      fill: false,
                      tension: 0.4,
                      pointRadius: 3,
                      pointHoverRadius: 6,
                      yAxisID: "y1",
                  },
              ],
          }
        : null;

    const stockChartData = data
        ? {
              labels: data.stock.labels,
              datasets: [
                  {
                      label: "Modal Masuk",
                      data: data.stock.datasets.stock_in_cost,
                      backgroundColor: "rgba(14, 165, 233, 0.7)",
                      borderColor: "#0ea5e9",
                      borderWidth: 1,
                      borderRadius: 4,
                  },
              ],
          }
        : null;

    const selectStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderColor: isDark ? "#334155" : "#e2e8f0",
            minHeight: "38px",
            borderRadius: "0.75rem",
            boxShadow: "none",
            "&:hover": { borderColor: isDark ? "#475569" : "#cbd5e1" },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.75rem",
            zIndex: 50,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? (isDark ? "#334155" : "#f1f5f9") : "transparent",
            color: isDark ? "#e2e8f0" : "#1e293b",
            cursor: "pointer",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: isDark ? "#334155" : "#e2e8f0",
            borderRadius: "0.5rem",
        }),
        multiValueLabel: (base) => ({ ...base, color: isDark ? "#e2e8f0" : "#334155", fontSize: "12px" }),
        multiValueRemove: (base) => ({
            ...base,
            color: isDark ? "#94a3b8" : "#64748b",
            borderRadius: "0 0.5rem 0.5rem 0",
            "&:hover": { backgroundColor: isDark ? "#475569" : "#cbd5e1", color: isDark ? "#f1f5f9" : "#1e293b" },
        }),
        placeholder: (base) => ({ ...base, color: isDark ? "#64748b" : "#94a3b8", fontSize: "13px" }),
        input: (base) => ({ ...base, color: isDark ? "#e2e8f0" : "#1e293b" }),
    };

    return (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-5 mb-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("sales")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                activeTab === "sales"
                                    ? "bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-400 shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            <TbChartLine className="text-lg" /> Penjualan
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("stock")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                activeTab === "stock"
                                    ? "bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-400 shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            <TbChartBar className="text-lg" /> Stok & Modal
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                        <TbCalendar className="text-slate-400 dark:text-slate-500" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none border-none w-[130px]"
                        />
                        <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none border-none w-[130px]"
                        />
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        {["daily", "monthly"].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setGroupBy(g)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    groupBy === g
                                        ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                {g === "daily" ? "Harian" : "Bulanan"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product filter */}
            <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                    <TbFilter className="text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Filter Produk</span>
                </div>
                <Select
                    isMulti
                    options={products}
                    value={selectedProducts}
                    onChange={(val) => setSelectedProducts(val ?? [])}
                    placeholder="Semua Produk"
                    noOptionsMessage={() => "Tidak ada produk"}
                    styles={selectStyles}
                    isClearable
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <TbLoader2 className="text-4xl text-sky-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    {activeTab === "sales" && data?.sales?.summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                            <SummaryCard label="Total Pendapatan" value={formatRp(data.sales.summary.total_revenue)} color="sky" />
                            <SummaryCard label="Rata-rata Pendapatan / Periode" value={formatRp(data.sales.summary.avg_revenue)} color="emerald" />
                            <SummaryCard label="Total Qty Terjual" value={formatNum(data.sales.summary.total_quantity)} color="orange" />
                            <SummaryCard label="Avg Qty / Periode" value={formatNum(data.sales.summary.avg_quantity)} color="rose" />
                        </div>
                    )}
                    {activeTab === "stock" && data?.stock?.summary && (
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-5">
                            <SummaryCard label="Total Modal Masuk" value={formatRp(data.stock.summary.total_stock_in_cost)} color="sky" />
                            <SummaryCard label="Total Qty Masuk" value={formatNum(data.stock.summary.total_stock_in_qty)} color="emerald" />
                        </div>
                    )}

                    {/* Chart */}
                    <div className="h-[350px]">
                        {activeTab === "sales" && salesChartData && (
                            <Line data={salesChartData} options={chartOptions("Pendapatan (Rp)", "Jumlah")} />
                        )}
                        {activeTab === "stock" && stockChartData && (
                            <Bar data={stockChartData} options={chartOptions("Modal (Rp)")} />
                        )}
                        {((activeTab === "sales" && (!data?.sales?.labels?.length)) ||
                            (activeTab === "stock" && (!data?.stock?.labels?.length))) && (
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 italic">
                                Tidak ada data untuk periode ini.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsCard;
