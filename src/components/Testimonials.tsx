function Testimonials() {
  const testimonials = [
    {
      name: "AW Official",
      text: "Pelayanan ramah, tempat bersih, pilihan banyak.",
    },
    {
      name: "Gheazhella Hellen Fadillasari",
      text: "Pelayanannya ramah banget, bisa BPJS juga.",
    },
    {
      name: "Alfin Syahrit",
      text: "Pelayanannya sangat bagus dan ramah.",
    },
    {
      name: "Anita Suci",
      text: "Sangat rekomend buat yang nyari kacamata buat BPJS, juga nggak kalah bagus framenya.",
    },
    {
      name: "Togik_PD",
      text: "Staffnya ramah, model framenya modern dan cakep. Tempat bersih dan sangat nyaman. Dapat free lens cleaner.",
    },
    {
      name: "Iella Fuzzie",
      text: "Pelayanan ramah, penjelasannya pun detail, tempat nyaman, banyak pilihan frame yang kekinian.",
    },
  ];

  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* JUDUL */}
        <div className="text-center">

          <h2 className="text-3xl font-bold text-red-600 sm:text-4xl">
            Apa Kata Pelanggan Kami?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Kepuasan pelanggan menjadi bagian penting dari komitmen
            Optik Pupil dalam memberikan pelayanan terbaik.
          </p>

          <div className="mt-3 text-sm text-gray-500">
            ⭐ 5.0 Google Review
          </div>

        </div>

        {/* TESTIMONIAL */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* BINTANG */}
              <div className="text-lg tracking-wide text-yellow-500">
                ★★★★★
              </div>

              {/* QUOTE */}
              <p className="mt-4 flex-1 text-base leading-7 text-gray-600">
                "{testimonial.text}"
              </p>

              {/* NAMA */}
              <div className="mt-6 border-t border-gray-100 pt-4">

                <p className="font-semibold text-gray-800">
                  {testimonial.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Google Review
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Testimonials;