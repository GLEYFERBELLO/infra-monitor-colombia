"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { AlertTriangle, Eye, Plus, Search } from "lucide-react";

type Report = {
  _id: string;
  title: string;
  infrastructureType: string;
  damageType: string;
  description: string;
  location: string;
  riskLevel: "Bajo" | "Medio" | "Alto" | "Crítico";
  status: string;
  imageUrl?: string;
  createdAt: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (q.trim()) params.set("q", q.trim());
      if (riskLevel) params.set("riskLevel", riskLevel);
      if (status) params.set("status", status);

      const response = await axios.get(`/api/reports?${params.toString()}`);
      setReports(response.data.reports ?? []);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [q, riskLevel, status]);

  useEffect(() => {
    load();
  }, [load]);

  const getRiskClass = (risk: Report["riskLevel"]) => {
    if (risk === "Crítico") return "bg-red-50 text-red-700 border-red-200";
    if (risk === "Alto") return "bg-orange-50 text-orange-700 border-orange-200";
    if (risk === "Medio") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="badge bg-green-50 text-green-700">Gestión de reportes</p>
            <h1 className="mt-4 text-3xl font-black text-slate-950 md:text-5xl">
              Reportes registrados
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Consulta las afectaciones registradas, revisa su nivel de riesgo y realiza seguimiento preventivo.
            </p>
          </div>

          <Link href="/reports/new" className="btn-primary inline-flex items-center justify-center gap-2">
            <Plus size={18} />
            Nuevo reporte
          </Link>
        </div>

        <div className="card mt-8 grid gap-4 p-5 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar por título, ubicación o descripción"
              className="input pl-11"
            />
          </div>

          <select
            value={riskLevel}
            onChange={(event) => setRiskLevel(event.target.value)}
            className="input"
          >
            <option value="">Todos los riesgos</option>
            <option value="Bajo">Bajo</option>
            <option value="Medio">Medio</option>
            <option value="Alto">Alto</option>
            <option value="Crítico">Crítico</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="input"
          >
            <option value="">Todos los estados</option>
            <option value="Registrado">Registrado</option>
            <option value="En revisión">En revisión</option>
            <option value="Priorizado">Priorizado</option>
            <option value="En atención">En atención</option>
            <option value="Solucionado">Solucionado</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>

        {loading ? (
          <div className="mt-8 card p-8 text-center text-slate-500">
            Cargando reportes...
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-8 card p-8 text-center">
            <AlertTriangle className="mx-auto text-green-700" size={38} />
            <h2 className="mt-4 text-xl font-black text-slate-950">
              No hay reportes registrados
            </h2>
            <p className="mt-2 text-slate-500">
              Crea el primer reporte para iniciar el monitoreo preventivo.
            </p>
            <Link href="/reports/new" className="btn-primary mt-5 inline-flex">
              Crear reporte
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <article key={report._id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getRiskClass(report.riskLevel)}`}>
                      {report.riskLevel}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {report.status}
                    </span>
                  </div>

                  <h2 className="mt-4 line-clamp-2 text-xl font-black text-slate-950">
                    {report.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                    {report.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <strong>Infraestructura:</strong> {report.infrastructureType}
                    </p>
                    <p>
                      <strong>Daño:</strong> {report.damageType}
                    </p>
                    <p>
                      <strong>Ubicación:</strong> {report.location}
                    </p>
                  </div>

                  <Link
                    href={`/reports/${report._id}`}
                    className="btn-secondary mt-5 inline-flex w-full items-center justify-center gap-2"
                  >
                    <Eye size={17} />
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}