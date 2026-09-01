import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  MessageCircle,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-red-700 text-white mt-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-8 py-10 md:grid-cols-[2fr_1fr_1fr_1fr]">

        {/* Logo */}
        <div>
          <img
            src="/logo optik pupil ada marlin.jpg"
            alt="Optik Pupil"
            className="h-20 w-auto"
          />

          <p className="mt-4 text-sm leading-6">
            Provider Optik BPJS Kesehatan yang melayani pemeriksaan mata,
            pembuatan kacamata, dan konsultasi penglihatan sejak tahun 2016.
          </p>
        </div>

        {/* Menu */}
        <div>
          <h3 className="mb-4 text-xl font-semibold">
            Quick Links
          </h3>

          <div className="flex flex-col gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>

            <Link to="/about" className="hover:underline">
              About
            </Link>

            <Link to="/product" className="hover:underline">
              Produk
            </Link>

            <Link to="/artikel" className="hover:underline">
              Artikel
            </Link>
          </div>
        </div>

        {/* Jam Operasional */}
        <div>
          <h3 className="mb-4 text-xl font-semibold">
            Jam Operasional
          </h3>
        <div className="space-y-2 text-sm">
          <p>Senin - Sabtu : 08.00 - 20.30</p>
          <p>Minggu/Hari Libur : 08.30 - 16.00</p>
        </div>
        </div>
        {/* Kontak */}
        <div>
          <h4 className="mb-4 text-xl font-semibold">
            Hubungi Kami
          </h4>

         <div className="space-y-3 text-sm">

  <p className="flex items-center gap-3">
    <MapPin size={18} />
    Jl. Raya Menganti No. 878, Laban Wetan, Gresik
  </p>

  <p className="flex items-center gap-3">
    <MessageCircle size={18} />
    0811-3148-300
  </p>

  <p className="flex items-center gap-3">
    <Mail size={18} />
    optikpupil@gmail.com
  </p>

  <p className="flex items-center gap-3">
  📷
  @monicakes._
</p>

</div>
        </div>
      </div>
      <div className="border-t border-red-500 py-4 text-center text-sm">
        © 2026 Optik Pupil. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;