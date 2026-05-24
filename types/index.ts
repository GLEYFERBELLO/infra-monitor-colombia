export type Role = "admin" | "gestor" | "ciudadano";
export type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";
export type ReportStatus = "Registrado" | "En revisión" | "Priorizado" | "En atención" | "Solucionado" | "Cerrado";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Report {
  _id: string;
  title: string;
  infrastructureType: string;
  damageType: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  referencePoint?: string;
  latitude?: string;
  longitude?: string;
  riskLevel: RiskLevel;
  status: ReportStatus;
  imageData?: string;
  createdBy?: User | string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export interface DashboardStats {
  totalReports: number;
  highRisk: number;
  criticalRisk: number;
  solved: number;
  byStatus: { _id: string; count: number }[];
  byRisk: { _id: string; count: number }[];
  latestReports: Report[];
}
