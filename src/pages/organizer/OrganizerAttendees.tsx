import { useEffect, useState } from "react";

interface Attendee {
  transaction_id: number;
  booking_code: string;
  event_id: number;
  event_title: string;
  attendee_name: string;
  ticket_quantity: number;
  total_amount: number;
  created_at: string;
}

export default function OrganizerAttendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const token = sessionStorage.getItem("evently_token");

        const response = await fetch(
          "http://localhost:5000/api/organizer/attendees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil daftar peserta."
          );
        }

        setAttendees(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen p-5 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Attendee List
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Daftar peserta dari event yang kamu selenggarakan.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat data peserta...</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : attendees.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-700">
            Belum ada peserta.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Peserta dengan transaksi berstatus selesai akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-violet-50 text-slate-700">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Booking Code</th>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Attendee</th>
                <th className="px-5 py-4">Tickets</th>
                <th className="px-5 py-4">Total Paid</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {attendees.map((attendee, index) => (
                <tr key={attendee.transaction_id}>
                  <td className="px-5 py-4">{index + 1}</td>
                  <td className="px-5 py-4 font-medium">
                    {attendee.booking_code}
                  </td>
                  <td className="px-5 py-4">
                    {attendee.event_title}
                  </td>
                  <td className="px-5 py-4">
                    {attendee.attendee_name}
                  </td>
                  <td className="px-5 py-4">
                    {attendee.ticket_quantity}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {formatRupiah(attendee.total_amount)}
                  </td>
                  <td className="px-5 py-4">
                    {new Date(attendee.created_at).toLocaleDateString(
                      "id-ID"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}