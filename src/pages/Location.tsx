function Location() {
  const locations = [
    {
      name: "Optik Pupil Menganti",
      address: "Jl. Raya Menganti No. 878, Laban Wetan, Gresik",
      phone: "0821-1012-8300",
      whatsapp: "6282110128300",
      image: "/Menganti.jpeg",
      maps: "https://www.google.com/maps/search/?api=1&query=Optik+Pupil+Jl.+Raya+Menganti+No.+878+Laban+Wetan+Gresik",
    },
    {
      name: "Optik Pupil Citraland CBD Driyorejo",
      address: "Citraland CBD Driyorejo, Jl. Petiken No. 1, Gresik",
      phone: "0811-3148-300",
      whatsapp: "628113148300",
      image: "/driyorejo.jpeg",
      maps: "https://www.google.com/maps/search/?api=1&query=Optik+Pupil+Citraland+CBD+Driyorejo+Gresik",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">
            Lokasi Optik Pupil
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Temukan cabang Optik Pupil terdekat dan kunjungi kami.
            Kami siap membantu memenuhi kebutuhan penglihatan Anda.
          </p>
        </div>

        {/* LOCATION CARDS */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">

          {locations.map((location) => (
            <div
              key={location.name}
              className="overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* FOTO */}
              <img
                src={location.image}
                alt={location.name}
                className="h-72 w-full object-cover"
              />

              {/* INFO */}
              <div className="p-7">

                <h2 className="text-2xl font-bold text-gray-800">
                  {location.name}
                </h2>

                {/* ALAMAT */}
                <div className="mt-6 flex gap-4">
                  <div className="text-2xl">
                    📍
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      Alamat
                    </p>

                    <p className="mt-1 leading-7 text-gray-600">
                      {location.address}
                    </p>
                  </div>
                </div>

                {/* TELEPON */}
                <div className="mt-5 flex gap-4">
                  <div className="text-2xl">
                    📞
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      Hubungi Kami
                    </p>

                    <p className="mt-1 text-gray-600">
                      {location.phone}
                    </p>
                  </div>
                </div>

                {/* BUTTON */}
                <div className="mt-7 flex flex-wrap gap-3">

                  {/* WHATSAPP */}
                  <a
                    href={`https://wa.me/${location.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    WhatsApp
                  </a>

                  {/* GOOGLE MAPS */}
                  <a
                    href={location.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                  >
                    Lihat di Google Maps
                  </a>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Location;