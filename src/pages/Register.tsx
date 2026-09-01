import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Cek apakah semua input sudah diisi
    if (!name || !email || !password) {
      alert("Nama, email, dan password harus diisi.");
      return;
    }

    try {
      setIsLoading(true);

      const url =
        "https://zingyyarn-us.backendless.app/api/users/register";

      const response = await axios.post(url, {
        name: name,
        email: email,
        password: password,
      });

      console.log(response.data);

      alert("Register berhasil!");

      // Setelah berhasil register, pindah ke halaman login
      navigate("/login");

    } catch (error) {
      console.log(error);

      alert("Register gagal. Silakan coba kembali.");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* TITLE */}
        <h1 className="text-center text-3xl font-bold text-red-600">
          Register
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Buat akun baru Anda
        </p>

        {/* FORM */}
        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-5"
        >

          {/* NAME */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Nama
            </label>

            <input
              type="text"
              value={name}
              placeholder="Masukkan nama"
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              placeholder="Masukkan email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              placeholder="Masukkan password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? "Loading..." : "Register"}
          </button>

        </form>

        {/* LOGIN */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-red-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </section>
  );
}

export default Register;