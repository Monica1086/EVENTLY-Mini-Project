function Promo() {
  const promos = [
    {
      title: "Frame + Lensa",
      image: "/promo frame.jpeg",
    },
    {
      title: "Promo Spesial Kemerdekaan",
      image: "/promo kemerdekaan.jpeg",
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* JUDUL */}
        <div className="text-center">

          <h2 className="text-3xl font-bold text-red-600 sm:text-4xl">
            Promo Spesial Optik Pupil
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Dapatkan berbagai penawaran menarik untuk kebutuhan
            penglihatan Anda dan keluarga.
          </p>

        </div>

        {/* PROMO */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">

          {promos.map((promo) => (
            <div
              key={promo.title}
              className="flex justify-center"
            >

              {/* GAMBAR PROMO */}
              <img
                src={promo.image}
                alt={promo.title}
                className="mx-auto h-auto w-full max-w-sm object-contain"
              />

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Promo;