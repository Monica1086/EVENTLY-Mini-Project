
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Ticket,
  Clock,
  Minus,
  Plus,
  Tag,
  CheckCircle,
  XCircle,
  LoaderCircle,
} from "lucide-react";

interface EventItem {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  end_date: string | null;
  ticket_price: number;
  total_seats: number;
  available_seats: number;
  status: string;
}

interface CouponValidation {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_purchase: number;
  discount_amount: number;
  subtotal: number;
  total_amount: number;
}

const API_URL = "http://localhost:5000";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

  const formatPrice = (price: number) =>
    Number(price) === 0
      ? "Gratis"
      : `Rp ${Number(price).toLocaleString("id-ID")}`;

  const subtotal = event
    ? Number(event.ticket_price) * quantity
    : 0;

  // Perhitungan ini hanya untuk pratinjau tampilan.
  // Backend tetap menghitung ulang diskon saat transaksi dibuat.
  const discountAmount = coupon
    ? Math.min(subtotal, Number(coupon.discount_amount))
    : 0;

  const totalPrice = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvent() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/events/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil detail event."
          );
        }

        if (!cancelled) {
          setEvent(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Perubahan jumlah tiket membatalkan pratinjau kupon lama.
  function handleQuantityChange(nextQuantity: number) {
    setQuantity(nextQuantity);
    setCoupon(null);
    setCouponMessage("");
    setCouponError("");
    setPurchaseError("");
  }

  async function handleApplyCoupon() {
    setCoupon(null);
    setCouponMessage("");
    setCouponError("");
    setPurchaseError("");

    const normalizedCode = couponInput.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Masukkan kode kupon terlebih dahulu.");
      return;
    }

    if (!event) {
      setCouponError("Detail event belum tersedia.");
      return;
    }

    const token = sessionStorage.getItem("evently_token");
    const userText = sessionStorage.getItem("evently_user");

    if (!token || !userText) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userText);

      if (user.role !== "customer") {
        setCouponError(
          "Kupon hanya dapat digunakan oleh akun Customer."
        );
        return;
      }
    } catch {
      navigate("/login");
      return;
    }

    try {
      setCouponLoading(true);

      const response = await fetch(`${API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          ticket_quantity: quantity,
          coupon_code: normalizedCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Kupon tidak dapat digunakan."
        );
      }

      // Mendukung respons API berbentuk { data: {...} }.
      const validatedCoupon = result.data;

      if (
        !validatedCoupon ||
        typeof validatedCoupon.code !== "string" ||
        !Number.isFinite(Number(validatedCoupon.discount_amount)) ||
        Number(validatedCoupon.discount_amount) < 0
      ) {
        throw new Error(
          "Format respons validasi kupon tidak sesuai."
        );
      }

      setCoupon({
        ...validatedCoupon,
        discount_amount: Number(validatedCoupon.discount_amount),
        subtotal: Number(validatedCoupon.subtotal),
        total_amount: Number(validatedCoupon.total_amount),
      });

      setCouponInput(validatedCoupon.code);
      setCouponMessage(
        `Kupon ${validatedCoupon.code} berhasil diterapkan.`
      );
    } catch (err) {
      setCoupon(null);
      setCouponError(
        err instanceof Error
          ? err.message
          : "Tidak dapat memvalidasi kupon."
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponMessage("");
    setCouponError("");
    setPurchaseError("");
  }

  async function handleBuyTicket() {
    setPurchaseError("");

    const token = sessionStorage.getItem("evently_token");
    const userText = sessionStorage.getItem("evently_user");

    if (!token || !userText) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userText);

      if (user.role !== "customer") {
        setPurchaseError(
          "Pembelian tiket hanya dapat dilakukan menggunakan akun Customer."
        );
        return;
      }
    } catch {
      navigate("/login");
      return;
    }

    if (
      !event ||
      quantity < 1 ||
      quantity > event.available_seats
    ) {
      setPurchaseError("Jumlah tiket tidak tersedia.");
      return;
    }

    try {
      setBuying(true);

      const response = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          ticket_quantity: quantity,
          coupon_code: coupon ? coupon.code : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal membuat pesanan tiket."
        );
      }

      // Endpoint transaksi mengembalikan data di result.data.
      navigate("/customer/transactions", {
        state: {
          newBookingCode: result.data?.booking_code,
          message:
            "Pesanan berhasil dibuat. Silakan selesaikan pembayaran dan unggah bukti pembayaran sebelum batas waktu.",
        },
      });
    } catch (err) {
      setPurchaseError(
        err instanceof Error
          ? err.message
          : "Tidak dapat terhubung ke server."
      );
    } finally {
      setBuying(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
        >
          <ArrowLeft size={18} />
          Kembali ke daftar event
        </Link>

        {loading && (
          <p className="mt-10 text-slate-500">
            Memuat detail event...
          </p>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && event && (
          <article className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-200 via-indigo-100 to-purple-100 sm:min-h-72">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-300/60 blur-3xl" />
              <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-indigo-300/60 blur-3xl" />

              <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-lg">
                <Ticket size={36} />
              </span>

              <span className="absolute left-6 top-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
                {event.category}
              </span>
            </div>

            <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_300px]">
              <section>
                <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                  Event details
                </p>

                <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
                  {event.title}
                </h1>

                <div className="mt-7 space-y-5">
                  <div className="flex items-start gap-4">
                    <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
                      <CalendarDays size={22} />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Tanggal dan waktu
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {formatDate(event.event_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
                      <MapPin size={22} />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Lokasi
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {event.end_date && (
                    <div className="flex items-start gap-4">
                      <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
                        <Clock size={22} />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Acara berakhir
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(event.end_date)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 border-t border-slate-100 pt-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Tentang acara ini
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">
                    {event.description}
                  </p>
                </div>
              </section>

              <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Harga tiket per orang
                </p>
                <p className="mt-2 text-2xl font-extrabold text-violet-700">
                  {formatPrice(Number(event.ticket_price))}
                </p>

                <div className="my-5 border-t border-slate-200" />

                <p className="text-sm text-slate-500">
                  Tiket tersedia
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {event.available_seats} dari {event.total_seats}
                </p>

                {event.available_seats > 0 ? (
                  <>
                    <div className="mt-6">
                      <label
                        htmlFor="ticket-quantity"
                        className="block text-sm font-semibold text-slate-800"
                      >
                        Jumlah tiket
                      </label>

                      <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              Math.max(1, quantity - 1)
                            )
                          }
                          disabled={quantity <= 1 || buying}
                          aria-label="Kurangi jumlah tiket"
                          className="rounded-lg p-2 text-violet-700 hover:bg-violet-50 disabled:opacity-30"
                        >
                          <Minus size={18} />
                        </button>

                        <span
                          id="ticket-quantity"
                          className="font-bold text-slate-900"
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              Math.min(
                                event.available_seats,
                                quantity + 1
                              )
                            )
                          }
                          disabled={
                            quantity >= event.available_seats ||
                            buying
                          }
                          aria-label="Tambah jumlah tiket"
                          className="rounded-lg p-2 text-violet-700 hover:bg-violet-50 disabled:opacity-30"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {/* COUPON CODE */}
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <label
                        htmlFor="coupon-code"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                      >
                        <Tag size={17} className="text-violet-600" />
                        Coupon Code
                      </label>

                      <div className="mt-2 flex gap-2">
                        <input
                          id="coupon-code"
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(
                              e.target.value.toUpperCase()
                            );
                            setCoupon(null);
                            setCouponMessage("");
                            setCouponError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleApplyCoupon();
                            }
                          }}
                          placeholder="Contoh: HEMAT10"
                          maxLength={50}
                          disabled={couponLoading || buying}
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                        />

                        <button
                          type="button"
                          onClick={() => void handleApplyCoupon()}
                          disabled={
                            couponLoading ||
                            buying ||
                            !couponInput.trim()
                          }
                          className="rounded-xl bg-violet-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {couponLoading ? (
                            <LoaderCircle
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            "Gunakan"
                          )}
                        </button>
                      </div>

                      {couponMessage && coupon && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                          <CheckCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                          />
                          <div>
                            <p className="font-semibold">
                              {couponMessage}
                            </p>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              disabled={buying}
                              className="mt-1 underline underline-offset-2"
                            >
                              Hapus kupon
                            </button>
                          </div>
                        </div>
                      )}

                      {couponError && (
                        <div
                          role="alert"
                          className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                        >
                          <XCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                          />
                          <span>{couponError}</span>
                        </div>
                      )}

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Masukkan kupon yang masih berlaku dan memenuhi
                        syarat minimum pembelian.
                      </p>
                    </div>

                    {/* PRICE SUMMARY */}
                    <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-slate-500">
                          Subtotal ({quantity} tiket)
                        </span>
                        <span className="font-medium text-slate-800">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      {coupon && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-green-700">
                            Diskon ({coupon.code})
                          </span>
                          <span className="font-semibold text-green-700">
                            - {formatPrice(discountAmount)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
                        <span className="font-semibold text-slate-800">
                          Total pembayaran
                        </span>
                        <span className="text-right text-xl font-extrabold text-violet-700">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>

                    {purchaseError && (
                      <p
                        role="alert"
                        className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                      >
                        {purchaseError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleBuyTicket()}
                      disabled={buying || couponLoading}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {buying && (
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                      )}
                      {buying
                        ? "Memproses Pesanan..."
                        : "Beli Tiket"}
                    </button>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Login menggunakan akun Customer untuk
                      melanjutkan pembelian. Harga akhir akan
                      dihitung kembali oleh server.
                    </p>
                  </>
                ) : (
                  <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                    Maaf, tiket event ini sudah habis.
                  </p>
                )}
              </aside>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
