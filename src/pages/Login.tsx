
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface LoginResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    name: string;
    email: string;
    role: "customer" | "organizer";
  };
  token?: string;
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const result: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Login gagal. Periksa email dan password."
        );
      }

      if (!result.data || !result.token) {
        throw new Error(
          "Data pengguna atau token tidak ditemukan dari server."
        );
      }

      // Simpan token dan data user untuk sesi tab browser ini.
      sessionStorage.setItem("evently_token", result.token);
      sessionStorage.setItem(
        "evently_user",
        JSON.stringify(result.data)
      );

      // Arahkan user sesuai role.
      if (result.data.role === "organizer") {
        navigate("/organizer/dashboard", { replace: true });
      } else {
        navigate("/", {
          replace: true,
          state: {
            loginSuccess: true,
            user: result.data,
          },
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <CalendarDays size={22} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              EVENTLY
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-700"
          >
            <ArrowLeft size={17} />
            Kembali ke Home
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles size={16} />
            Welcome back to EVENTLY
          </div>

          <h1 className="mt-7 max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 xl:text-6xl">
            Senang melihatmu
            <span className="block text-violet-600">
              kembali.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Masuk ke akunmu untuk menjelajahi acara menarik dan
            melanjutkan pengalaman bersama EVENTLY.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Jelajahi berbagai pilihan event",
              "Temukan pengalaman baru",
              "Kelola aktivitas event dalam satu tempat",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <ShieldCheck size={16} />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-7 text-white shadow-xl shadow-violet-200/60">
            <p className="text-sm font-medium text-violet-100">
              YOUR NEXT EXPERIENCE STARTS HERE
            </p>
            <p className="mt-3 text-2xl font-bold leading-relaxed">
              Temukan event berikutnya dan ciptakan kenangan baru.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Welcome back
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                Login
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masukkan email dan password untuk masuk ke akunmu.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={100}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Lihat password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>
 {/* Forgot Password */}
              <div className="flex justify-end -mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-violet-600 transition hover:text-violet-800 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memeriksa akun..." : "Login"}
              </button>
            </form>
                    
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-bold text-violet-700 hover:text-violet-900"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} EVENTLY. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
