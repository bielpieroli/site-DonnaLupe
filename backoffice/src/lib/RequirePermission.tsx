import { Navigate, Outlet } from "react-router-dom";
import { useHasPermission } from "@/contexts/AuthContext";

export default function RequirePermission({ resource }: { resource: string }) {
  const allowed = useHasPermission(resource, "read");
  if (!allowed) return <Navigate to="/home" replace />;
  return <Outlet />;
}
