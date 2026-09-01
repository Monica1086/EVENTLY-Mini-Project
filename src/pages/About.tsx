import cerita from "../assets/images/driyo.jpeg";
import PageLogo from "../components/PageLogo";

function About() {
    return (
        <>
  <PageLogo />

        <section className="bg-white pb-0 pt-0">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-2 py-0 lg:grid-cols-2">
                <img
                    src={cerita}
                    alt="Optik Pupil"
                    className="mt-8 w-full rounded-3xl shadow-xl"
                />
                <div>
                    <h2 className="text-3xl font-bold text-red-600">
                        Cerita Kami
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
                        pelayanan kesehatan mata yang profesional, terpercaya, dan
                        didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
                        pelayanan kesehatan mata yang profesional, terpercaya, dan
                        didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
                        pelayanan kesehatan mata yang profesional, terpercaya, dan
                        didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
                        pelayanan kesehatan mata yang profesional, terpercaya, dan
                        didukung teknologi modern.
                    </p>
                </div>
            </div>
        </section>
<section className="bg-red-500 pb-12 pt-8">
<div className="mx-auto grid max-w-7xl items-center gap-4 px-8 py-6 lg:grid-cols-2">

  {/* KIRI - CERITA */}
  <div>
    
    <p className="mt-6 text-lg leading-8 text-white">
      Lalu pada tahun 2024, Optik Pupil mengembangkan bisnisnya dengan membuka cabang baru di Citraland CBD Driyorejo
      untuk dapat lebih dekat dengan masyarakat yang membutuhkan kacamata di daerah Citraland Driyorejo dan sekitarnya.
      Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
      pelayanan kesehatan mata yang profesional, terpercaya, dan
      didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
      pelayanan kesehatan mata yang profesional, terpercaya, dan
      didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
      pelayanan kesehatan mata yang profesional, terpercaya, dan
      didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
      pelayanan kesehatan mata yang profesional, terpercaya, dan
      didukung teknologi modern.Optik Pupil berdiri sejak tahun 2016 di Jl. Raya Menganti No. 878 Laban Wetan Gresik. Komitmen kami adalah memberikan
      pelayanan kesehatan mata yang profesional, terpercaya, dan
      didukung teknologi modern.
      
    </p>
  </div>

  {/* KANAN - FOTO */}
  <div>
    <img
      src={cerita}
      alt="Optik Pupil"
      className="w-full rounded-3xl shadow-xl"
    />
  </div>

</div>
</section>
      
  <section className="bg-gray-50 pb-12 pt-8">
   <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 justify-items-center gap-2 lg:grid-cols-2">

      {/* VISI */}
      
      <img
  src="/visi-optik-pupil.png"
  alt="Visi Optik Pupil"
  className="mx-auto w-240 rounded-xl"
/>
      {/* MISI */}
      <img
  src="/misi-optik-pupil.png"
  alt="Misi Optik Pupil"
  className="mx-auto w-240 rounded-xl"
/>
    </div>
</section>
<section className="bg-white py-16">
  <div className="mx-auto max-w-5xl px-6">

    <h2 className="text-center text-4xl font-bold text-red-600">
      Nilai-Nilai Kami
    </h2>

    <p className="mt-4 text-center text-gray-600">
      Nilai yang menjadi dasar dalam setiap pelayanan kepada pelanggan.
    </p>

    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

      {/* Card 1 */}
      <div className="p-8 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="text-5xl">❤️</div>

        <h3 className="mt-5 text-2xl font-bold text-red-600">
          Pelayanan
        </h3>

        <p className="mt-3 text-gray-600">
          Memberikan pelayanan yang ramah, cepat, dan sepenuh hati kepada setiap pelanggan.
        </p>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl p-8 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="text-5xl">👓</div>

        <h3 className="mt-5 text-2xl font-bold text-red-600">
          Profesional
        </h3>

        <p className="mt-3 text-gray-600">
          Mengutamakan pemeriksaan mata yang akurat dengan tenaga yang kompeten.
        </p>
      </div>

      {/* Card 3 */}
      <div className="rounded-2xl p-8 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="text-5xl">🤝</div>

        <h3 className="mt-5 text-2xl font-bold text-red-600">
          Integritas
        </h3>

        <p className="mt-3 text-gray-600">
          Menjunjung tinggi kejujuran, tanggung jawab, dan kepercayaan pelanggan.
        </p>
      </div>

      {/* Card 4 */}
      <div className="rounded-2xl p-8 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="text-5xl">⭐</div>

        <h3 className="mt-5 text-2xl font-bold text-red-600">
          Kepuasan Pelanggan
        </h3>
        <p className="mt-3 text-gray-600">
          Berkomitmen memberikan solusi terbaik agar setiap pelanggan merasa puas dan nyaman.
        </p>
      </div>
    </div>
  </div>
</section>
    </>
    );
}

export default About;