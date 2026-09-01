function WhyChooseUs() {
  const features = [
    {
      title: "Pemeriksaan Mata",
      description:
        "Pemeriksaan mata menggunakan alat modern dan tenaga profesional.",
      icon: "👁️",
    },
    {
      title: "Frame Berkualitas",
      description:
        "Tersedia berbagai pilihan frame dan lensa berkualitas.",
      icon: "👓",
    },
    {
      title: "Provider BPJS",
      description:
        "Melayani peserta BPJS Kesehatan sesuai ketentuan.",
      icon: "🏥",
    },
    {
      title: "Pelayanan Ramah",
      description:
        "Kami siap membantu menemukan solusi terbaik untuk penglihatan Anda.",
      icon: "❤️",
    },
  ];

  return (
  
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-4xl font-bold text-red-600">
          Mengapa Memilih Optik Pupil?
        </h2>

        <p className="mt-4 text-center text-gray-500">
          Kami memberikan pelayanan terbaik untuk kesehatan mata Anda.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-red-100 p-6 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="text-5xl text-center">{feature.icon}</div>

              <h3 className="mt-4 text-xl font-semibold text-center">
                {feature.title}
              </h3>

              <p className="mt-3 text-gray-600 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    
  );
}

export default WhyChooseUs;