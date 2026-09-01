import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateBlog() {
  const navigate = useNavigate();

  // =========================
  // DATA USER LOGIN
  // =========================
  const userToken = localStorage.getItem("userToken");
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");

  // =========================
  // STATE FORM
  // =========================
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  // =========================
  // STATE GAMBAR
  // =========================
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================
  // PILIH GAMBAR
  // =========================
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Cek tipe file
    if (!file.type.startsWith("image/")) {
      setErrorMessage("File yang dipilih harus berupa gambar.");
      return;
    }

    // Cek ukuran file maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setErrorMessage("");
    setImageFile(file);

    // Membuat preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // =========================
  // UPLOAD GAMBAR KE BACKENDLESS
  // =========================
  const uploadImage = async () => {
    if (!imageFile) {
      return null;
    }

    const formData = new FormData();

    formData.append("file", imageFile);

    const response = await axios.post(
      "https://zingyyarn-us.backendless.app/api/files/blog-images",
      formData,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    console.log("HASIL UPLOAD GAMBAR:", response.data);

    return response.data.fileURL;
  };

  // =========================
  // SUBMIT ARTIKEL
  // =========================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Cek login
    if (!userToken) {
      navigate("/login");
      return;
    }

    // Validasi
    if (
      !title.trim() ||
      !category.trim() ||
      !description.trim() ||
      !content.trim()
    ) {
      setErrorMessage(
        "Mohon lengkapi semua data artikel."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // =========================
      // UPLOAD GAMBAR
      // =========================
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      console.log("URL GAMBAR:", imageUrl);

      // =========================
      // DATA BLOG
      // =========================
      const blogData = {
        title: title.trim(),
        category: category,
        description: description.trim(),
        content: content.trim(),
        author: userName || "Admin",
        ownerId: userId || null,
        thumbnail: imageUrl,
      };

      console.log("DATA BLOG:", blogData);

      // =========================
      // SIMPAN KE BACKENDLESS
      // =========================
      await axios.post(
        "https://zingyyarn-us.backendless.app/api/data/Blogs",
        blogData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Berhasil
      alert("Artikel berhasil dipublikasikan! 🎉");

      // Kembali ke artikel
      navigate("/artikel");

    } catch (error) {
      console.error(
        "ERROR CREATE BLOG:",
        error
      );

      setErrorMessage(
        "Gagal membuat artikel. Silakan coba lagi."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-6">

        {/* ========================= */}
        {/* JUDUL */}
        {/* ========================= */}

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold text-red-600">
            Buat Artikel
          </h1>

          <p className="mt-3 text-gray-600">
            Bagikan informasi dan tips seputar kesehatan
            mata bersama pelanggan Optik Pupil.
          </p>

        </div>

        {/* ========================= */}
        {/* FORM */}
        {/* ========================= */}

        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ========================= */}
            {/* JUDUL */}
            {/* ========================= */}

            <div>

              <label className="mb-2 block font-semibold text-gray-700">
                Judul Artikel
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Contoh: Pentingnya Pemeriksaan Mata Rutin"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

            </div>

            {/* ========================= */}
            {/* KATEGORI */}
            {/* ========================= */}

            <div>

              <label className="mb-2 block font-semibold text-gray-700">
                Kategori
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >

                <option value="">
                  Pilih kategori
                </option>

                <option value="Tips Mata">
                  Tips Mata
                </option>

                <option value="Kesehatan Mata">
                  Kesehatan Mata
                </option>

                <option value="Kacamata">
                  Kacamata
                </option>

                <option value="Lensa">
                  Lensa
                </option>

                <option value="Promo">
                  Promo
                </option>

              </select>

            </div>

            {/* ========================= */}
            {/* DESKRIPSI */}
            {/* ========================= */}

            <div>

              <label className="mb-2 block font-semibold text-gray-700">
                Deskripsi Singkat
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Tuliskan ringkasan singkat artikel..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

            </div>

            {/* ========================= */}
            {/* GAMBAR / THUMBNAIL */}
            {/* ========================= */}

            <div>

              <label className="mb-2 block font-semibold text-gray-700">
                Gambar Artikel
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
              />

              <p className="mt-2 text-sm text-gray-500">
                Format JPG, JPEG, PNG. Maksimal 5 MB.
              </p>

              {/* PREVIEW */}
              {imagePreview && (
                <div className="mt-5">

                  <p className="mb-2 font-semibold text-gray-700">
                    Preview Gambar
                  </p>

                  <img
                    src={imagePreview}
                    alt="Preview artikel"
                    className="h-64 w-full rounded-xl object-cover shadow-md"
                  />

                </div>
              )}

            </div>

            {/* ========================= */}
            {/* ISI ARTIKEL */}
            {/* ========================= */}

            <div>

              <label className="mb-2 block font-semibold text-gray-700">
                Isi Artikel
              </label>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                placeholder="Tuliskan isi artikel di sini..."
                rows={10}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

            </div>

            {/* ========================= */}
            {/* PENULIS */}
            {/* ========================= */}

            <div>

              <label className="mb-2 block font-semibold text-gray-700">
                Penulis
              </label>

              <input
                type="text"
                value={userName || "Admin"}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
              />

            </div>

            {/* ========================= */}
            {/* ERROR */}
            {/* ========================= */}

            {errorMessage && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-red-600">
                {errorMessage}
              </div>
            )}

            {/* ========================= */}
            {/* BUTTON */}
            {/* ========================= */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/artikel")}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Mengupload & Menyimpan..."
                  : "Publikasikan Artikel"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
}

export default CreateBlog;