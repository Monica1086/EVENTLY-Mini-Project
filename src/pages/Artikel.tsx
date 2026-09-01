import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import PageLogo from "../components/PageLogo";

interface Artikel {
  objectId: string;
  title: string;
  content: string;
  description: string;
  author: string;
  category: string;
  thumbnail: string;
}

function Artikel() {
  const [Artikels, setArtikels] = useState<Artikel[]>([]);

  const navigate = useNavigate();

  // =========================
  // MENGAMBIL DATA ARTIKEL
  // =========================
  const getArtikels = async () => {
    try {
      const response = await axios.get(
        "https://zingyyarn-us.backendless.app/api/data/Blogs"
      );

      console.log(response.data);

      setArtikels(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getArtikels();
  }, []);

  // =========================
  // TOMBOL BUAT ARTIKEL
  // =========================
  const handleCreateArticle = () => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      // Sudah login
      navigate("/create-blog");
    } else {
      // Belum login
      navigate("/login");
    }
  };

  return (
    <>
      <PageLogo />

      <section className="bg-white pb-12 pt-4">
        <div className="mx-auto max-w-7xl px-6">

          {/* JUDUL */}
          <h1 className="text-center text-4xl font-bold text-red-600">
            Artikel Terbaru
          </h1>

          <p className="mt-3 text-center text-gray-600">
            Temukan beragam tips dan berita terbaru
          </p>

          {/* ========================= */}
          {/* TOMBOL BUAT ARTIKEL */}
          {/* ========================= */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCreateArticle}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg"
            >
              + Buat Artikel
            </button>
          </div>

          {/* ========================= */}
          {/* DAFTAR ARTIKEL */}
          {/* ========================= */}
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {Artikels.map((Artikel) => (
              <div
                key={Artikel.objectId}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* GAMBAR */}
                <img
                  src={Artikel.thumbnail}
                  alt={Artikel.title}
                  className="h-64 w-full object-cover"
                />

                {/* ISI */}
                <div className="p-6">

                  <h2 className="text-xl font-bold text-gray-800">
                    {Artikel.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {Artikel.author}
                  </p>

                  <p className="mt-3 text-xl font-bold text-red-600">
                    {Artikel.description}
                  </p>

                  {/* DETAIL */}
                  <Link
                    to={`/artikel/${Artikel.objectId}`}
                    className="mt-6 inline-block font-semibold text-red-600 hover:text-red-800"
                  >
                    Baca Selengkapnya →
                  </Link>

                </div>
              </div>
            ))}

          </div>

          {/* JIKA ARTIKEL KOSONG */}
          {Artikels.length === 0 && (
            <p className="mt-10 text-center text-gray-500">
              Belum ada artikel.
            </p>
          )}

        </div>
      </section>
    </>
  );
}

export default Artikel;