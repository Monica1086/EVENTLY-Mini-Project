import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userToken = localStorage.getItem("userToken");

  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;