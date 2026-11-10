import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, CalendarDays, MapPin } from "lucide-react";

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

export default function OrganizerEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
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

      setEvents(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus event ini?"
    );

    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("evently_token");

      const response = await fetch(
        `http://localhost:5000/api/organizer/events/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus event.");
      }

      alert("Event berhasil dihapus.");
      fetchEvents();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const statusStyle = (status: string) => {
    if (status === "published") {
      return "bg-green-100 text-green-700";
    }

    if (status === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Events
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola seluruh event yang Anda buat.
          </p>
        </div>

        <button
          onClick={() => navigate("/organizer/events/new")}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {loading && (
        <p className="text-slate-500">Memuat data event...</p>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error}
          <button
            onClick={fetchEvents}
            className="ml-3 underline font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="bg-white rounded-2xl border p-10 text-center">
          <CalendarDays
            size={42}
            className="mx-auto text-slate-300 mb-4"
          />
          <h2 className="font-semibold text-lg text-slate-700">
            Belum ada event
          </h2>
          <p className="text-slate-500 mt-2">
            Mulai buat event pertamamu di EVENTLY.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  {event.category}
                </span>

                <h2 className="text-lg font-bold text-slate-800 mt-2">
                  {event.title}
                </h2>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusStyle(
                  event.status
                )}`}
              >
                {event.status}
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-3 line-clamp-2">
              {event.description}
            </p>

            <div className="space-y-3 mt-5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={17} />
                {formatDate(event.event_date)}
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={17} />
                {event.location}
              </div>

              <div className="flex justify-between border-t pt-4">
                <span>Harga tiket</span>
                <strong>{formatPrice(Number(event.ticket_price))}</strong>
              </div>

              <div className="flex justify-between">
                <span>Tiket tersedia</span>
                <strong>
                  {event.available_seats} / {event.total_seats}
                </strong>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() =>
                  navigate(`/organizer/events/${event.id}/edit`)
                }
                className="flex-1 flex justify-center items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg font-semibold"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() => handleDelete(event.id)}
                className="flex-1 flex justify-center items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg font-semibold"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}