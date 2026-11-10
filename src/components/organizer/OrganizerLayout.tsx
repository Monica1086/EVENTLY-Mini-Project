
import { Outlet } from "react-router-dom";
import OrganizerSidebar from "./OrganizerSidebar";

export default function OrganizerLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <OrganizerSidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
