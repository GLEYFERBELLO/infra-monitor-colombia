"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-black text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600 text-white">
            <ShieldCheck size={22} />
          </span>
          <span>InfraMonitor</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/dashboard" className="hover:text-green-700">Dashboard</Link>
          <Link href="/reports" className="hover:text-green-700">Reportes</Link>
          <Link href="/api-docs" className="hover:text-green-700">Swagger</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700 md:inline-flex">
                {user.name}
              </span>
              <button onClick={logout} className="btn-secondary flex items-center gap-2 py-2 text-sm">
                <LogOut size={16} /> Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary py-2 text-sm">Ingresar</Link>
              <Link href="/register" className="btn-primary py-2 text-sm">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
