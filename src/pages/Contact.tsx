import axios from "axios";
import { useState } from "react";

function Contact() {
  // Mengambil nama user yang sudah login
  const [name, setName] = useState(
    localStorage.getItem("userName") || ""
  );

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Validasi form
    if (!name || !email || !phone || !subject || !message) {
      alert("Semua data harus diisi.");
      return;
    }

    try {
      setIsLoading(true);

      const url =
        "https://zingyyarn-us.backendless.app/api/data/Contact";

      // Mengambil ID user yang sedang login
      const userId = localStorage.getItem("userId");

      // Kirim data ke Backendless
      await axios.post(url, {
  name: name,
  email: email,
  phone: phone,
  subject: subject,
  message: message,
  userId : userId
});

      alert("Pesan berhasil dikirim!");

      // Kosongkan form setelah berhasil
      // Nama tetap ada karena berasal dari user yang login
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("STATUS:", error.response?.status);
        console.log(
          "BACKENDLESS MESSAGE:",
          error.response?.data?.message
        );
      } else {
        console.log(error);
      }

      alert("Pesan gagal dikirim. Silakan coba kembali.");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-6">

        {/* JUDUL */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">
            Hubungi Kami
          </h1>

          <p className="mt-3 text-gray-600">
            Ada pertanyaan atau ingin berkonsultasi?
            Silakan kirim pesan kepada kami.
          </p>
        </div>

        {/* FORM */}
        <div className="mt-10 rounded-2xl bg-white p-8 shadow-lg">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAMA */}
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Nama
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                placeholder="Masukkan email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            {/* NOMOR WHATSAPP */}
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Nomor WhatsApp
              </label>

              <input
                type="tel"
                value={phone}
                placeholder="Contoh: 081234567890"
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            {/* SUBJEK */}
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Keperluan
              </label>

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500"
              >
                <option value="">
                  Pilih keperluan...
                </option>

                <option value="Pemeriksaan Mata">
                  Pemeriksaan Mata
                </option>

                <option value="Konsultasi Kacamata">
                  Konsultasi Kacamata
                </option>

                <option value="Lensa Kacamata">
                  Lensa Kacamata
                </option>

                <option value="Frame Kacamata">
                  Frame Kacamata
                </option>

                <option value="BPJS Kesehatan">
                  BPJS Kesehatan
                </option>

                <option value="Keluhan Kacamata">
                  Keluhan Kacamata
                </option>

                <option value="Lainnya">
                  Lainnya
                </option>
              </select>
            </div>

            {/* PESAN */}
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Pesan
              </label>

              <textarea
                value={message}
                placeholder="Tuliskan pesan atau pertanyaan Anda..."
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            {/* TOMBOL */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? "Mengirim..." : "Kirim Pesan"}
            </button>

          </form>

        </div>
      </div>
    </section>
  );
}

export default Contact;