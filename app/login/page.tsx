"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "No fue posible iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto flex max-w-xl px-4 py-16">
        <form onSubmit={submit} className="card w-full p-8">
          <h1 className="text-3xl font-black text-slate-950">Iniciar sesión</h1>
          <p className="mt-2 text-slate-500">Accede para registrar y gestionar reportes.</p>
          <div className="mt-8 space-y-5">
            <div><label className="label">Correo electrónico</label><input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
            <div><label className="label">Contraseña</label><input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">¿No tienes cuenta? <Link href="/register" className="font-bold text-green-700">Crear cuenta</Link></p>
        </form>
      </section>
    </main>
  );
}
