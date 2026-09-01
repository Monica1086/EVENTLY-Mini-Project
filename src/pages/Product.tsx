import { useEffect, useState } from "react";
import axios from "axios";
import PageLogo from "../components/PageLogo";
import { Link, useSearchParams } from "react-router-dom";

interface Product {
  objectId: string;
  image: string;
  brand: string;
  code: string;
  price: number;
  category: string;
  size: string;
}

function Product() {
  // ========================================
  // STATE PRODUK
  // ========================================
  const [products, setProducts] = useState<Product[]>([]);

  // ========================================
  // MEMBACA CATEGORY DARI URL
  // ========================================
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");

  // ========================================
  // CATEGORY YANG SEDANG DIPILIH
  // ========================================
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl || "all"
  );

  // ========================================
  // MENGAMBIL DATA PRODUK DARI BACKENDLESS
  // ========================================
  const getProducts = async () => {
    try {
      const response = await axios.get(
        "https://zingyyarn-us.backendless.app/api/data/products?pageSize=100"
      );

      console.log("JUMLAH PRODUK:", response.data.length);
      console.log("SEMUA PRODUK:", response.data);

      // Mengecek apakah Focus berhasil masuk
      const focus = response.data.find(
        (product: Product) =>
          product.brand?.trim().toLowerCase() === "focus"
      );

      console.log("DATA FOCUS:", focus);

      setProducts(response.data);
    } catch (error) {
      console.log("ERROR MENGAMBIL PRODUK:", error);
    }
  };

  // ========================================
  // AMBIL DATA SAAT HALAMAN DIBUKA
  // ========================================
  useEffect(() => {
    getProducts();
  }, []);

  // ========================================
  // JIKA CATEGORY DI URL BERUBAH
  // ========================================
  useEffect(() => {
    setSelectedCategory(categoryFromUrl || "all");
  }, [categoryFromUrl]);

  // ========================================
  // FILTER PRODUK
  // ========================================
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) =>
            product.category?.trim().toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  return (
    <>
      {/* LOGO */}
      <PageLogo />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">

          {/* JUDUL */}
          <h1 className="text-center text-4xl font-bold text-red-600">
            Koleksi Produk
          </h1>

          <p className="mt-3 text-center text-gray-600">
            Temukan berbagai pilihan produk terbaik dari Optik Pupil
          </p>

          {/* ========================================
              FILTER KATEGORI
          ======================================== */}

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            {/* SEMUA */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-lg px-5 py-2 font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-red-600 text-white"
                  : "border border-red-600 text-red-600 hover:bg-red-50"
              }`}
            >
              Semua
            </button>

            {/* FRAME */}
            <button
              onClick={() => setSelectedCategory("frame")}
              className={`rounded-lg px-5 py-2 font-semibold transition ${
                selectedCategory === "frame"
                  ? "bg-red-600 text-white"
                  : "border border-red-600 text-red-600 hover:bg-red-50"
              }`}
            >
              Frame
            </button>

            {/* LENSA */}
            <button
              onClick={() => setSelectedCategory("lensa")}
              className={`rounded-lg px-5 py-2 font-semibold transition ${
                selectedCategory === "lensa"
                  ? "bg-red-600 text-white"
                  : "border border-red-600 text-red-600 hover:bg-red-50"
              }`}
            >
              Lensa
            </button>

            {/* SOFTLENS */}
            <button
              onClick={() => setSelectedCategory("softlens")}
              className={`rounded-lg px-5 py-2 font-semibold transition ${
                selectedCategory === "softlens"
                  ? "bg-red-600 text-white"
                  : "border border-red-600 text-red-600 hover:bg-red-50"
              }`}
            >
              Softlens
            </button>

            {/* SUNGLASS */}
            <button
              onClick={() => setSelectedCategory("sunglass")}
              className={`rounded-lg px-5 py-2 font-semibold transition ${
                selectedCategory === "sunglass"
                  ? "bg-red-600 text-white"
                  : "border border-red-600 text-red-600 hover:bg-red-50"
              }`}
            >
              Sunglass
            </button>

          </div>

          {/* ========================================
              PRODUK
          ======================================== */}

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {filteredProducts.map((product) => (
              <Link
                key={product.objectId}
                to={`/product/${product.objectId}`}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* GAMBAR */}
                <img
                  src={product.image}
                  alt={product.brand}
                  className="h-64 w-full object-cover"
                />

                {/* INFORMASI */}
                <div className="p-6">

                  <h2 className="text-xl font-bold text-gray-800">
                    {product.brand}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Kode: {product.code}
                  </p>

                  <p className="mt-3 text-xl font-bold text-red-600">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>

                  {/* LINK DETAIL */}
                  <p className="mt-4 font-semibold text-red-600">
                    Lihat Detail →
                  </p>

                </div>

              </Link>
            ))}

          </div>

          {/* ========================================
              JIKA PRODUK TIDAK ADA
          ======================================== */}

          {filteredProducts.length === 0 && (
            <p className="mt-10 text-center text-gray-500">
              Belum ada produk untuk kategori ini.
            </p>
          )}

        </div>
      </section>
    </>
  );
}

export default Product;