
import { Navigate, Outlet } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "organizer";
}

interface ProtectedRouteProps {
  allowedRoles?: User["role"][];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const token = sessionStorage.getItem("evently_token");
  const storedUser = sessionStorage.getItem("evently_user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user: User;

  try {
    user = JSON.parse(storedUser) as User;
  } catch {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    return <Navigate to="/login" replace />;
  }

  if (
    !user ||
    !Number.isInteger(user.id) ||
    !["customer", "organizer"].includes(user.role)
  ) {
    sessionStorage.removeItem("evently_token");
    sessionStorage.removeItem("evently_user");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
