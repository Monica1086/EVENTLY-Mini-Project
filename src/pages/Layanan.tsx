import homecare from "../assets/images/homecare.jpeg";

function Layanan() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">

        {/* JUDUL */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">
            Layanan Kami
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            Pelayanan terbaik untuk kebutuhan penglihatan Anda.
          </p>
        </div>

        {/* HOMECARE */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">

          {/* GAMBAR */}
          <div>
            <img
              src={homecare}
              alt="Layanan Homecare Optik Pupil"
              className="w-full rounded-3xl shadow-xl"
            />
          </div>

          {/* KETERANGAN */}
          <div>
            <p className="font-semibold uppercase tracking-wider text-red-600">
              Optik Pupil Homecare
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Pemeriksaan Mata Tanpa Harus Keluar Rumah
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Optik Pupil menghadirkan layanan Homecare bagi pelanggan yang
              membutuhkan pelayanan pemeriksaan mata dan kacamata langsung
              di rumah.
            </p>

            <p className="mt-4 text-lg leading-8 text-gray-600">
              Layanan ini ditujukan terutama bagi lansia, pasien dengan
              keterbatasan mobilitas, atau pelanggan yang mengalami kesulitan
              untuk datang langsung ke Optik Pupil.
            </p>

            <div className="mt-6 space-y-3 text-gray-700">
              <p>✓ Pemeriksaan mata di rumah</p>
              <p>✓ Konsultasi kebutuhan kacamata</p>
              <p>✓ Pemilihan frame dan lensa</p>
              <p>✓ Pelayanan oleh tenaga profesional</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Layanan;