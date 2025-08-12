import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const { isLoggedIn } = useSelector((s) => s.user);
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}