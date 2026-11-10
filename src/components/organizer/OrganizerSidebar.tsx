
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Users,
  TicketPercent,
  ChartNoAxesCombined,
  LogOut,
  CalendarCheck,
} from "lucide-react";

const menuItems = [
  { name: "Overview", path: "/organizer/dashboard", icon: LayoutDashboard },
  { name: "My Events", path: "/organizer/events", icon: CalendarDays },
  { name: "Transactions", path: "/organizer/transactions", icon: Receipt },
  { name: "Attendees", path: "/organizer/attendees", icon: Users },
  { name: "Coupons", path: "/organizer/vouchers", icon: TicketPercent },
  { name: "Sales Reports", path: "/organizer/salesreport", icon: ChartNoAxesCombined },
];

export default function OrganizerSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    navigate("/login", { replace: true });
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-700 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
          <CalendarCheck size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide">
            EVENTLY
          </h1>
          <p className="text-xs text-slate-400">
            Organizer Panel
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/organizer/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}
