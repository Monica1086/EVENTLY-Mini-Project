
import { useEffect, useState } from "react";

type Period = "daily" | "monthly" | "yearly";

interface SalesSummary {
  total_revenue: number;
  tickets_sold: number;
  total_transactions: number;
}

interface SalesChartItem {
  label: string;
  revenue: number;
  tickets: number;
  transactions: number;
}

interface SalesReportData {
  summary: SalesSummary;
  chart: SalesChartItem[];
}

const emptyReport: SalesReportData = {
  summary: {
    total_revenue: 0,
    tickets_sold: 0,
    total_transactions: 0,
  },
  chart: [],
};

export default function OrganizerSalesReport() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [report, setReport] = useState<SalesReportData>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("evently_token");

        const response = await fetch(
          `http://localhost:5000/api/organizer/sales-report?period=${period}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil laporan penjualan."
          );
        }

        setReport({
          summary: result.data.summary,
          chart: result.data.chart || [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil laporan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, [period]);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const maxRevenue = Math.max(
    ...report.chart.map((item) => Number(item.revenue) || 0),
    1
  );

  const periodLabel = {
    daily: "Harian",
    monthly: "Bulanan",
    yearly: "Tahunan",
  };

  return (
    <div className="min-h-screen p-5 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          EVENTLY ORGANIZER
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Sales Report
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Pantau performa penjualan dan pendapatan event kamu.
        </p>
      </div>

      {/* Period Filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-800">
            Ringkasan Penjualan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Laporan berdasarkan periode {periodLabel[period].toLowerCase()}.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["daily", "monthly", "yearly"] as Period[]).map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                period === item
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {periodLabel[item]}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
            💰
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Revenue
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "Loading..." : formatRupiah(report.summary.total_revenue)}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
            🎟️
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">
            Tickets Sold
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {loading
              ? "Loading..."
              : report.summary.tickets_sold.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
            📋
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Transactions
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {loading
              ? "Loading..."
              : report.summary.total_transactions.toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      {/* Sales Chart */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900">
            Revenue Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Grafik pendapatan berdasarkan periode {periodLabel[period].toLowerCase()}.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            Memuat grafik penjualan...
          </div>
        ) : report.chart.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
            Belum ada data penjualan pada periode ini.
          </div>
        ) : (
          <div className="space-y-5">
            {report.chart.map((item, index) => {
              const revenue = Number(item.revenue) || 0;
              const width = (revenue / maxRevenue) * 100;

              return (
                <div key={`${item.label}-${index}`}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(revenue)}
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.tickets} tiket · {item.transactions} transaksi
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
