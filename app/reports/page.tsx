"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getReports } from "@/services/report.service";
import { Report } from "@/types";
import { formatDate, riskClass, statusClass } from "@/lib/utils";
import { AlertTriangle, Eye, FilterX, Inbox, MapPin, Plus, Search, ShieldQuestion } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [status, setStatus] = useState("");

  const hasFilters = Boolean(q.trim() || riskLevel || status);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReports({
        q: q.trim() || undefined,
        riskLevel: riskLevel || undefined,
        status: status || undefined,
      });
      setReports(data ?? []);
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

  const clearFilters = () => {
    setQ("");
    setRiskLevel("");
    setStatus("");
  };

  const locationOf = (report: Report) =>
    [report.city, report.neighborhood, report.address].filter(Boolean).join(", ") ||
    "Sin ubicación registrada";

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

          <Link
            href={user ? "/reports/new" : "/login"}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {user ? "Nuevo reporte" : "Ingresar para reportar"}
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

          <select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)} className="input">
            <option value="">Todos los riesgos</option>
            <option value="Bajo">Bajo</option>
            <option value="Medio">Medio</option>
            <option value="Alto">Alto</option>
            <option value="Crítico">Crítico</option>
          </select>

          <select value={status} onChange={(event) => setStatus(event.target.value)} className="input">
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
          <div className="card mt-8 p-8 text-center text-slate-500">Cargando reportes...</div>
        ) : reports.length === 0 && hasFilters ? (
          <div className="card mt-8 p-8 text-center">
            <Search className="mx-auto text-slate-400" size={38} />
            <h2 className="mt-4 text-xl font-black text-slate-950">
              Ningún reporte coincide con la búsqueda
            </h2>
            <p className="mt-2 text-slate-500">
              Hay reportes registrados, pero ninguno cumple los filtros aplicados. Ajusta la búsqueda o
              limpia los filtros para ver todos los casos.
            </p>
            <button type="button" onClick={clearFilters} className="btn-secondary mt-5 inline-flex items-center gap-2">
              <FilterX size={17} />
              Limpiar filtros
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="card mt-8 p-8 text-center">
            <Inbox className="mx-auto text-green-700" size={38} />
            <h2 className="mt-4 text-xl font-black text-slate-950">No hay reportes registrados</h2>
            <p className="mt-2 text-slate-500">Crea el primer reporte para iniciar el monitoreo preventivo.</p>
            <Link href={user ? "/reports/new" : "/login"} className="btn-primary mt-5 inline-flex">
              {user ? "Crear reporte" : "Ingresar para reportar"}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <article key={report._id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className={`badge ${riskClass(report.riskLevel)}`}>
                      <AlertTriangle size={14} /> {report.riskLevel}
                    </span>
                    <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
                  </div>

                  {!report.riskValidated && (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      <ShieldQuestion size={14} /> Riesgo propuesto, pendiente de validación
                    </p>
                  )}

                  <h2 className="mt-4 line-clamp-2 text-xl font-black text-slate-950">{report.title}</h2>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{report.description}</p>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <strong>Infraestructura:</strong> {report.infrastructureType}
                    </p>
                    <p>
                      <strong>Daño:</strong> {report.damageType}
                    </p>
                    <p className="flex gap-2">
                      <MapPin size={17} className="shrink-0 text-slate-400" />
                      <span>{locationOf(report)}</span>
                    </p>
                    <p className="text-slate-400">{formatDate(report.createdAt)}</p>
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
