"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";
import { createReport } from "@/services/report.service";
import { RiskLevel } from "@/types";

const initial = {
  title: "",
  infrastructureType: "Vía pública",
  damageType: "Deterioro",
  description: "",
  city: "Bogotá D.C.",
  neighborhood: "",
  address: "",
  referencePoint: "",
  latitude: "",
  longitude: "",
  riskLevel: "Medio" as RiskLevel,
  imageData: "",
};

export default function NewReportPage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const change = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const imageToBase64 = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Solo se permiten imágenes");
    if (file.size > 1_000_000) return toast.error("Para este prototipo usa imágenes menores a 1MB");
    const reader = new FileReader();
    reader.onload = () => change("imageData", String(reader.result));
    reader.readAsDataURL(file);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("El navegador no permite geolocalización");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        change("latitude", String(position.coords.latitude));
        change("longitude", String(position.coords.longitude));
        toast.success("Ubicación agregada");
      },
      () => toast.error("No fue posible obtener la ubicación")
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const report = await createReport(form);
      toast.success("Reporte creado correctamente");
      router.push(`/reports/${report._id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "No fue posible crear el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-950">Nuevo reporte</h1>
            <p className="mt-2 text-slate-500">Registra una afectación visible en infraestructura pública o comunitaria.</p>
          </div>

          <form onSubmit={submit} className="card p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2"><label className="label">Título del reporte</label><input className="input" value={form.title} onChange={(e)=>change("title", e.target.value)} required placeholder="Ej: Andén deteriorado cerca al parque" /></div>
              <div><label className="label">Tipo de infraestructura</label><select className="input" value={form.infrastructureType} onChange={(e)=>change("infrastructureType", e.target.value)}><option>Vía pública</option><option>Puente peatonal</option><option>Parque</option><option>Luminaria</option><option>Alcantarillado</option><option>Colegio</option><option>Salón comunal</option><option>Andén</option></select></div>
              <div><label className="label">Tipo de daño</label><select className="input" value={form.damageType} onChange={(e)=>change("damageType", e.target.value)}><option>Deterioro</option><option>Grieta</option><option>Hundimiento</option><option>Falla eléctrica</option><option>Obstrucción</option><option>Riesgo visible</option><option>Daño estructural</option></select></div>
              <div className="md:col-span-2"><label className="label">Descripción</label><textarea className="input min-h-32" value={form.description} onChange={(e)=>change("description", e.target.value)} required placeholder="Describe el problema de forma clara" /></div>
              <div><label className="label">Ciudad</label><input className="input" value={form.city} onChange={(e)=>change("city", e.target.value)} required /></div>
              <div><label className="label">Barrio / localidad</label><input className="input" value={form.neighborhood} onChange={(e)=>change("neighborhood", e.target.value)} required /></div>
              <div><label className="label">Dirección</label><input className="input" value={form.address} onChange={(e)=>change("address", e.target.value)} required /></div>
              <div><label className="label">Punto de referencia</label><input className="input" value={form.referencePoint} onChange={(e)=>change("referencePoint", e.target.value)} /></div>
              <div><label className="label">Nivel de riesgo</label><select className="input" value={form.riskLevel} onChange={(e)=>change("riskLevel", e.target.value)}><option>Bajo</option><option>Medio</option><option>Alto</option><option>Crítico</option></select></div>
              <div><label className="label">Evidencia fotográfica</label><input className="input" type="file" accept="image/*" onChange={imageToBase64} /></div>
              <div><label className="label">Latitud</label><input className="input" value={form.latitude} onChange={(e)=>change("latitude", e.target.value)} /></div>
              <div><label className="label">Longitud</label><input className="input" value={form.longitude} onChange={(e)=>change("longitude", e.target.value)} /></div>
            </div>

            {form.imageData && <img src={form.imageData} alt="Vista previa" className="mt-6 max-h-80 w-full rounded-3xl object-cover" />}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={useMyLocation} className="btn-secondary">Usar mi ubicación</button>
              <button className="btn-primary" disabled={loading}>{loading ? "Guardando..." : "Guardar reporte"}</button>
            </div>
          </form>
        </section>
      </main>
    </Protected>
  );
}
