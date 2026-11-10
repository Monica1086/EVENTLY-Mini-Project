
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gift,
  Copy,
  Check,
  Star,
  Users,
  Ticket,
  ArrowLeft,
  LogOut,
  LoaderCircle,
} from "lucide-react";

interface CouponData {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_purchase: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: number;
  coupon_status: "available" | "used" | "expired" | "inactive" | "upcoming";
}

interface ReferralData {
  name: string;
  referral_code: string;
  points: number;
  coupons: CouponData[];
}

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReferralData() {
      try {
        const token = sessionStorage.getItem("evently_token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/customer/referral",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil data referral."
          );
        }

        setData(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchReferralData();
  }, [navigate]);

  async function handleCopyReferral() {
    if (!data?.referral_code) return;

    try {
      await navigator.clipboard.writeText(data.referral_code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Kode referral gagal disalin. Silakan salin secara manual.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    navigate("/", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="text-2xl font-extrabold text-slate-900">
            EVENT<span className="text-violet-600">LY</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600"
          >
            <ArrowLeft size={16} />
            Kembali ke Home
          </Link>

          <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
            EVENTLY CUSTOMER
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Referral & Points
          </h1>

          <p className="mt-2 text-slate-500">
            Bagikan kode referral dan kumpulkan reward bersama EVENTLY.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
            <LoaderCircle
              size={36}
              className="animate-spin text-violet-600"
            />
            <p className="mt-4 text-sm text-slate-500">
              Memuat data referral...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Data belum dapat dimuat</p>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Customer Content */}
        {!loading && !error && data && (
          <>
            {/* Welcome */}
            <section className="mb-6 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white shadow-lg sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Gift size={26} />
                </span>

                <div>
                  <p className="text-sm text-violet-100">
                    Selamat datang kembali,
                  </p>
                  <h2 className="text-2xl font-bold">
                    {data.name}!
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-2xl leading-7 text-violet-100">
                Ajak temanmu bergabung di EVENTLY menggunakan kode
                referral milikmu dan nikmati berbagai keuntungan.
              </p>
            </section>

            {/* Statistics */}
            <section className="mb-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      My Points
                    </p>
                    <h3 className="mt-3 text-4xl font-extrabold text-violet-700">
                      {Number(data.points).toLocaleString("id-ID")}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Total poin yang tersedia
                    </p>
                  </div>

                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <Star size={28} />
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Referral Program
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      Invite Friends
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Bagikan kode referral kepada temanmu
                    </p>
                  </div>

                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Users size={28} />
                  </span>
                </div>
              </div>
            </section>
{/* My Vouchers */}
<section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <div className="flex items-center gap-3">
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
      <Ticket size={25} />
    </span>

    <div>
      <h2 className="text-xl font-bold text-slate-900">
        My Vouchers
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Kupon diskon khusus milikmu.
      </p>
    </div>
  </div>

  {data.coupons?.length > 0 ? (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {data.coupons.map((coupon) => {
        const statusLabels = {
          available: "Tersedia",
          used: "Sudah digunakan",
          expired: "Kedaluwarsa",
          inactive: "Tidak aktif",
          upcoming: "Belum berlaku",
        };

        const available = coupon.coupon_status === "available";

        return (
          <div
            key={coupon.id}
            className={`rounded-xl border-2 border-dashed p-5 ${
              available
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-600">
                EVENTLY VOUCHER
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  available
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {statusLabels[coupon.coupon_status]}
              </span>
            </div>

            <h3 className="mt-4 text-3xl font-extrabold text-emerald-700">
              {coupon.discount_type === "percentage"
                ? `${Number(coupon.discount_value)}% OFF`
                : `Rp ${Number(coupon.discount_value).toLocaleString("id-ID")}`}
            </h3>

            {coupon.max_discount !== null && (
              <p className="mt-1 text-sm text-slate-600">
                Maksimal potongan Rp{" "}
                {Number(coupon.max_discount).toLocaleString("id-ID")}
              </p>
            )}

            <div className="my-4 border-t border-dashed border-slate-300" />

            <p className="break-all text-lg font-extrabold tracking-wide text-slate-800">
              {coupon.code}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Maksimal penggunaan: {coupon.usage_limit ?? "Tidak terbatas"} kali
            </p>

            {coupon.ends_at && (
              <p className="mt-1 text-xs text-slate-500">
                Berlaku sampai:{" "}
                {new Date(coupon.ends_at).toLocaleDateString("id-ID")}
              </p>
            )}

            {available && (
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                Gunakan kode ini saat membeli tiket.
              </p>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
      <Ticket size={32} className="mx-auto text-slate-400" />
      <p className="mt-3 font-semibold text-slate-700">
        Belum ada voucher
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Voucher yang kamu dapatkan akan muncul di sini.
      </p>
    </div>
  )}
</section>

            {/* Referral Code */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Ticket size={25} />
                </span>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Your Referral Code
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Bagikan kode unik ini kepada temanmu.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all text-2xl font-extrabold tracking-widest text-violet-700">
                  {data.referral_code || "Belum tersedia"}
                </p>

                <button
                  onClick={handleCopyReferral}
                  disabled={!data.referral_code}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Tersalin!" : "Salin Kode"}
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Temanmu dapat memasukkan kode ini ketika mendaftar
                sebagai Customer baru di EVENTLY.
              </p>
            </section>

            {/* Reward Information */}
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <Gift
                  size={24}
                  className="mt-1 shrink-0 text-amber-600"
                />

                <div>
                  <h3 className="font-bold text-slate-900">
                    Referral Rewards
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Bagikan kode referral kepada teman. Program referral
                    EVENTLY memberikan reward kepada pengguna sesuai
                    ketentuan yang berlaku.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Access */}
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Quick Access
              </h2>

<Link
  to="/customer/my-tickets"
  className="mb-4 flex items-center justify-between rounded-2xl border border-violet-200 bg-white p-5 shadow-sm transition hover:border-violet-400 hover:shadow-md"
>
  <div className="flex items-center gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
      <Ticket size={24} />
    </div>

    <div>
      <h3 className="font-bold text-slate-900">
        My Tickets
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Lihat tiket event dan QR Code milikmu.
      </p>
    </div>
  </div>

  <ArrowLeft
    size={20}
    className="rotate-180 text-violet-600"
  />
</Link>

              <Link
                to="/customer/transactions"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md"
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    My Transactions
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Lihat riwayat pembelian tiketmu.
                  </p>
                </div>

                <ArrowLeft
                  size={20}
                  className="rotate-180 text-violet-600"
                />
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
