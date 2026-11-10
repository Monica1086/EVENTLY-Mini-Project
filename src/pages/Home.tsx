
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  CalendarDays,
  ArrowRight,
  Ticket,
  Sparkles,
  Menu,
  X,
  LogOut,
  UserRound,
  Gift,
} from "lucide-react";

interface EventItem {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  ticket_price: number;
  available_seats: number;
    image_url?: string | null;
}

interface LoggedInUser {
  id?: number;
  name: string;
  email?: string;
  role: "customer" | "organizer";
}

export default function Home() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    function readSession() {
      const token = sessionStorage.getItem("evently_token");
      const userText = sessionStorage.getItem("evently_user");

      if (!token || !userText) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = JSON.parse(userText) as LoggedInUser;

        if (
          user &&
          typeof user.name === "string" &&
          (user.role === "customer" || user.role === "organizer")
        ) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    }

    readSession();
    window.addEventListener("focus", readSession);

    return () => {
      window.removeEventListener("focus", readSession);
    };
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/events"
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data event.");
        }

        const result = await response.json();
        setEvents(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil event."
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchEvents();
  }, []);
// SEARCH DEBOUNCE
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [search]);

  const categories = useMemo(
    () => ["Semua", ...new Set(events.map((event) => event.category))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase().trim();

    return events.filter((event) => {
      const matchesSearch = [
        event.title,
        event.description,
        event.category,
        event.location,
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchesCategory =
        selectedCategory === "Semua" ||
        event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, selectedCategory]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatPrice = (price: number) =>
    Number(price) === 0
      ? "Gratis"
      : `Rp ${Number(price).toLocaleString("id-ID")}`;

  function handleLogout() {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    setCurrentUser(null);
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  }

  function renderAccountMenu(mobile = false) {
    const wrapperClass = mobile
      ? "flex flex-col gap-3 border-t border-slate-100 pt-4"
      : "flex items-center gap-3";

    if (!currentUser) {
      return (
        <div className={wrapperClass}>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className={
              mobile
                ? "rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                : "rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            }
          >
            Masuk
          </Link>

          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className={
              mobile
                ? "rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white"
                : "rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
            }
          >
            Daftar
          </Link>
        </div>
      );
    }

    const dashboardPath =
      currentUser.role === "organizer"
        ? "/organizer/dashboard"
        : "/customer/transactions";

    return (
      <div className={wrapperClass}>
        {/* Menu transaksi atau dashboard */}
        
        <Link
          to={dashboardPath}
          onClick={() => setMobileMenuOpen(false)}
          className={
            mobile
              ? "rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-violet-700"
              : "whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
          }
        >
          {currentUser.role === "organizer"
            ? "Dashboard Organizer"
            : "Riwayat Transaksi"}
        </Link>
        {/* My Tickets hanya untuk customer */}
        {currentUser.role === "customer" && (
          <Link
            to="/customer/my-tickets"
            onClick={() => setMobileMenuOpen(false)}
            className={
              mobile
                ? "flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-center text-sm font-semibold text-violet-700"
                : "whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            }
          >
            My Tickets
          </Link>
        )}
        {/* Referral hanya untuk customer */}
        {currentUser.role === "customer" && (
          <Link
            to="/customer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={
              mobile
                ? "flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-center text-sm font-semibold text-violet-700"
                : "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            }
          >
            <Gift size={17} />
            Referral & Points
          </Link>
        )}

        {/* Nama customer diletakkan setelah menu, sebelum Logout */}
        <div
          className={`flex items-center gap-2 ${
            mobile ? "px-1 py-2" : "ml-1 shrink-0"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <UserRound size={18} />
          </span>

          <div className="min-w-0">
            <p className="max-w-40 truncate text-sm font-bold text-slate-900">
              {currentUser.name}
            </p>
            <p className="text-xs capitalize text-slate-500">
              {currentUser.role}
            </p>
          </div>
        </div>
        {/* Menu Profile */}
<Link
  to={
    currentUser.role === "organizer"
      ? "/organizer/profile"
      : "/customer/profile"
  }
  onClick={() => setMobileMenuOpen(false)}
  className={
    mobile
      ? "flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700"
      : "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
  }
>
  <UserRound size={17} />
  Profile
</Link>

        {/* Logout selalu di posisi paling akhir */}
        <button
          type="button"
          onClick={handleLogout}
          className={
            mobile
              ? "flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              : "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
          }
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
              <Ticket size={22} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              EVENT<span className="text-violet-600">LY</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#events"
              className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-violet-600"
            >
              Jelajahi Event
            </a>
            <a
              href="#categories"
              className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-violet-600"
            >
              Kategori
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {renderAccountMenu()}
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-3 border-t border-slate-100 px-5 py-4 md:hidden">
            <a
              href="#events"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Jelajahi Event
            </a>
            <a
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Kategori
            </a>
            {renderAccountMenu(true)}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
              <Sparkles size={16} />
              Temukan pengalaman baru
            </span>

            <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Momen seru
              <br />
              <span className="text-violet-600">dimulai di sini.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Temukan workshop, seminar, konser, dan berbagai acara menarik.
              Pilih pengalaman berikutnya bersama EVENTLY.
            </p>

            <a
              href="#events"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              Jelajahi Event
              <ArrowRight size={18} />
            </a>

            <p className="mt-5 text-sm text-slate-500">
              Satu tempat untuk menemukan acara favoritmu.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-200 to-indigo-100 opacity-60 blur-2xl" />
            <div className="relative rounded-3xl border border-white bg-white p-5 shadow-2xl shadow-violet-100 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Temukan keseruanmu
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Apa rencanamu?
                  </h2>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <CalendarDays size={25} />
                </span>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  document
                    .getElementById("events")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6"
              >
                <label
                  htmlFor="event-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Cari acara
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                  <Search size={20} className="shrink-0 text-slate-400" />
                  <input
                    id="event-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Workshop, musik, seminar..."
                    className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full rounded-xl bg-violet-600 py-3.5 font-semibold text-white transition hover:bg-violet-700"
                >
                  Cari Event
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 rounded-xl bg-violet-50 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <Ticket size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Banyak pilihan acara
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Temukan pengalaman yang sesuai minatmu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section
        id="events"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Explore & discover
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Event pilihan untukmu
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              Temukan acara yang menginspirasi, menambah wawasan, dan
              menciptakan kenangan baru.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {events.length} event tersedia
          </p>
        </div>

        {/* Category filters */}
        <div id="categories" className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-100 p-6"
              >
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="mt-5 h-6 w-3/4 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-8 h-10 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Event belum dapat dimuat</p>
            <p className="mt-2 text-sm">{error}</p>
            <p className="mt-2 text-sm">
              Pastikan backend EVENTLY sedang berjalan.
            </p>
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Search size={25} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Event tidak ditemukan
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Coba kata kunci atau kategori yang berbeda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("Semua");
              }}
              className="mt-5 font-semibold text-violet-600 hover:text-violet-700"
            >
              Hapus filter
            </button>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50"
              >
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-100">
  {event.image_url ? (
    <img
      src={`http://localhost:5000${event.image_url}`}
      alt={event.title}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full items-center justify-center">
      <Ticket size={40} className="text-violet-500" />
    </div>
  )}

  <span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm">
    {event.category}
  </span>
</div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-bold leading-snug text-slate-900 transition group-hover:text-violet-700">
                    {event.title}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {event.description}
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3 text-sm text-slate-500">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-violet-500"
                      />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-500">
                      <CalendarDays
                        size={17}
                        className="mt-0.5 shrink-0 text-violet-500"
                      />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-xs text-slate-500">
                        Harga tiket mulai
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-violet-700">
                        {formatPrice(event.ticket_price)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {event.available_seats} tiket tersedia
                      </p>
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      Detail
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Organizer call to action */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 sm:px-12 sm:py-14">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-300">
                For event organizers
              </p>
              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Punya acara menarik?
                <br />
                Bagikan bersama EVENTLY.
              </h2>
              <p className="mt-3 leading-7 text-slate-300">
                Jadikan acaramu lebih mudah ditemukan oleh orang-orang yang
                tepat.
              </p>
            </div>
           <a
  href="https://wa.me/62817882213"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-400"
>
  Hubungi Kami
  <ArrowRight size={18} />
</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link to="/" className="text-xl font-extrabold text-slate-900">
            EVENT<span className="text-violet-600">LY</span>
          </Link>
          <p className="text-sm text-slate-500">
            Discover events. Create memories.
          </p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} EVENTLY
          </p>
        </div>
      </footer>
    </main>
  );
}
