
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

interface Ticket {
  id: number;
  transaction_id: number;
  event_id: number;
  ticket_code: string;
  qr_token: string;
  status: "valid" | "used" | "canceled";
  checked_in_at: string | null;
  created_at: string;
  event_title: string;
}

function MyTickets() {
    const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = sessionStorage.getItem("evently_token");

        if (!token) {
          setError("Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/my-tickets",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil tiket.");
        }

        setTickets(data.tickets || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil tiket."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusLabel = (status: Ticket["status"]) => {
    switch (status) {
      case "valid":
        return "Belum Digunakan";
      case "used":
        return "Sudah Digunakan";
      case "canceled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat tiket...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
  <button
    onClick={() => navigate(-1)}
    className="mb-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
  >
    ← Kembali
  </button>

  <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 mt-2">
            Semua tiket event yang sudah berhasil kamu pesan.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && tickets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Belum Ada Tiket
            </h2>
            <p className="text-gray-500 mt-2">
              Tiket event yang sudah berhasil dibayar akan muncul di sini.
            </p>
          </div>
        )}

        {/* Ticket List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">

                {/* Event Name */}
                <div className="mb-5">
                  <p className="text-sm text-gray-500">
                    EVENT
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {ticket.event_title}
                  </h2>
                </div>

                {/* Ticket Code */}
                <div className="mb-5">
                  <p className="text-sm text-gray-500">
                    Ticket Code
                  </p>
                  <p className="font-semibold text-gray-800">
                    {ticket.ticket_code}
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-5">
                  {ticket.qr_token && ticket.status === "valid" ? (
                    <>
                      <QRCodeCanvas
                        value={ticket.qr_token}
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Tunjukkan QR Code ini kepada petugas saat check-in.
                      </p>
                    </>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-gray-500 text-sm text-center">
                      {ticket.status === "used"
                        ? "Tiket sudah digunakan."
                        : ticket.status === "canceled"
                        ? "Tiket telah dibatalkan."
                        : "QR Code tidak tersedia."}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Status Tiket
                  </span>

                  <span
                    className={`text-xs font-semibold px-3 py-2 rounded-full ${
                      ticket.status === "valid"
                        ? "bg-green-100 text-green-700"
                        : ticket.status === "used"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <div className="border-t mt-5 pt-4">
                  <p className="text-xs text-gray-400">
                    Ticket ID: #{ticket.id}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MyTickets;
