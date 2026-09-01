function Mitra() {
  const mitra = [
  {
    name: "BCA Life",
    logo: "/mitra/Logo BCA life.webp",
    size: "max-h-24 max-w-52",
  },
  {
    name: "Bluebird",
    logo: "/mitra/Logo bluebird.png",
    size: "max-h-30 max-w-58",
  },
  {
    name: "BPJS Kesehatan",
    logo: "/mitra/Logo Bpjs.jpg",
    size: "max-h-28 max-w-52",
  },
  {
    name: "BRI Life",
    logo: "/mitra/Logo BRILIFE.png",
    size: "max-h-24 max-w-52",
  },
  {
    name: "KAI",
    logo: "/mitra/Logo KAI.png",
    size: "max-h-20 max-w-44",
  },
  {
    name: "Nayaka",
    logo: "/mitra/Logo Nayaka.png",
    size: "max-h-24 max-w-48",
  },
  {
    name: "Telkom Indonesia",
    logo: "/mitra/Logo Telkom.png",
    size: "max-h-24 max-w-48",
  },
];

  return (
      <div className="mx-auto max-w-7xl px-6">

        {/* JUDUL */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-red-600">
            Mitra Kerjasama
          </h2>

          <p className="mt-3 text-gray-600">
            Dipercaya dan bekerja sama dengan berbagai mitra
          </p>
        </div>

        {/* LOGO MITRA */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-10">

          {mitra.map((item) => (
            <div
  key={item.name}
  className="flex h-32 w-48 items-center justify-center rounded-xl bg-white p-4 transition duration-300 hover:-translate-y-1"
>
              <img
  src={item.logo}
  alt={item.name}
  className={`${item.size} object-contain`}
/>
            </div>
          ))}

        </div>

      </div>
  );
}

export default Mitra;