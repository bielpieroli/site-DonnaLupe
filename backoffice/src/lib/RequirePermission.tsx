import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RequirePermission({ resource }: { resource: string }) {
  const location = useLocation();
  const { ensurePermission } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    setAllowed(null);
    ensurePermission(resource, "read")
      .then((ok) => {
        if (active) setAllowed(ok);
      })
      .catch(() => {
        if (active) setAllowed(false);
      });

    return () => {
      active = false;
    };
  }, [ensurePermission, resource, location.pathname]);

  if (allowed === null) {
    return <p className="py-12 text-center text-muted">Verificando permissões...</p>;
  }

  if (!allowed) return <Navigate to="/home" replace />;
  return <Outlet />;
}
