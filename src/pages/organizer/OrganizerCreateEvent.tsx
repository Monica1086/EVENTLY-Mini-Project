import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface EventForm {
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  end_date: string;
  event_type: string;
  ticket_price: string;
  total_seats: string;
  status: string;
}

const initialForm: EventForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  event_date: "",
  end_date: "",
  event_type: "paid",
  ticket_price: "0",
  total_seats: "",
  status: "draft",
};

function formatDateInput(value: string | null) {
  if (!value) return "";

  return value.replace(" ", "T").slice(0, 16);
}

export default function OrganizerCreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<EventForm>(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const token = sessionStorage.getItem("evently_token");

        const response = await fetch(
          "http://localhost:5000/api/organizer/events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data event.");
        }

        const event = result.data.find(
          (item: { id: number }) => Number(item.id) === Number(id)
        );

        if (!event) {
          throw new Error("Event tidak ditemukan.");
        }

        setForm({
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          event_date: formatDateInput(event.event_date),
          end_date: formatDateInput(event.end_date),
          event_type:
  event.event_type ||
  (Number(event.ticket_price) > 0 ? "paid" : "free"),
          ticket_price: String(event.ticket_price),
          total_seats: String(event.total_seats),
          status: event.status,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      form.end_date &&
      form.end_date < form.event_date
    ) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);

    try {
      const token = sessionStorage.getItem("evently_token");

      const url = isEdit
        ? `http://localhost:5000/api/organizer/events/${id}`
        : "http://localhost:5000/api/events";

      const formData = new FormData();

formData.append("title", form.title);
formData.append("description", form.description);
formData.append("category", form.category);
formData.append("location", form.location);
formData.append("event_date", form.event_date);
formData.append("end_date", form.end_date);
formData.append("event_type", form.event_type);
formData.append("ticket_price", form.event_type === "free" ? "0" : form.ticket_price);
formData.append("total_seats", form.total_seats);

if (isEdit) {
  formData.append("status", form.status);
}

if (imageFile) {
  formData.append("image", imageFile);
}

const response = await fetch(url, {
  method: isEdit ? "PUT" : "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan event.");
      }

      alert(
        isEdit
          ? "Event berhasil diperbarui."
          : "Event berhasil dibuat sebagai draft."
      );

      navigate("/organizer/events");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <div className="p-8">Memuat data event...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <button
        onClick={() => navigate("/organizer/events")}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={18} />
        Kembali ke My Events
      </button>

      <h1 className="text-2xl font-bold text-slate-800">
        {isEdit ? "Edit Event" : "Create New Event"}
      </h1>

      <p className="text-slate-500 mt-2 mb-8">
        Lengkapi informasi event yang akan Anda selenggarakan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-5"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium mb-2">
            Nama Event
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            className="w-full border rounded-lg p-3"
            placeholder="Masukkan nama event"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Deskripsi Event
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border rounded-lg p-3"
            placeholder="Jelaskan tentang event Anda"
          />
        </div>
       
  
          <div>
            <label className="block font-medium mb-2">
              Foto Cover Event
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-lg p-3"
            />

            <p className="text-sm text-slate-500 mt-2">
              Format JPG, PNG, atau WEBP. Maksimal 5 MB.
            </p>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview cover event"
                  className="w-full max-w-md h-56 object-cover rounded-xl border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-medium mb-2">
                Kategori
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
                placeholder="Music, Sport, Workshop..."
              />
            </div>

          <div>
            <label className="block font-medium mb-2">
              Lokasi
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
              placeholder="Lokasi event"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Tanggal & Waktu Mulai
            </label>
            <input
              type="datetime-local"
              name="event_date"
              value={form.event_date}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Tanggal & Waktu Selesai
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
  <label className="block font-medium mb-2">
    Jenis Event
  </label>

  <div className="flex gap-4">
    <label className="flex items-center gap-2 border rounded-lg p-3 flex-1 cursor-pointer">
      <input
        type="radio"
        name="event_type"
        value="free"
        checked={form.event_type === "free"}
        onChange={() =>
          setForm({
            ...form,
            event_type: "free",
            ticket_price: "0",
          })
        }
      />
      <span className="font-medium">FREE EVENT</span>
    </label>

    <label className="flex items-center gap-2 border rounded-lg p-3 flex-1 cursor-pointer">
      <input
        type="radio"
        name="event_type"
        value="paid"
        checked={form.event_type === "paid"}
        onChange={() =>
          setForm({
            ...form,
            event_type: "paid",
          })
        }
      />
      <span className="font-medium">PAID EVENT</span>
    </label>
  </div>
</div>

{form.event_type === "paid" ? (
  <div>
    <label className="block font-medium mb-2">
      Harga Tiket (Rp)
    </label>
    <input
      type="number"
      name="ticket_price"
      value={form.ticket_price}
      onChange={handleChange}
      min="1"
      required
      className="w-full border rounded-lg p-3"
    />
  </div>
) : (
  <div>
    <label className="block font-medium mb-2">
      Harga Tiket
    </label>
    <div className="w-full border rounded-lg p-3 bg-green-50 text-green-700 font-bold">
      GRATIS
    </div>
  </div>
)}

          <div>
            <label className="block font-medium mb-2">
              Jumlah Tiket
            </label>
            <input
              type="number"
              name="total_seats"
              value={form.total_seats}
              onChange={handleChange}
              min="1"
              step="1"
              required
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="block font-medium mb-2">
              Status Event
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {!isEdit && (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
            Event baru akan disimpan sebagai Draft. Anda dapat
            mempublikasikannya melalui menu Edit setelah dibuat.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/organizer/events")}
            className="flex-1 border rounded-lg py-3 font-semibold"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Buat Event"}
          </button>
        </div>
      </form>
    </div>
  );
}