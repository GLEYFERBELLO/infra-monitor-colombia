"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types";
import { ShieldAlert } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Si se indica, solo estos roles pueden ver el contenido. */
  roles?: Role[];
}

export default function Protected({ children, roles }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando sesión...
      </div>
    );
  }

  if (!user) return null;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto text-orange-500" size={40} />
          <h1 className="mt-4 text-2xl font-black text-slate-950">Acceso restringido</h1>
          <p className="mt-2 text-slate-500">
            Esta sección está disponible para los roles: {roles.join(", ")}. Tu cuenta tiene el rol{" "}
            <b>{user.role}</b>.
          </p>
          <Link href="/reports" className="btn-primary mt-5 inline-flex">
            Ir a reportes
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
