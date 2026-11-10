
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
  event_type: "free" | "paid";
  ticket_price: number;
  total_seats: number;
  available_seats: number;
  status: string;
    image_url?: string | null;
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
interface PublicCoupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_purchase: number;
  ends_at: string | null;
}
const API_URL = "http://localhost:5000";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);
const [couponsLoading, setCouponsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const isFreeEvent =
  event?.event_type === "free" ||
  Number(event?.ticket_price) === 0;
  const [buying, setBuying] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  // Saldo dan jumlah poin yang ingin ditukarkan
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsInput, setPointsInput] = useState("");
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState("");

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

  const totalAfterCoupon = Math.max(0, subtotal - discountAmount);

  const requestedPoints = pointsInput.trim() === "" ? 0 : Number(pointsInput);
  const maxRedeemablePoints =
    Math.floor(Math.min(pointsBalance, totalAfterCoupon) / 1000) * 1000;

  const pointsAreValid =
    pointsInput.trim() === "" ||
    (Number.isInteger(requestedPoints) &&
      requestedPoints >= 1000 &&
      requestedPoints % 1000 === 0 &&
      requestedPoints <= pointsBalance &&
      requestedPoints <= totalAfterCoupon);

  const pointsDiscount =
    pointsAreValid && requestedPoints > 0 ? requestedPoints : 0;

  const totalPrice = Math.max(0, totalAfterCoupon - pointsDiscount);

  // Ambil saldo poin dari akun Customer yang sedang login.
  useEffect(() => {
    let cancelled = false;

    async function fetchPointsBalance() {
      const token = sessionStorage.getItem("evently_token");
      const userText = sessionStorage.getItem("evently_user");

      if (!token || !userText) return;

      try {
        const user = JSON.parse(userText);
        if (user.role !== "customer") return;

        setPointsLoading(true);
        const response = await fetch(`${API_URL}/api/customer/referral`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil saldo poin.");
        }

        if (!cancelled) {
          setPointsBalance(Math.max(0, Number(result.data?.points) || 0));
        }
      } catch (err) {
        if (!cancelled) {
          setPointsError(
            err instanceof Error ? err.message : "Gagal mengambil saldo poin."
          );
        }
      } finally {
        if (!cancelled) setPointsLoading(false);
      }
    }

    void fetchPointsBalance();
    return () => {
      cancelled = true;
    };
  }, []);

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
// Mengambil kupon aktif khusus untuk event ini.
useEffect(() => {
  let cancelled = false;

  async function fetchEventCoupons() {
    if (!id) return;

    try {
      setCouponsLoading(true);

      const response = await fetch(
        `${API_URL}/api/events/${id}/coupons`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil kupon.");
      }

      if (!cancelled) {
        setAvailableCoupons(
          Array.isArray(result.data) ? result.data : []
        );
      }
    } catch (err) {
      console.error("Gagal mengambil kupon event:", err);

      if (!cancelled) {
        setAvailableCoupons([]);
      }
    } finally {
      if (!cancelled) {
        setCouponsLoading(false);
      }
    }
  }

  void fetchEventCoupons();

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
    setPointsError("");
    setPurchaseError("");
  }

  function handlePointsChange(value: string) {
    // Hanya izinkan angka bulat pada kolom poin.
    if (!/^\d*$/.test(value)) return;
    setPointsInput(value);
    setPointsError("");
    setPurchaseError("");
  }

  function handleUseMaximumPoints() {
    setPointsInput(maxRedeemablePoints > 0 ? String(maxRedeemablePoints) : "");
    setPointsError("");
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

    if (!isFreeEvent && !pointsAreValid) {
  setPurchaseError(
    "Penukaran poin minimal 1.000 dan harus dalam kelipatan 1.000. Jumlahnya juga tidak boleh melebihi saldo atau total tagihan."
  );
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
  coupon_code: isFreeEvent ? null : coupon ? coupon.code : null,
  points_to_use: isFreeEvent ? 0 : pointsDiscount,
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
          message: isFreeEvent
  ? "Registrasi event gratis berhasil! Tiket elektronik kamu sedang diproses."
  : "Pesanan berhasil dibuat. Silakan selesaikan pembayaran dan unggah bukti pembayaran sebelum batas waktu.",
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

  {event.image_url ? (
    <img
      src={`${API_URL}${event.image_url}`}
      alt={event.title}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : (
    <>
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-300/60 blur-3xl" />

      <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-indigo-300/60 blur-3xl" />

      <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-lg">
        <Ticket size={36} />
      </span>
    </>
  )}

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
{/* AVAILABLE ORGANIZER COUPONS */}
{!isFreeEvent && (couponsLoading || availableCoupons.length > 0) && (
  <div className="mt-6 border-t border-slate-200 pt-5">
    <div className="mb-3 flex items-center gap-2">
      <Tag size={18} className="text-green-600" />
      <h3 className="font-bold text-slate-900">
        Promo Khusus Event Ini
      </h3>
    </div>

    {couponsLoading ? (
      <p className="text-sm text-slate-500">
        Memuat kupon...
      </p>
    ) : (
      <div className="space-y-3">
        {availableCoupons.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-dashed border-green-400 bg-green-50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-green-700">
                KUPON ORGANIZER
              </span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                Tersedia
              </span>
            </div>

            <p className="mt-2 text-xl font-extrabold text-green-700">
              {item.discount_type === "percentage"
                ? `${Number(item.discount_value)}% OFF`
                : `POTONGAN ${formatPrice(Number(item.discount_value))}`}
            </p>

            {item.max_discount !== null && (
              <p className="text-xs text-slate-600">
                Maksimal potongan {formatPrice(Number(item.max_discount))}
              </p>
            )}

            <div className="my-3 border-t border-dashed border-green-200" />

            <p className="font-extrabold tracking-wide text-slate-900">
              {item.code}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Minimum pembelian {formatPrice(Number(item.min_purchase))}
            </p>

            {item.ends_at && (
              <p className="mt-1 text-xs text-slate-600">
                Berlaku sampai{" "}
                {new Date(item.ends_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setCouponInput(item.code);
                setCoupon(null);
                setCouponMessage("");
                setCouponError("");
              }}
              disabled={buying || couponLoading}
              className="mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              Pakai Kupon
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}
{!isFreeEvent && (
   <>
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

                    {/* REDEEM POINTS */}
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="redeem-points"
                          className="block text-sm font-semibold text-slate-800"
                        >
                          Tukarkan Poin
                        </label>
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                          {pointsLoading
                            ? "Memuat saldo..."
                            : `${pointsBalance.toLocaleString("id-ID")} poin`}
                        </span>
                      </div>

                      {pointsBalance >= 1000 ? (
                        <>
                          <div className="mt-3 flex gap-2">
                            <input
                              id="redeem-points"
                              type="number"
                              min={1000}
                              max={maxRedeemablePoints}
                              step={1000}
                              inputMode="numeric"
                              value={pointsInput}
                              onChange={(e) => handlePointsChange(e.target.value)}
                              disabled={buying || pointsLoading}
                              placeholder="Minimal 1.000 poin"
                              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                            />
                            <button
                              type="button"
                              onClick={handleUseMaximumPoints}
                              disabled={
                                buying ||
                                pointsLoading ||
                                maxRedeemablePoints < 1000
                              }
                              className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-3 text-sm font-bold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Maksimal
                            </button>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            1 poin = Rp1. Minimal 1.000 poin dan harus kelipatan
                            1.000. Maksimal yang dapat digunakan saat ini:{" "}
                            {maxRedeemablePoints.toLocaleString("id-ID")} poin.
                          </p>
                          {pointsInput.trim() !== "" && !pointsAreValid && (
                            <p role="alert" className="mt-2 text-xs text-red-600">
                              Jumlah poin harus minimal 1.000, kelipatan 1.000,
                              serta tidak melebihi saldo dan total tagihan.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {pointsLoading
                            ? "Sedang mengambil saldo poin kamu..."
                            : "Saldo poin belum mencukupi. Kamu membutuhkan minimal 1.000 poin untuk menukarkannya."}
                        </p>
                      )}

                      {pointsError && (
                        <p role="alert" className="mt-2 text-xs text-red-600">
                          {pointsError}
                        </p>
                      )}
                    </div>
                      </>
)}
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

                      {pointsDiscount > 0 && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-green-700">
                            Potongan Poin ({pointsDiscount.toLocaleString("id-ID")} poin)
                          </span>
                          <span className="font-semibold text-green-700">
                            - {formatPrice(pointsDiscount)}
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
                      disabled={
  buying ||
  (!isFreeEvent && (couponLoading || pointsLoading || !pointsAreValid))
}
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
                        :  isFreeEvent ? "Daftar" : "Beli Tiket"}
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
