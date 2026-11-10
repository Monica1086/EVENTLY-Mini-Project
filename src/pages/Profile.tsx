
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Gift,
  Coins,
  ArrowLeft,
  LogOut,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "organizer";
  profile_picture: string | null;
  referral_code: string | null;
  points: number;
  created_at: string;
}

const API_URL = "http://localhost:5000";

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("evently_token");

  const isOrganizer = profile?.role === "organizer";

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // =========================
  // GET PROFILE
  // =========================
  const fetchProfile = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data profil.");
      }

      const data: ProfileData = result.data;

      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

// =========================
// SELECT PROFILE PHOTO
// =========================
const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setMessage("");
  setError("");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    setError("Foto harus berformat JPG, PNG, atau WEBP.");
    e.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setError("Ukuran foto maksimal 2 MB.");
    e.target.value = "";
    return;
  }

  setSelectedPhoto(file);
  setPhotoPreview(URL.createObjectURL(file));
};

// =========================
// UPLOAD PROFILE PHOTO
// =========================
const handleUploadPhoto = async () => {
  if (!selectedPhoto) {
    setError("Silakan pilih foto terlebih dahulu.");
    return;
  }

  try {
    setUploadingPhoto(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("photo", selectedPhoto);

    const response = await fetch(`${API_URL}/api/profile/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengunggah foto.");
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            profile_picture: result.data.profile_picture,
          }
        : prev
    );

    setSelectedPhoto(null);
    setPhotoPreview(null);

    setMessage(result.message || "Foto profil berhasil diperbarui.");
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Terjadi kesalahan."
    );
  } finally {
    setUploadingPhoto(false);
  }
};

  // =========================
  // UPDATE PROFILE
  // =========================
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui profil.");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: result.data?.name ?? name.trim(),
              email: result.data?.email ?? email.trim(),
              phone: result.data?.phone ?? phone.trim(),
            }
          : prev
      );

      // Update cached user information if available
      const savedUser = sessionStorage.getItem("evently_user");

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          sessionStorage.setItem(
            "evently_user",
            JSON.stringify({
              ...user,
              name: name.trim(),
              email: email.trim(),
            })
          );
        } catch {
          // Ignore invalid cached user data
        }
      }

      setMessage(result.message || "Profil berhasil diperbarui.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua kolom password wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/api/profile/password`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(result.message || "Password berhasil diubah.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    navigate("/login");
  };

  const dashboardPath = isOrganizer
    ? "/organizer/dashboard"
    : "/customer/dashboard";

  const formatPoints = (points: number) => {
    return new Intl.NumberFormat("id-ID").format(points || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Profil tidak dapat dimuat
          </h2>
          <p className="text-slate-500 mb-5">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-violet-600 text-white px-5 py-2.5 rounded-xl hover:bg-violet-700"
          >
            Coba Lagi
          </button>
          <button
            onClick={handleLogout}
            className="block mx-auto mt-4 text-sm text-slate-500 hover:text-red-600"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to={dashboardPath}
            className="text-2xl font-bold text-violet-700"
          >
            EVENTLY
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={dashboardPath}
              className="hidden sm:flex items-center gap-2 text-sm text-slate-600 hover:text-violet-700"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="text-sm text-violet-600 font-semibold mb-2">
            ACCOUNT SETTINGS
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            My Profile
          </h1>

          <p className="text-slate-500 mt-2">
            Kelola informasi pribadi dan keamanan akun EVENTLY kamu.
          </p>
        </div>

        {/* ALERT MESSAGE */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* PROFILE CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col items-center text-center">
  {/* PROFILE PHOTO */}
  <div className="w-28 h-28 rounded-full bg-violet-100 flex items-center justify-center mb-3 overflow-hidden border-4 border-white shadow-md">
    {photoPreview || profile.profile_picture ? (
      <img
        src={
          photoPreview ||
          (profile.profile_picture!.startsWith("http")
            ? profile.profile_picture!
            : `${API_URL}${profile.profile_picture}`)
        }
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <User size={45} className="text-violet-600" />
    )}
  </div>

  {/* SELECT PHOTO */}
  <label
    htmlFor="profile-photo"
    className="cursor-pointer text-sm font-semibold text-violet-700 hover:text-violet-900"
  >
    Pilih Foto Profil
  </label>

  <input
    id="profile-photo"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="hidden"
    onChange={handlePhotoSelect}
  />

  <p className="text-xs text-slate-400 mt-1">
    JPG, PNG, WEBP (maks. 2 MB)
  </p>

  {/* PHOTO PREVIEW ACTIONS */}
  {selectedPhoto && (
    <div className="mt-3 flex flex-col items-center gap-2">
      <p className="text-xs text-slate-500">
        {selectedPhoto.name}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUploadPhoto}
          disabled={uploadingPhoto}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
        >
          {uploadingPhoto ? "Mengunggah..." : "Simpan Foto"}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPhoto(null);
            setPhotoPreview(null);

            const input = document.getElementById(
              "profile-photo"
            ) as HTMLInputElement | null;

            if (input) input.value = "";
          }}
          disabled={uploadingPhoto}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300"
        >
          Batal
        </button>
      </div>
    </div>
  )}

  {/* PROFILE INFORMATION */}
  <h2 className="text-xl font-bold text-slate-800 mt-2">
    {profile.name}
  </h2>

  <p className="text-sm text-slate-500 mt-1">
    {profile.email}
  </p>

  <span className="mt-4 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold uppercase">
    {profile.role}
  </span>
</div>

              <div className="border-t border-slate-100 mt-6 pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-medium text-slate-700">
                    #{profile.id}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bergabung</span>
                  <span className="font-medium text-slate-700">
                    {new Date(profile.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER REFERRAL CARD */}
            {!isOrganizer && (
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-2 mb-5">
                  <Gift size={21} />
                  <h3 className="font-semibold">Referral & Rewards</h3>
                </div>

                <p className="text-violet-100 text-sm">
                  Referral Code
                </p>

                <div className="flex items-center justify-between bg-white/15 rounded-xl p-3 mt-2">
                  <span className="font-bold tracking-wider">
                    {profile.referral_code || "-"}
                  </span>
                  <button
                    onClick={() => {
                      if (profile.referral_code) {
                        navigator.clipboard.writeText(
                          profile.referral_code
                        );
                        setMessage("Referral code berhasil disalin.");
                        setError("");
                      }
                    }}
                    className="text-xs bg-white text-violet-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-violet-50"
                  >
                    Salin
                  </button>
                </div>

                <div className="border-t border-white/20 mt-5 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-100 text-sm">
                        Total Points
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {formatPoints(profile.points)}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                      <Coins size={26} />
                    </div>
                  </div>

                  <p className="text-xs text-violet-100 mt-3">
                    Gunakan points untuk mendapatkan potongan harga
                    transaksi EVENTLY.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* PERSONAL INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                  <User className="text-violet-600" size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Personal Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Perbarui informasi akun kamu.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Masukkan email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nomor Handphone
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={20}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-60"
                  >
                    <Save size={18} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ShieldCheck className="text-amber-600" size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Change Password
                  </h2>
                  <p className="text-sm text-slate-500">
                    Pastikan password baru kamu aman.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Saat Ini
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Masukkan password saat ini"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Baru
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Minimal 8 karakter"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konfirmasi Password Baru
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-900 disabled:opacity-60"
                  >
                    <Lock size={17} />
                    {changingPassword
                      ? "Memproses..."
                      : "Ubah Password"}
                  </button>
                </div>
              </form>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
