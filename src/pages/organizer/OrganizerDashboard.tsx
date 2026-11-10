
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Receipt,
  Users,
  TicketPercent,
  ArrowUpRight,
  Sparkles,
  Wallet,
} from "lucide-react";

interface DashboardStatistics {
  total_events: number;
  tickets_sold: number;
  total_transactions: number;
  total_attendees: number;
  total_revenue: number;
}

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const userText = sessionStorage.getItem("evently_user");

  let name = "Organizer";

  try {
    if (userText) {
      name = JSON.parse(userText).name || "Organizer";
    }
  } catch {
    // ProtectedRoute menangani data user yang tidak valid.
  }

  const [statistics, setStatistics] = useState<DashboardStatistics>({
    total_events: 0,
    tickets_sold: 0,
    total_transactions: 0,
    total_attendees: 0,
    total_revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mengambil statistik dari backend
  useEffect(() => {
    const fetchDashboardStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("evently_token");

        const response = await fetch(
          "http://localhost:5000/api/organizer/dashboard",
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
            result.message || "Gagal mengambil data dashboard."
          );
        }

        setStatistics(result.data);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStatistics();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const quickMenus = [
    {
      title: "My Events",
      description: "Kelola event yang kamu selenggarakan.",
      icon: CalendarDays,
      path: "/organizer/events",
    },
    {
      title: "Transactions",
      description: "Periksa dan konfirmasi pembayaran.",
      icon: Receipt,
      path: "/organizer/transactions",
    },
    {
      title: "Attendees",
      description: "Lihat daftar peserta event.",
      icon: Users,
      path: "/organizer/attendees",
    },
    {
  title: "Coupons",
  description: "Kelola kode promo dan voucher diskon untuk event.",
  icon: TicketPercent,
  path: "/organizer/vouchers",
},
  ];

  const statisticCards = [
    {
      title: "Total Events",
      value: statistics.total_events,
      icon: CalendarDays,
    },
    {
      title: "Tickets Sold",
      value: statistics.tickets_sold,
      icon: TicketPercent,
    },
    {
      title: "Transactions",
      value: statistics.total_transactions,
      icon: Receipt,
    },
    {
      title: "Total Attendees",
      value: statistics.total_attendees,
      icon: Users,
    },
    {
      title: "Total Revenue",
      value: formatRupiah(statistics.total_revenue),
      icon: Wallet,
    },
  ];

  return (
    <div className="min-h-screen p-5 sm:p-8 lg:p-10">

      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          EVENTLY ORGANIZER
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Overview
        </h1>

        <p className="mt-2 text-slate-500">
          Selamat datang kembali, {name}!
        </p>
      </header>

      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-violet-100">
            <Sparkles size={20} />
            <span className="text-sm font-medium">
              Your Event Management Center
            </span>
          </div>

          <h2 className="text-2xl font-bold sm:text-3xl">
            Manage Your Events with EVENTLY
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-violet-100 sm:text-base">
            Kelola event, pantau transaksi, dan berikan pengalaman
            terbaik bagi peserta melalui satu dashboard.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/10" />
      </section>

      {/* Statistics */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">
          Event Statistics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan aktivitas event yang kamu selenggarakan.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statisticCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon size={22} />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  {item.title}
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {loading ? "Loading..." : item.value.toLocaleString?.("id-ID") ?? item.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Access */}
      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Quick Access
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pilih menu untuk mengelola aktivitas organizer.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickMenus.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Icon size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={20}
                  className="shrink-0 text-slate-400 transition group-hover:text-violet-600"
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
