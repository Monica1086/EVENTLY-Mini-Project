import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

interface Artikel {
  objectId: string;
  title: string;
  content: string;
  description: string;
  author: string;
  category: string;
  thumbnail: string;
}

function ArtikelDetail() {
  const { objectId } = useParams();

  const [artikel, setArtikel] = useState<Artikel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getArtikelDetail = async () => {
    try {
      const response = await axios.get(
        `https://zingyyarn-us.backendless.app/api/data/Blogs/${objectId}`
      );

      console.log(response.data);

      setArtikel(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getArtikelDetail();
  }, [objectId]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  if (!artikel) {
    return (
      <div className="py-20 text-center">
        Artikel tidak ditemukan.
      </div>
    );
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-6">

        {/* Kembali */}
        <Link
          to="/artikel"
          className="font-semibold text-red-600 hover:text-red-800"
        >
          ← Kembali ke Artikel
        </Link>

        {/* Category */}
        <p className="mt-8 font-semibold text-red-600">
          {artikel.category}
        </p>

        {/* Title */}
        <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
          {artikel.title}
        </h1>

        {/* Author */}
        <p className="mt-4 text-gray-500">
          Ditulis oleh {artikel.author}
        </p>

        {/* Image */}
        <img
          src={artikel.thumbnail}
          alt={artikel.title}
          className="mt-8 max-h-[500px] w-full rounded-2xl object-cover"
        />

        {/* Content */}
        <div className="mt-10">
          <p className="whitespace-pre-line text-lg leading-8 text-gray-700">
            {artikel.content}
          </p>
        </div>

      </div>
    </section>
  );
}

export default ArtikelDetail;