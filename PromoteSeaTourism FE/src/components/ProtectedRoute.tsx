import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

type Props = { roles?: string[] };

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles && !roles.some((r) => hasRole(r)))
    return <Navigate to="/" replace />;

  return <Outlet />;
}
