
import { useEffect, useState, type FormEvent } from "react";

const API = "http://localhost:5000";

type EventItem = {
  id: number;
  title: string;
};

type Voucher = {
  id: number;
  event_id: number;
  event_title?: string;
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
};

const emptyForm = {
  event_id: "",
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  max_discount: "",
  min_purchase: "0",
  usage_limit: "",
  starts_at: "",
  ends_at: "",
};

export default function OrganizerVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("evently_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [voucherRes, eventRes] = await Promise.all([
        fetch(`${API}/api/organizer/coupons`, {
          headers,
        }),
        fetch(`${API}/api/organizer/events`, {
          headers,
        }),
      ]);

      const voucherJson = await voucherRes.json();
      const eventJson = await eventRes.json();

      if (!voucherRes.ok) {
        throw new Error(voucherJson.message || "Gagal mengambil voucher.");
      }

      if (!eventRes.ok) {
        throw new Error(eventJson.message || "Gagal mengambil event.");
      }

      setVouchers(voucherJson.data || []);
      setEvents(eventJson.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function editVoucher(voucher: Voucher) {
    const toLocalInput = (value: string | null) => {
      if (!value) return "";
      const date = new Date(value);
      const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      return local.toISOString().slice(0, 16);
    };

    setForm({
      event_id: String(voucher.event_id),
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: String(voucher.discount_value),
      max_discount: voucher.max_discount == null
        ? ""
        : String(voucher.max_discount),
      min_purchase: String(voucher.min_purchase),
      usage_limit: voucher.usage_limit == null
        ? ""
        : String(voucher.usage_limit),
      starts_at: toLocalInput(voucher.starts_at),
      ends_at: toLocalInput(voucher.ends_at),
    });

    setEditingId(voucher.id);
    setShowForm(true);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitVoucher(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.event_id) {
      setError("Silakan pilih event.");
      return;
    }

    if (form.starts_at && form.ends_at &&
        new Date(form.ends_at) <= new Date(form.starts_at)) {
      setError("Tanggal berakhir harus setelah tanggal mulai.");
      return;
    }

    const payload = {
      event_id: Number(form.event_id),
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_discount: form.max_discount
        ? Number(form.max_discount)
        : null,
      min_purchase: Number(form.min_purchase || 0),
      usage_limit: form.usage_limit
        ? Number(form.usage_limit)
        : null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };

    try {
      setLoading(true);

      const url = editingId
        ? `${API}/api/organizer/coupons/${editingId}`
        : `${API}/api/organizer/coupons`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan voucher.");
      }

      setMessage(result.message || "Voucher berhasil disimpan.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(voucher: Voucher) {
    const nextStatus = Number(voucher.is_active) === 1 ? 0 : 1;

    const confirmed = window.confirm(
      `Yakin ingin ${nextStatus ? "mengaktifkan" : "menonaktifkan"} voucher ${voucher.code}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/organizer/coupons/${voucher.id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ is_active: nextStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status.");
      }

      setMessage(result.message || "Status voucher diperbarui.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteVoucher(voucher: Voucher) {
    const confirmed = window.confirm(
      `Hapus/nonaktifkan voucher ${voucher.code}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/organizer/coupons/${voucher.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus voucher.");
      }

      setMessage(result.message || "Voucher berhasil dinonaktifkan.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Organizer Voucher
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Buat dan kelola voucher diskon untuk event Anda.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          + Buat Voucher
        </button>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submitVoucher}
          className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {editingId ? "Edit Voucher" : "Buat Voucher Baru"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Pilih Event</span>
              <select
                required
                value={form.event_id}
                onChange={(e) =>
                  setForm({ ...form, event_id: e.target.value })
                }
                className="w-full rounded-lg border p-3"
              >
                <option value="">-- Pilih Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Kode Voucher</span>
              <input
                required
                maxLength={50}
                value={form.code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value.toUpperCase().replace(/\s/g, ""),
                  })
                }
                placeholder="Contoh: EVENTHEMAT20"
                className="w-full rounded-lg border p-3 uppercase"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Jenis Diskon</span>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_type: e.target.value as "percentage" | "fixed",
                  })
                }
                className="w-full rounded-lg border p-3"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Nilai Diskon {form.discount_type === "percentage" ? "(%)" : "(Rp)"}
              </span>
              <input
                required
                type="number"
                min="1"
                max={form.discount_type === "percentage" ? 100 : undefined}
                value={form.discount_value}
                onChange={(e) =>
                  setForm({ ...form, discount_value: e.target.value })
                }
                className="w-full rounded-lg border p-3"
              />
            </label>

            {form.discount_type === "percentage" && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Maksimal Diskon (Rp)
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.max_discount}
                  onChange={(e) =>
                    setForm({ ...form, max_discount: e.target.value })
                  }
                  placeholder="Kosongkan jika tidak dibatasi"
                  className="w-full rounded-lg border p-3"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Minimum Pembelian (Rp)
              </span>
              <input
                type="number"
                min="0"
                value={form.min_purchase}
                onChange={(e) =>
                  setForm({ ...form, min_purchase: e.target.value })
                }
                className="w-full rounded-lg border p-3"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Batas Penggunaan
              </span>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) =>
                  setForm({ ...form, usage_limit: e.target.value })
                }
                placeholder="Kosongkan jika tanpa batas"
                className="w-full rounded-lg border p-3"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Mulai Berlaku
              </span>
              <input
                required
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({ ...form, starts_at: e.target.value })
                }
                className="w-full rounded-lg border p-3"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Berakhir
              </span>
              <input
                required
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) =>
                  setForm({ ...form, ends_at: e.target.value })
                }
                className="w-full rounded-lg border p-3"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Voucher"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-6 py-3"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-bold text-gray-800">Daftar Voucher Saya</h2>
          <p className="text-sm text-gray-500">
            Total {vouchers.length} voucher
          </p>
        </div>

        {loading && vouchers.length === 0 ? (
          <p className="p-6 text-gray-500">Memuat data...</p>
        ) : vouchers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Belum ada voucher. Klik "Buat Voucher" untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">Kode</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Diskon</th>
                  <th className="p-4">Penggunaan</th>
                  <th className="p-4">Periode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-t">
                    <td className="p-4 font-bold">{voucher.code}</td>
                    <td className="p-4">
                      {voucher.event_title ||
                        events.find((e) => e.id === Number(voucher.event_id))?.title ||
                        `Event #${voucher.event_id}`}
                    </td>
                    <td className="p-4">
                      {voucher.discount_type === "percentage"
                        ? `${voucher.discount_value}%`
                        : formatRupiah(voucher.discount_value)}
                      {voucher.max_discount
                        ? ` (maks. ${formatRupiah(voucher.max_discount)})`
                        : ""}
                    </td>
                    <td className="p-4">
                      {voucher.used_count} / {voucher.usage_limit ?? "∞"}
                    </td>
                    <td className="p-4">
                      <div>
                        {voucher.starts_at
                          ? new Date(voucher.starts_at).toLocaleString("id-ID")
                          : "-"}
                      </div>
                      <div className="text-gray-500">
                        s/d{" "}
                        {voucher.ends_at
                          ? new Date(voucher.ends_at).toLocaleString("id-ID")
                          : "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          Number(voucher.is_active) === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {Number(voucher.is_active) === 1
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => editVoucher(voucher)}
                          className="rounded border px-3 py-1 text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(voucher)}
                          className="rounded border px-3 py-1 text-gray-700"
                        >
                          {Number(voucher.is_active) === 1
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>
                        <button
                          onClick={() => deleteVoucher(voucher)}
                          className="rounded border px-3 py-1 text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
