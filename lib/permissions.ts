import { ReportStatus, RiskLevel, Role } from "@/types";

/**
 * Reglas de negocio de InfraMonitor Colombia.
 *
 * Este archivo concentra quién puede hacer qué y bajo qué condiciones,
 * de manera que la interfaz y la API apliquen exactamente las mismas reglas.
 */

export const ROLES: Role[] = ["ciudadano", "gestor", "admin"];

export const RISK_LEVELS: RiskLevel[] = ["Bajo", "Medio", "Alto", "Crítico"];

/** Criterio que sustenta cada nivel de riesgo. Se muestra al usuario en el formulario. */
export const RISK_CRITERIA: Record<RiskLevel, { condition: string; examples: string }> = {
  Crítico: {
    condition:
      "El daño puede causar una lesión grave en cualquier momento o deja intransitable un paso obligatorio.",
    examples:
      "Tapa de alcantarilla faltante en un andén transitado, poste caído con cable expuesto, hundimiento abierto en una vía.",
  },
  Alto: {
    condition:
      "El daño puede causar accidentes o lesiones si no se atiende pronto, aunque el paso siga siendo posible.",
    examples: "Hueco profundo en vía principal, grieta amplia en un andén, señal de tránsito caída.",
  },
  Medio: {
    condition: "El daño afecta el uso normal del espacio, sin peligro directo para las personas.",
    examples: "Luminaria apagada en una zona que conserva otra iluminación, obstrucción parcial de un sumidero.",
  },
  Bajo: {
    condition:
      "El deterioro apenas comienza o es estético y puede esperar un mantenimiento programado.",
    examples: "Grieta superficial, pintura desgastada, deterioro leve de mobiliario.",
  },
};

/** Único estado con el que puede nacer un reporte. */
export const INITIAL_STATUS: ReportStatus = "Registrado";

/** Transiciones permitidas. Un estado no listado como destino no se puede asignar. */
export const STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  Registrado: ["En revisión"],
  "En revisión": ["Priorizado", "En atención"],
  Priorizado: ["En atención"],
  "En atención": ["Solucionado"],
  Solucionado: ["Cerrado", "En atención"],
  Cerrado: [],
};

/** Estados que solo puede asignar un administrador. */
export const ADMIN_ONLY_STATUS: ReportStatus[] = ["Cerrado"];

/** Estados que exigen dejar una nota de soporte del cambio. */
export const STATUS_REQUIRING_NOTE: ReportStatus[] = ["En atención", "Solucionado"];

export function isManager(role?: Role) {
  return role === "gestor" || role === "admin";
}

export function isAdmin(role?: Role) {
  return role === "admin";
}

/** Un reporte solo lo edita su autor mientras no haya entrado a revisión. */
export function canEditContent(role: Role | undefined, isOwner: boolean, status: ReportStatus) {
  if (isManager(role)) return true;
  return isOwner && status === INITIAL_STATUS;
}

export function canValidateRisk(role?: Role) {
  return isManager(role);
}

export function canChangeStatus(role?: Role) {
  return isManager(role);
}

export function canDelete(role?: Role) {
  return isAdmin(role);
}

export function canSeeDashboard(role?: Role) {
  return isManager(role);
}

export function canManageUsers(role?: Role) {
  return isAdmin(role);
}

/** Estados a los que puede pasar un reporte, según su estado actual y el rol de quien lo mueve. */
export function allowedNextStatus(current: ReportStatus, role?: Role): ReportStatus[] {
  if (!canChangeStatus(role)) return [];
  return (STATUS_TRANSITIONS[current] || []).filter(
    (next) => !ADMIN_ONLY_STATUS.includes(next) || isAdmin(role)
  );
}

export interface StatusCheckInput {
  current: ReportStatus;
  next: ReportStatus;
  role?: Role;
  riskValidated?: boolean;
  note?: string;
}

/** Valida un cambio de estado. Devuelve null si es válido o el motivo del rechazo. */
export function validateStatusChange({
  current,
  next,
  role,
  riskValidated,
  note,
}: StatusCheckInput): string | null {
  if (!canChangeStatus(role)) {
    return "Solo un gestor o un administrador puede cambiar el estado de un reporte.";
  }

  if (current === next) return null;

  if (ADMIN_ONLY_STATUS.includes(next) && !isAdmin(role)) {
    return `El estado "${next}" solo lo puede asignar un administrador.`;
  }

  const allowed = STATUS_TRANSITIONS[current] || [];

  if (!allowed.includes(next)) {
    return allowed.length
      ? `Un reporte en "${current}" solo puede pasar a: ${allowed.join(", ")}.`
      : `Un reporte en "${current}" ya no admite cambios de estado.`;
  }

  if (next !== "En revisión" && !riskValidated) {
    return "Antes de avanzar el caso, el gestor debe confirmar el nivel de riesgo.";
  }

  if (STATUS_REQUIRING_NOTE.includes(next) && !note?.trim()) {
    return `Para pasar el caso a "${next}" debes registrar una nota que soporte el cambio.`;
  }

  return null;
}
