import { api } from "./api";
import { DashboardStats, Report, ReportStatus, RiskLevel } from "@/types";

export async function getReports(params?: { q?: string; riskLevel?: string; status?: string }) {
  const { data } = await api.get<{ ok: boolean; reports: Report[] }>("/reports", { params });
  return data.reports;
}

export async function getReport(id: string) {
  const { data } = await api.get<{ ok: boolean; report: Report }>(`/reports/${id}`);
  return data.report;
}

export async function createReport(payload: Partial<Report>) {
  const { data } = await api.post<{ ok: boolean; report: Report }>("/reports", payload);
  return data.report;
}

export type ReportUpdate = Partial<Report> & {
  /** Nota que soporta el cambio de estado; queda en la bitácora del reporte. */
  note?: string;
  /** Marca la confirmación del nivel de riesgo por parte de un gestor. */
  validateRisk?: boolean;
};

export async function updateReport(id: string, payload: ReportUpdate) {
  const { data } = await api.patch<{ ok: boolean; report: Report }>(`/reports/${id}`, payload);
  return data.report;
}

export async function changeStatus(id: string, status: ReportStatus, note: string) {
  return updateReport(id, { status, note });
}

export async function confirmRisk(id: string, riskLevel: RiskLevel) {
  return updateReport(id, { riskLevel, validateRisk: true });
}

export async function deleteReport(id: string) {
  const { data } = await api.delete<{ ok: boolean; message: string }>(`/reports/${id}`);
  return data;
}

export async function getDashboard() {
  const { data } = await api.get<{ ok: boolean; stats: DashboardStats }>("/dashboard");
  return data.stats;
}
