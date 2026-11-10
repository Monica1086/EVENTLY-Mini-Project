

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Transaction {
  transaction_id: number;
  booking_code: string;
  ticket_quantity: number;
  ticket_price: string;
  total_amount: string;
  payment_proof: string | null;
  status: string;
  payment_deadline: string | null;
  created_at: string;
  event_id: number;
  event_title: string;
  customer_name: string;
  customer_email: string;
}

interface TransactionsResponse {
  message: string;
  total: number;
  transactions: Transaction[];
}

const API_URL = "http://localhost:5000";

function formatRupiah(amount: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const userText = sessionStorage.getItem("evently_user");

  let name = "Organizer";

  try {
    if (userText) {
      name = JSON.parse(userText).name || "Organizer";
    }
  } catch {
    // ProtectedRoute akan menangani data user yang tidak valid.
  }

  async function loadTransactions() {
    const token = sessionStorage.getItem("evently_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/organizer/transactions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        setError(data.message || "Akses ditolak. Silakan login kembali.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil transaksi.");
      }

      const result = data as TransactionsResponse;
      setTransactions(result.transactions || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  async function handleDecision(
    transaction: Transaction,
    decision: "accept" | "reject"
  ) {
    const actionText = decision === "accept" ? "menerima" : "menolak";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${actionText} transaksi ${transaction.booking_code}?`
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("evently_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setProcessingId(transaction.transaction_id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/organizer/transactions/${transaction.transaction_id}/${decision}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses transaksi.");
      }

      setNotice(data.message || "Transaksi berhasil diproses.");

      // Muat ulang daftar dari database agar status selalu terbaru.
      await loadTransactions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses transaksi."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-wider text-violet-600">
              EVENTLY ORGANIZER
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Dashboard Organizer
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Kelola transaksi dan konfirmasi pembayaran event kamu.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Selamat datang, {name}!
          </h2>
          <p className="mt-2 text-slate-600">
            Berikut transaksi yang membutuhkan konfirmasi pembayaran.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Transaksi Menunggu Konfirmasi
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Total transaksi: {transactions.length}
              </p>
            </div>

            <button
              onClick={() => void loadTransactions()}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {notice && (
            <div
              role="status"
              className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800"
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Memuat data transaksi...
            </p>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-semibold text-slate-700">
                Belum ada transaksi yang menunggu konfirmasi.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Transaksi baru akan muncul setelah customer mengirim bukti pembayaran.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {transactions.map((transaction) => (
                <article
                  key={transaction.transaction_id}
                  className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {transaction.event_title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Booking: {transaction.booking_code}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Menunggu konfirmasi
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Customer
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {transaction.customer_name}
                      </p>
                      <p className="break-all text-sm text-slate-500">
                        {transaction.customer_email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Jumlah Tiket
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {transaction.ticket_quantity} tiket
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatRupiah(transaction.ticket_price)} per tiket
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Total Pembayaran
                      </p>
                      <p className="mt-1 text-lg font-bold text-violet-700">
                        {formatRupiah(transaction.total_amount)}
                      </p>
                    </div>

                    
<div>
  <p className="text-xs font-medium uppercase text-slate-500">
    Bukti Pembayaran
  </p>

  {transaction.payment_proof ? (
    <div className="mt-2">
      <a
        href={`${API_URL}${transaction.payment_proof}`}
        target="_blank"
        rel="noreferrer"
        className="inline-block"
      >
        <img
          src={`${API_URL}${transaction.payment_proof}`}
          alt={`Bukti pembayaran ${transaction.booking_code}`}
          className="h-48 w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 object-contain"
        />
      </a>

      <a
        href={`${API_URL}${transaction.payment_proof}`}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-sm font-semibold text-violet-700 underline hover:text-violet-900"
      >
        Buka gambar ukuran penuh
      </a>
    </div>
  ) : (
    <p className="mt-1 text-sm text-slate-500">
      Bukti pembayaran belum tersedia.
    </p>
  )}
</div>


                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Waktu Pemesanan
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Batas Pembayaran
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {formatDate(transaction.payment_deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() =>
                        void handleDecision(transaction, "accept")
                      }
                      disabled={processingId !== null}
                      className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingId === transaction.transaction_id
                        ? "Memproses..."
                        : "Terima Pembayaran"}
                    </button>

                    <button
                      onClick={() =>
                        void handleDecision(transaction, "reject")
                      }
                      disabled={processingId !== null}
                      className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingId === transaction.transaction_id
                        ? "Memproses..."
                        : "Tolak Pembayaran"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
