"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { canManageUsers, canSeeDashboard } from "@/lib/permissions";
import { ShieldCheck, LogOut, Menu, X } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  ciudadano: "Ciudadano",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    ...(canSeeDashboard(user?.role) ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    { href: "/reports", label: "Reportes" },
    ...(canManageUsers(user?.role) ? [{ href: "/admin/usuarios", label: "Usuarios" }] : []),
    { href: "/api-docs", label: "Swagger" },
  ];

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
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-700">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                {user.name} · {ROLE_LABEL[user.role] ?? user.role}
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

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 hover:bg-slate-50 hover:text-green-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
            {user ? (
              <>
                <span className="rounded-full bg-green-50 px-3 py-2 text-center text-xs font-bold text-green-700">
                  {user.name} · {ROLE_LABEL[user.role] ?? user.role}
                </span>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="btn-secondary flex items-center justify-center gap-2 py-2 text-sm"
                >
                  <LogOut size={16} /> Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary py-2 text-center text-sm">
                  Ingresar
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary py-2 text-center text-sm">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
