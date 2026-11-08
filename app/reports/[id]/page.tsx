"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { changeStatus, confirmRisk, deleteReport, getReport } from "@/services/report.service";
import { Report, ReportStatus, RiskLevel } from "@/types";
import {
  allowedNextStatus,
  canDelete,
  canValidateRisk,
  RISK_CRITERIA,
  RISK_LEVELS,
  STATUS_REQUIRING_NOTE,
} from "@/lib/permissions";
import { formatDate, riskClass, statusClass } from "@/lib/utils";
import { History, MapPin, ShieldCheck, ShieldQuestion, Trash2 } from "lucide-react";

type ApiErrorResponse = { message?: string };

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const [nextStatus, setNextStatus] = useState<ReportStatus | "">("");
  const [note, setNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [riskDraft, setRiskDraft] = useState<RiskLevel>("Bajo");
  const [savingRisk, setSavingRisk] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await getReport(params.id);
        setReport(data);
        setRiskDraft(data.riskLevel);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "No fue posible consultar el reporte"));
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [params.id]);

  const nextOptions = useMemo(
    () => (report ? allowedNextStatus(report.status, user?.role) : []),
    [report, user?.role]
  );

  useEffect(() => {
    setNextStatus(nextOptions[0] ?? "");
  }, [nextOptions]);

  const noteRequired = nextStatus ? STATUS_REQUIRING_NOTE.includes(nextStatus) : false;

  const applyStatus = async () => {
    if (!nextStatus) return;

    if (noteRequired && !note.trim()) {
      toast.error(`Para pasar el caso a "${nextStatus}" debes registrar una nota de soporte.`);
      return;
    }

    try {
      setSavingStatus(true);
      const updated = await changeStatus(params.id, nextStatus, note.trim());
      setReport(updated);
      setNote("");
      toast.success(`El reporte pasó a "${nextStatus}"`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No fue posible actualizar el estado"));
    } finally {
      setSavingStatus(false);
    }
  };

  const applyRisk = async () => {
    try {
      setSavingRisk(true);
      const updated = await confirmRisk(params.id, riskDraft);
      setReport(updated);
      toast.success("Nivel de riesgo confirmado");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No fue posible confirmar el nivel de riesgo"));
    } finally {
      setSavingRisk(false);
    }
  };

  const remove = async () => {
    try {
      setDeleting(true);
      await deleteReport(params.id);
      toast.success("Reporte eliminado");
      router.push("/reports");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No fue posible eliminar"));
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="p-10 text-center text-slate-500">Cargando reporte...</div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <section className="mx-auto max-w-5xl px-4 py-10">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-black text-slate-950">Reporte no encontrado</h1>
            <p className="mt-2 text-slate-500">No fue posible consultar la información del reporte.</p>
            <button type="button" onClick={() => router.push("/reports")} className="btn-primary mt-5">
              Volver a reportes
            </button>
          </div>
        </section>
      </main>
    );
  }

  const imageSrc = report.imageData || report.imageUrl;
  const history = report.statusHistory ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="card overflow-hidden">
          {imageSrc ? (
            <div className="relative h-96 w-full">
              <Image src={imageSrc} alt={report.title} fill className="object-cover" unoptimized priority />
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-400">Sin imagen</div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${riskClass(report.riskLevel)}`}>Riesgo {report.riskLevel}</span>
              <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
              {report.riskValidated ? (
                <span className="badge bg-green-50 text-green-700">
                  <ShieldCheck size={14} /> Riesgo confirmado
                </span>
              ) : (
                <span className="badge bg-slate-100 text-slate-600">
                  <ShieldQuestion size={14} /> Riesgo propuesto
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black text-slate-950">{report.title}</h1>

            <p className="mt-4 text-slate-600">{report.description}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <b>Tipo de infraestructura</b>
                <p className="mt-1 text-slate-500">{report.infrastructureType}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <b>Tipo de daño</b>
                <p className="mt-1 text-slate-500">{report.damageType}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <b>Ubicación</b>
                <p className="mt-1 flex gap-2 text-slate-500">
                  <MapPin size={18} className="shrink-0" />
                  {[report.city, report.neighborhood, report.address].filter(Boolean).join(", ") ||
                    "Sin ubicación registrada"}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <b>Fecha de registro</b>
                <p className="mt-1 text-slate-500">{formatDate(report.createdAt)}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2">
                <b>Clasificación del riesgo</b>
                <p className="mt-1 text-slate-500">
                  Nivel propuesto por quien reportó: <b>{report.riskLevelProposed ?? report.riskLevel}</b>.{" "}
                  {report.riskValidated
                    ? `Confirmado como "${report.riskLevel}" por ${report.riskValidatedByName || "un gestor"} el ${formatDate(report.riskValidatedAt)}.`
                    : "Pendiente de confirmación por parte de un gestor."}
                </p>
                <p className="mt-2 text-sm text-slate-500">{RISK_CRITERIA[report.riskLevel].condition}</p>
              </div>

              {(report.latitude || report.longitude) && (
                <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2">
                  <b>Coordenadas</b>
                  <p className="mt-1 text-slate-500">
                    {report.latitude}, {report.longitude}
                  </p>
                </div>
              )}
            </div>

            {canValidateRisk(user?.role) && !report.riskValidated && (
              <div className="mt-8 rounded-3xl border border-green-200 bg-green-50/60 p-5">
                <h2 className="font-black text-slate-950">Confirmar nivel de riesgo</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Revisa la evidencia y la descripción, y confirma o corrige el nivel propuesto. El caso no
                  avanza en el flujo hasta que el riesgo quede confirmado.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    className="input"
                    value={riskDraft}
                    onChange={(event) => setRiskDraft(event.target.value as RiskLevel)}
                  >
                    {RISK_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>

                  <button type="button" className="btn-primary" onClick={applyRisk} disabled={savingRisk}>
                    {savingRisk ? "Guardando..." : "Confirmar riesgo"}
                  </button>
                </div>

                <p className="mt-3 text-sm text-slate-600">{RISK_CRITERIA[riskDraft].condition}</p>
              </div>
            )}

            {!user && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                El seguimiento del caso lo realizan los gestores de la plataforma.{" "}
                <Link href="/login" className="font-bold text-green-700 hover:underline">
                  Inicia sesión
                </Link>{" "}
                para registrar un reporte o hacer seguimiento.
              </div>
            )}

            {user && nextOptions.length > 0 && (
              <div className="mt-8 rounded-3xl border border-slate-200 p-5">
                <label className="label">Avanzar el estado del reporte</label>
                <p className="mb-3 text-sm text-slate-500">
                  Estado actual: <b>{report.status}</b>. Los estados siguen un flujo y no se pueden saltar.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    className="input"
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value as ReportStatus)}
                  >
                    {nextOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <button type="button" className="btn-primary" onClick={applyStatus} disabled={savingStatus}>
                    {savingStatus ? "Guardando..." : "Guardar estado"}
                  </button>
                </div>

                <textarea
                  className="input mt-3 min-h-24 resize-none"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    noteRequired
                      ? "Obligatorio: entidad responsable, evidencia del arreglo o soporte del cambio"
                      : "Nota opcional sobre la revisión"
                  }
                />

                {noteRequired && (
                  <p className="mt-2 text-sm font-semibold text-orange-600">
                    El paso a &quot;{nextStatus}&quot; exige una nota que soporte el cambio. Queda guardada en
                    la bitácora del reporte.
                  </p>
                )}
              </div>
            )}

            {user && nextOptions.length === 0 && report.status !== "Cerrado" && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Tu cuenta tiene el rol <b>{user.role}</b>. El seguimiento del estado lo realizan los gestores
                y administradores.
              </div>
            )}

            {report.status === "Cerrado" && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Este caso está cerrado y ya no admite cambios de estado.
              </div>
            )}

            <div className="mt-8 rounded-3xl border border-slate-200 p-5">
              <h2 className="flex items-center gap-2 font-black text-slate-950">
                <History size={18} className="text-green-700" />
                Bitácora del reporte
              </h2>

              {history.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Este reporte se registró antes de que la plataforma guardara la bitácora de cambios.
                </p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {history.map((entry, index) => (
                    <li key={`${entry.status}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`badge ${statusClass(entry.status)}`}>{entry.status}</span>
                        <span className="text-sm text-slate-500">{formatDate(entry.at)}</span>
                      </div>
                      {entry.changedByName && (
                        <p className="mt-2 text-sm text-slate-600">
                          Registrado por {entry.changedByName}
                          {entry.changedByRole ? ` (${entry.changedByRole})` : ""}
                        </p>
                      )}
                      {entry.note && <p className="mt-1 text-sm text-slate-500">{entry.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {canDelete(user?.role) && (
              <div className="mt-8 rounded-3xl border border-red-200 bg-red-50/60 p-5">
                <h2 className="font-black text-slate-950">Eliminar reporte</h2>
                <p className="mt-1 text-sm text-slate-600">
                  La eliminación es permanente y solo está disponible para el administrador.
                </p>

                {confirmingDelete ? (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="btn-danger flex items-center justify-center gap-2"
                      onClick={remove}
                      disabled={deleting}
                    >
                      <Trash2 size={18} />
                      {deleting ? "Eliminando..." : "Confirmar eliminación"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary mt-4 flex items-center gap-2 text-red-600"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 size={18} />
                    Eliminar reporte
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
