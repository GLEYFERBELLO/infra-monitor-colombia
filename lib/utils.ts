export function formatDate(date?: string) {
  if (!date) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export function riskClass(risk: string) {
  const map: Record<string, string> = {
    Bajo: "bg-emerald-50 text-emerald-700",
    Medio: "bg-yellow-50 text-yellow-700",
    Alto: "bg-orange-50 text-orange-700",
    Crítico: "bg-red-50 text-red-700",
  };
  return map[risk] || "bg-slate-100 text-slate-700";
}

export function statusClass(status: string) {
  const map: Record<string, string> = {
    Registrado: "bg-slate-100 text-slate-700",
    "En revisión": "bg-blue-50 text-blue-700",
    Priorizado: "bg-purple-50 text-purple-700",
    "En atención": "bg-orange-50 text-orange-700",
    Solucionado: "bg-green-50 text-green-700",
    Cerrado: "bg-zinc-100 text-zinc-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}
