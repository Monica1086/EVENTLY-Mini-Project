import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import PageLogo from "../components/PageLogo";

interface Product {
  objectId: string;
  image: string;
  brand: string;
  code: string;
  price: number;
  category: string;
  size: string;
}

function ProductDetail() {
  const { objectId } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProduct = async () => {
    try {
      const response = await axios.get(
        `https://zingyyarn-us.backendless.app/api/data/products/${objectId}`
      );

      console.log("DETAIL PRODUK:", response.data);

      setProduct(response.data);
    } catch (error) {
      console.log("ERROR DETAIL PRODUK:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
  }, [objectId]);

  // Loading
  if (isLoading) {
    return (
      <>
        <PageLogo />

        <div className="py-20 text-center">
          <p className="text-gray-500">
            Memuat detail produk...
          </p>
        </div>
      </>
    );
  }

  // Produk tidak ditemukan
  if (!product) {
    return (
      <>
        <PageLogo />

        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Produk tidak ditemukan
          </h1>

          <Link
            to="/product"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            Kembali ke Produk
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageLogo />

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">

          {/* KEMBALI */}
          <Link
            to="/product"
            className="mb-8 inline-block font-semibold text-red-600 hover:text-red-800"
          >
            ← Kembali ke Koleksi Produk
          </Link>

          {/* DETAIL */}
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-lg md:grid-cols-2">

            {/* GAMBAR */}
            <div className="bg-gray-100">
              <img
                src={product.image}
                alt={product.brand}
                className="h-full max-h-[600px] w-full object-cover"
              />
            </div>

            {/* INFORMASI */}
            <div className="p-8 md:p-10">

              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                {product.category}
              </p>

              <h1 className="mt-3 text-4xl font-bold text-gray-800">
                {product.brand}
              </h1>

              <p className="mt-2 text-gray-500">
                Kode Produk: {product.code}
              </p>

              <p className="mt-6 text-3xl font-bold text-red-600">
                Rp {product.price.toLocaleString("id-ID")}
              </p>

              {/* INFORMASI */}
              <div className="mt-8 space-y-4">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Kategori
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {product.category}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Ukuran
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {product.size || "-"}
                  </p>
                </div>

              </div>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/628113148300?text=Halo%20Optik%20Pupil,%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(
                  product.brand
                )}%20kode%20${encodeURIComponent(product.code)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block rounded-xl bg-red-600 px-6 py-4 text-center font-semibold text-white transition hover:bg-red-700"
              >
                Konsultasi Produk via WhatsApp
              </a>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductDetail;