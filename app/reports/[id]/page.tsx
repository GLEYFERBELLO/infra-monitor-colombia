"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { deleteReport, getReport, updateReport } from "@/services/report.service";
import { Report, ReportStatus } from "@/types";
import { formatDate, riskClass, statusClass } from "@/lib/utils";
import { MapPin, Trash2 } from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<ReportStatus>("Registrado");

  useEffect(() => {
    getReport(params.id).then((data) => { setReport(data); setStatus(data.status); }).catch(() => toast.error("No fue posible consultar el reporte"));
  }, [params.id]);

  const saveStatus = async () => {
    try {
      const updated = await updateReport(params.id, { status });
      setReport(updated);
      toast.success("Estado actualizado");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "No fue posible actualizar");
    }
  };

  const remove = async () => {
    if (!confirm("¿Eliminar este reporte?")) return;
    try {
      await deleteReport(params.id);
      toast.success("Reporte eliminado");
      router.push("/reports");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "No fue posible eliminar");
    }
  };

  if (!report) {
    return <main className="min-h-screen bg-slate-50"><Navbar /><div className="p-10 text-center text-slate-500">Cargando reporte...</div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="card overflow-hidden">
          {report.imageData ? <img src={report.imageData} alt={report.title} className="h-96 w-full object-cover" /> : <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-400">Sin imagen</div>}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${riskClass(report.riskLevel)}`}>Riesgo {report.riskLevel}</span>
              <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
            </div>
            <h1 className="mt-5 text-3xl font-black text-slate-950">{report.title}</h1>
            <p className="mt-4 text-slate-600">{report.description}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5"><b>Tipo de infraestructura</b><p className="mt-1 text-slate-500">{report.infrastructureType}</p></div>
              <div className="rounded-3xl bg-slate-50 p-5"><b>Tipo de daño</b><p className="mt-1 text-slate-500">{report.damageType}</p></div>
              <div className="rounded-3xl bg-slate-50 p-5"><b>Ubicación</b><p className="mt-1 flex gap-2 text-slate-500"><MapPin size={18} /> {report.city}, {report.neighborhood}, {report.address}</p></div>
              <div className="rounded-3xl bg-slate-50 p-5"><b>Fecha</b><p className="mt-1 text-slate-500">{formatDate(report.createdAt)}</p></div>
              {(report.latitude || report.longitude) && <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2"><b>Coordenadas</b><p className="mt-1 text-slate-500">{report.latitude}, {report.longitude}</p></div>}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 p-5">
              <label className="label">Actualizar estado del reporte</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select className="input" value={status} onChange={(e)=>setStatus(e.target.value as ReportStatus)}>
                  <option>Registrado</option><option>En revisión</option><option>Priorizado</option><option>En atención</option><option>Solucionado</option><option>Cerrado</option>
                </select>
                <button className="btn-primary" onClick={saveStatus}>Guardar estado</button>
                <button className="btn-secondary flex items-center justify-center gap-2 text-red-600" onClick={remove}><Trash2 size={18} /> Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
