"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReportCard from "@/components/ReportCard";
import { getReports } from "@/services/report.service";
import { Report } from "@/types";
import { Plus } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [q, setQ] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => setReports(await getReports({ q, riskLevel, status }));

  useEffect(() => { load().catch(console.error); }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Reportes</h1>
            <p className="mt-2 text-slate-500">Consulta y filtra afectaciones registradas.</p>
          </div>
          <Link href="/reports/new" className="btn-primary flex items-center justify-center gap-2"><Plus size={18} /> Nuevo reporte</Link>
        </div>

        <div className="card mt-6 grid gap-3 p-4 md:grid-cols-4">
          <input className="input" placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="input" value={riskLevel} onChange={(e)=>setRiskLevel(e.target.value)}>
            <option value="">Todos los riesgos</option><option>Bajo</option><option>Medio</option><option>Alto</option><option>Crítico</option>
          </select>
          <select className="input" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Todos los estados</option><option>Registrado</option><option>En revisión</option><option>Priorizado</option><option>En atención</option><option>Solucionado</option><option>Cerrado</option>
          </select>
          <button className="btn-primary" onClick={load}>Filtrar</button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reports.map((report) => <ReportCard key={report._id} report={report} />)}
        </div>
        {!reports.length && <div className="card mt-8 p-8 text-center text-slate-500">No hay reportes registrados.</div>}
      </section>
    </main>
  );
}
