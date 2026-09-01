import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Product {
  objectId: string;
  image: string;
  brand: string;
  code: string;
  price: number;
  category: string;
}

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const getProducts = async () => {
    try {
      const response = await axios.get(
        "https://zingyyarn-us.backendless.app/api/data/products"
      );

      console.log("DATA PRODUK:", response.data);

      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const categories = [
    {
      title: "Frame",
      description:
        "Berbagai pilihan frame modern untuk segala usia.",
      category: "frame",
    },
    {
      title: "Sunglasses",
      description:
        "Lindungi mata dengan koleksi sunglasses berkualitas.",
      category: "sunglass",
    },
    {
      title: "Lensa",
      description:
        "Lensa minus, plus, silinder hingga blue light.",
      category: "lensa",
    },
    {
      title: "Softlens",
      description:
        "Koleksi softlens yang nyaman untuk berbagai kebutuhan.",
      category: "softlens",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* JUDUL */}
        <h2 className="text-center text-4xl font-bold text-red-600">
          Produk Kami
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Temukan berbagai pilihan produk terbaik sesuai kebutuhan
          penglihatan Anda.
        </p>

        {/* CATEGORY */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {categories.map((item) => {

            // Cari produk berdasarkan category
            const categoryProduct = products.find(
              (product) =>
                product.category?.trim().toLowerCase() ===
                item.category
            );

            return (
              <div
                key={item.category}
                className="overflow-hidden rounded-2xl border bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >

                {/* GAMBAR DARI BACKENDLESS */}
                {categoryProduct ? (
                  <img
                    src={categoryProduct.image}
                    alt={item.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
                    Gambar belum tersedia
                  </div>
                )}

                <div className="p-5">

                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-gray-600">
                    {item.description}
                  </p>

                  <Link
                    to={`/product?category=${item.category}`}
                    className="mt-5 inline-block rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                  >
                    Lihat Selengkapnya
                  </Link>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default FeaturedProducts;