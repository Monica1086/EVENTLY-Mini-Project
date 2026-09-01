import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email dan password harus diisi.");
      return;
    }

    try {
      setIsLoading(true);

      const url =
        "https://zingyyarn-us.backendless.app/api/users/login";

      const response = await axios.post(url, {
        login: email,
        password: password,
      });

      // =========================
      // SIMPAN DATA USER
      // =========================
      localStorage.setItem(
        "userToken",
        response.data["user-token"]
      );

      localStorage.setItem(
        "userName",
        response.data.name
      );

      localStorage.setItem(
        "userId",
        response.data.objectId
      );

      // =========================
      // MEMBERITAHU NAVBAR
      // =========================
      window.dispatchEvent(new Event("login"));

      console.log(response.data);

      alert("Login berhasil!");

      // Kembali ke Homepage
      navigate("/");

    } catch (error) {
      console.log(error);
      alert("Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* JUDUL */}
        <h1 className="text-center text-3xl font-bold text-red-600">
          Login
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Masuk ke akun Anda
        </p>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          {/* EMAIL */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              placeholder="Masukkan email"
              onChange={(e) =>
                setEmail(e.target.value)
              }
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
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* BUTTON LOGIN */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:bg-gray-400"
          >
            {isLoading
              ? "Loading..."
              : "Login"}
          </button>

        </form>

        {/* REGISTER */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}

          <Link
            to="/register"
            className="font-semibold text-red-600 hover:underline"
          >
            Daftar
          </Link>
        </p>

      </div>

    </section>
  );
}

export default Login;