import { Link } from "react-router-dom";
import hero from "../assets/images/driyo1.jpeg";

function Hero() {
  return (
    <section className="bg-white py-8 sm:py-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-8 lg:grid-cols-2 lg:gap-12">

        {/* =========================
            KIRI
        ========================== */}
        <div>

          {/* LOGO */}
          <img
            src="/logo optik pupil ada marlin.jpg"
            alt="Logo Optik Pupil"
            className="h-20 w-auto sm:h-24"
          />

          {/* FOTO */}
          <img
            src={hero}
            alt="Optik Pupil"
            className="mt-6 w-full rounded-3xl shadow-xl sm:mt-8"
          />

        </div>


        {/* =========================
            KANAN
        ========================== */}
        <div>

          {/* JUDUL */}
          <h1 className="text-4xl font-extrabold leading-tight text-red-600 sm:text-5xl lg:text-6xl">
            Melihat lebih jelas,
          </h1>

          <h2 className="mt-2 text-4xl font-light leading-tight text-black sm:text-5xl lg:text-6xl">
            Membuat hidup lebih nyaman
          </h2>


          {/* PERIKSA - KONSULTASI - SOLUSI */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-base font-medium sm:mt-8 sm:gap-6 sm:text-lg">

            <span>✔ Periksa</span>

            <span>✔ Konsultasi</span>

            <span>✔ Solusi</span>

          </div>


          {/* DESKRIPSI */}
          <p className="mt-6 text-base leading-7 text-gray-600 sm:mt-8 sm:text-lg sm:leading-8">
            Menghadirkan pengalaman terbaik untuk kebutuhan penglihatan Anda.
            Pemeriksaan didukung dengan teknologi canggih, tenaga profesional,
            frame berkualitas, dan lensa terbaik untuk seluruh keluarga.
          </p>


          {/* TOMBOL */}
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">

            <Link
              to="/contact"
              className="rounded-lg bg-red-600 px-8 py-3 text-center text-white transition hover:bg-red-700"
            >
              Hubungi Kami
            </Link>

            <Link
              to="/layanan"
              className="rounded-lg border border-red-600 px-6 py-3 text-center text-red-600 transition hover:bg-red-50"
            >
              Layanan Kami
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;