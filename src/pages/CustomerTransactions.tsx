
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Transaction {
  transaction_id: number;
  booking_code: string;
  event_id: number;
  event_title: string;
  event_location: string | null;
  event_date: string | null;
  ticket_quantity: number;
  ticket_price: string;
  total_amount: string;
  payment_proof: string | null;
  status: string;
  payment_deadline: string | null;
  confirmation_deadline: string | null;
  created_at: string;
}

interface TransactionResponse {
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

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    waiting_payment: "Menunggu Pembayaran",
    waiting_confirmation: "Menunggu Konfirmasi",
    done: "Selesai",
    rejected: "Ditolak",
    expired: "Kedaluwarsa",
    cancelled: "Dibatalkan",
  };

  return labels[status] || status;
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    waiting_payment: "bg-amber-100 text-amber-800",
    waiting_confirmation: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-slate-200 text-slate-700",
    cancelled: "bg-slate-200 text-slate-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

export default function CustomerTransactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    Record<number, File | null>
  >({});

  async function loadTransactions() {
    const token = sessionStorage.getItem("evently_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/customer/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        setError(data.message || "Akses ditolak. Periksa akun kamu.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil riwayat transaksi."
        );
      }

      const result = data as TransactionResponse;
      setTransactions(result.transactions || []);
      setError("");
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
  }, [navigate]);

  async function handleUpload(transactionId: number) {
    const file = selectedFiles[transactionId];
    const token = sessionStorage.getItem("evently_token");

    setUploadMessage("");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!file) {
      setUploadMessage("Pilih gambar bukti pembayaran terlebih dahulu.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setUploadMessage("Format file harus JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadMessage("Ukuran gambar maksimal 2 MB.");
      return;
    }

    try {
      setUploadingId(transactionId);

      const formData = new FormData();
      formData.append("payment_proof", file);

      const response = await fetch(
        `${API_URL}/api/transactions/${transactionId}/payment-proof`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengunggah bukti pembayaran."
        );
      }

      setUploadMessage("Bukti pembayaran berhasil dikirim!");
      setSelectedFiles((previous) => ({
        ...previous,
        [transactionId]: null,
      }));

      await loadTransactions();
    } catch (err) {
      setUploadMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunggah bukti pembayaran."
      );
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/")}
          className="mb-6 font-semibold text-violet-700 hover:text-violet-900"
        >
          ← Kembali ke Beranda
        </button>

        <header>
          <p className="text-sm font-bold tracking-wider text-violet-600">
            EVENTLY CUSTOMER
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Riwayat Transaksi
          </h1>
          <p className="mt-2 text-slate-600">
            Lihat pembelian tiket dan status pembayaran kamu.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {uploadMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl bg-violet-50 p-4 text-violet-800"
          >
            {uploadMessage}
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-slate-500">
            Memuat riwayat transaksi...
          </p>
        ) : transactions.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-slate-800">
              Belum ada transaksi
            </h2>
            <p className="mt-2 text-slate-500">
              Transaksi pembelian tiket kamu akan muncul di halaman ini.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
            >
              Jelajahi Event
            </button>
          </section>
        ) : (
          <section className="mt-8 space-y-5">
            {transactions.map((transaction) => (
              <article
                key={transaction.transaction_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {transaction.event_title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Kode booking: {transaction.booking_code}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                      transaction.status
                    )}`}
                  >
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Lokasi</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {transaction.event_location || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Tanggal Event</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatDate(transaction.event_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Jumlah Tiket</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {transaction.ticket_quantity} tiket
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Harga per Tiket</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatRupiah(transaction.ticket_price)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total Pembayaran
                    </p>
                    <p className="mt-1 text-xl font-bold text-violet-700">
                      {formatRupiah(transaction.total_amount)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">
                      Tanggal Pemesanan
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>

                {transaction.status === "waiting_payment" && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Segera selesaikan pembayaran sebelum batas waktu{" "}
                      <strong>
                        {formatDate(transaction.payment_deadline)}
                      </strong>
                      .
                    </p>

                    <div className="mt-4">
                      <label
                        htmlFor={`payment-proof-${transaction.transaction_id}`}
                        className="block text-sm font-semibold text-slate-800"
                      >
                        Upload Bukti Pembayaran
                      </label>

                      <input
                        id={`payment-proof-${transaction.transaction_id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;

                          setSelectedFiles((previous) => ({
                            ...previous,
                            [transaction.transaction_id]: file,
                          }));

                          setUploadMessage("");
                        }}
                        className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-semibold file:text-violet-700"
                      />

                      <p className="mt-1 text-xs text-slate-500">
                        Format JPG, PNG, atau WEBP. Maksimal 2 MB.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          void handleUpload(transaction.transaction_id)
                        }
                        disabled={
                          uploadingId === transaction.transaction_id
                        }
                        className="mt-3 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingId === transaction.transaction_id
                          ? "Mengunggah..."
                          : "Kirim Bukti Pembayaran"}
                      </button>
                    </div>
                  </div>
                )}

                {transaction.status === "waiting_confirmation" && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    <p>
                      Bukti pembayaran sudah dikirim. Silakan tunggu konfirmasi
                      Organizer.
                    </p>

                    {transaction.payment_proof && (
                      <a
                        href={`${API_URL}${transaction.payment_proof}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-semibold underline"
                      >
                        Lihat Bukti Pembayaran
                      </a>
                    )}

                    {transaction.confirmation_deadline && (
                      <p className="mt-2">
                        Batas konfirmasi:{" "}
                        {formatDate(transaction.confirmation_deadline)}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
