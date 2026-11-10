
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (name.trim().length < 2) {
      setError("Nama harus terdiri dari minimal 2 karakter.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password harus terdiri dari 8–72 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password,
  referral_code: referralCode.trim().toUpperCase() || null,
}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Registrasi gagal. Silakan coba kembali."
        );
      }

      setSuccess(
        "Registrasi berhasil! Akun EVENTLY kamu sudah dibuat."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setReferralCode("");

      // Kembali ke Home setelah pesan sukses ditampilkan.
      // Fitur login akan kita buat pada tahap berikutnya.
      window.setTimeout(() => {
        navigate("/");
      }, 1800);
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
        {/* Bagian kiri: informasi EVENTLY */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles size={16} />
            Discover experiences that matter
          </div>

          <h1 className="mt-7 max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 xl:text-6xl">
            Temukan acara.
            <span className="block text-violet-600">
              Ciptakan kenangan.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Bergabunglah dengan EVENTLY untuk menemukan acara
            menarik, memperluas wawasan, dan mendapatkan pengalaman
            baru bersama komunitas.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Temukan event sesuai minatmu",
              "Jelajahi pengalaman dan komunitas baru",
              "Akses informasi event dalam satu tempat",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <CheckCircle2 size={16} />
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
              Satu akun untuk memulai perjalanan event kamu.
            </p>
          </div>
        </div>

        {/* Bagian kanan: formulir Register */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Create your account
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                Buat Akun
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Daftar sekarang dan mulai temukan event favoritmu.
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

            {success && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama Lengkap
                </label>

                <div className="relative">
                  <UserRound
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Masukkan ulang password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan konfirmasi password"
                        : "Lihat konfirmasi password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Membuat akun..." : "Create Account"}
              </button>
                      
<div>
  <label
    htmlFor="referralCode"
    className="mb-2 block text-sm font-semibold text-slate-700"
  >
    Kode Referral (Opsional)
  </label>

  <input
    id="referralCode"
    name="referral_code"
    type="text"
    maxLength={20}
    autoComplete="off"
    value={referralCode}
    onChange={(event) =>
      setReferralCode(event.target.value.toUpperCase())
    }
    placeholder="Masukkan kode referral teman"
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
  />

  <p className="mt-2 text-xs leading-5 text-slate-500">
    Punya kode referral dari teman? Masukkan di sini.
    Jika tidak punya, kamu boleh mengosongkannya.
  </p>
</div>

              <p className="text-center text-sm leading-6 text-slate-500">
                Dengan mendaftar, kamu membuat akun customer EVENTLY.
              </p>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-bold text-violet-700 hover:text-violet-900"
                >
                  Login
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
