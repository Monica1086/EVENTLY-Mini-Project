import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // =====================================
  // MENGECEK USER YANG SEDANG LOGIN
  // =====================================
  useEffect(() => {
    const updateUser = () => {
      const name = localStorage.getItem("userName");
      setUserName(name);
    };

    // Cek saat Navbar pertama kali dibuka
    updateUser();

    // Dengarkan event LOGIN
    window.addEventListener("login", updateUser);

    // Dengarkan event LOGOUT
    window.addEventListener("logout", updateUser);

    // Bersihkan event listener
    return () => {
      window.removeEventListener("login", updateUser);
      window.removeEventListener("logout", updateUser);
    };
  }, []);

  // =====================================
  // LOGOUT
  // =====================================
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");

    // Update Navbar langsung
    setUserName(null);

    // Tutup menu mobile
    setIsMenuOpen(false);

    // Beritahu komponen lain bahwa user logout
    window.dispatchEvent(new Event("logout"));

    navigate("/login");
  };

  // =====================================
  // MENUTUP MENU MOBILE
  // =====================================
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-red-600">

      <div className="mx-auto max-w-7xl px-6 py-4">

        {/* =====================================
            DESKTOP & TOMBOL HAMBURGER
        ====================================== */}

        <div className="flex items-center justify-end">

          {/* =====================================
              MENU DESKTOP
          ====================================== */}

          <div className="hidden items-center gap-8 text-base font-semibold text-white lg:flex">

            <Link
              to="/"
              className="transition hover:text-gray-200"
            >
              Beranda
            </Link>

            <Link
              to="/about"
              className="transition hover:text-gray-200"
            >
              Tentang Kami
            </Link>

            <Link
              to="/product"
              className="transition hover:text-gray-200"
            >
              Produk
            </Link>

            <Link
              to="/artikel"
              className="transition hover:text-gray-200"
            >
              Artikel
            </Link>

            <Link
              to="/location"
              className="transition hover:text-gray-200"
            >
              Lokasi
            </Link>

            <Link
              to="/teams"
              className="transition hover:text-gray-200"
            >
              Tim Kami
            </Link>

            {/* LOGIN DESKTOP */}

            {userName ? (
              <>
                <span>
                  Halo, {userName}
                </span>

                <button
                  onClick={handleLogout}
                  className="cursor-pointer rounded-lg bg-white px-4 py-2 text-red-600 transition hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="transition hover:text-gray-200"
                >
                  Masuk
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-white px-4 py-2 text-red-600 transition hover:bg-gray-100"
                >
                  Daftar
                </Link>
              </>
            )}

          </div>

          {/* =====================================
              HAMBURGER MOBILE
          ====================================== */}

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-3xl text-white lg:hidden"
            aria-label="Buka menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* =====================================
            MENU MOBILE
        ====================================== */}

        {isMenuOpen && (
          <div className="mt-4 border-t border-red-500 pt-4 lg:hidden">

            <div className="flex flex-col gap-1 text-base font-semibold text-white">

              {/* BERANDA */}

              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 transition hover:bg-red-700"
              >
                Beranda
              </Link>

              {/* TENTANG */}

              <Link
                to="/about"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 transition hover:bg-red-700"
              >
                Tentang Kami
              </Link>

              {/* PRODUK */}

              <Link
                to="/product"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 transition hover:bg-red-700"
              >
                Produk
              </Link>

              {/* ARTIKEL */}

              <Link
                to="/artikel"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 transition hover:bg-red-700"
              >
                Artikel
              </Link>

              {/* LOKASI */}

              <Link
                to="/location"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 transition hover:bg-red-700"
              >
                Lokasi
              </Link>

              {/* TIM KAMI */}

              <Link
                to="/teams"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 transition hover:bg-red-700"
              >
                Tim Kami
              </Link>

              {/* =================================
                  LOGIN / LOGOUT MOBILE
              ================================== */}

              <div className="mt-3 border-t border-red-500 pt-3">

                {userName ? (
                  <>
                    {/* NAMA USER */}

                    <div className="px-4 py-3">
                      Halo, {userName}
                    </div>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg bg-white px-4 py-3 text-left text-red-600 transition hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 px-4">

                    {/* MASUK */}

                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex-1 rounded-lg border border-white px-4 py-3 text-center transition hover:bg-red-700"
                    >
                      Masuk
                    </Link>

                    {/* DAFTAR */}

                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="flex-1 rounded-lg bg-white px-4 py-3 text-center text-red-600 transition hover:bg-gray-100"
                    >
                      Daftar
                    </Link>

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;