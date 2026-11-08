"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";
import StatCard from "@/components/StatCard";
import ReportCard from "@/components/ReportCard";
import { getDashboard } from "@/services/report.service";
import { DashboardStats } from "@/types";
import { AlertOctagon, AlertTriangle, CheckCircle2, ClipboardList, ShieldQuestion } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboard().then(setStats).catch(console.error);
  }, []);

  return (
    <Protected roles={["gestor", "admin"]}>
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-950">Dashboard</h1>
            <p className="mt-2 text-slate-500">Indicadores generales del monitoreo preventivo.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total reportes" value={stats?.totalReports ?? 0} description="Casos registrados" icon={ClipboardList} />
            <StatCard title="Riesgo alto" value={stats?.highRisk ?? 0} description="Requieren revisión" icon={AlertTriangle} />
            <StatCard title="Riesgo crítico" value={stats?.criticalRisk ?? 0} description="Prioridad máxima" icon={AlertOctagon} />
            <StatCard title="Solucionados" value={stats?.solved ?? 0} description="Casos con evidencia de arreglo" icon={CheckCircle2} />
            <StatCard title="Riesgo sin validar" value={stats?.pendingRiskValidation ?? 0} description="Esperan revisión del gestor" icon={ShieldQuestion} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="font-black text-slate-950">Reportes por estado</h2>
              <div className="mt-5 space-y-3">
                {(stats?.byStatus || []).map((item) => <div key={item._id} className="flex justify-between rounded-2xl bg-slate-50 p-3 text-sm"><span>{item._id}</span><b>{item.count}</b></div>)}
                {!stats?.byStatus?.length && <p className="text-sm text-slate-500">Aún no hay datos.</p>}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-black text-slate-950">Reportes por riesgo</h2>
              <div className="mt-5 space-y-3">
                {(stats?.byRisk || []).map((item) => <div key={item._id} className="flex justify-between rounded-2xl bg-slate-50 p-3 text-sm"><span>{item._id}</span><b>{item.count}</b></div>)}
                {!stats?.byRisk?.length && <p className="text-sm text-slate-500">Aún no hay datos.</p>}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-black text-slate-950">Últimos reportes</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {(stats?.latestReports || []).map((report) => <ReportCard key={report._id} report={report} />)}
            </div>
          </div>
        </section>
      </main>
    </Protected>
  );
}
