"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import { Camera, LocateFixed, Save } from "lucide-react";

type ReportForm = {
  title: string;
  infrastructureType: string;
  damageType: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  riskLevel: "Bajo" | "Medio" | "Alto" | "Crítico";
  status:
    | "Registrado"
    | "En revisión"
    | "Priorizado"
    | "En atención"
    | "Solucionado"
    | "Cerrado";
  imageData: string;
  latitude: string;
  longitude: string;
};

const initialForm: ReportForm = {
  title: "",
  infrastructureType: "",
  damageType: "",
  description: "",
  address: "",
  city: "",
  neighborhood: "",
  riskLevel: "Bajo",
  status: "Registrado",
  imageData: "",
  latitude: "",
  longitude: "",
};

function RequiredMark() {
  return <span className="ml-1 text-red-500">*</span>;
}

function safeTrim(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;

    return (
      axiosError.response?.data?.message ?? "No se pudo guardar el reporte."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
}

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("infra_token") ||
    localStorage.getItem("infraMonitorToken")
  );
}

export default function NewReportPage() {
  const router = useRouter();

  const [form, setForm] = useState<ReportForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field: keyof ReportForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!safeTrim(form.title)) {
      return "El título del reporte es obligatorio.";
    }

    if (!safeTrim(form.infrastructureType)) {
      return "El tipo de infraestructura es obligatorio.";
    }

    if (!safeTrim(form.damageType)) {
      return "El tipo de daño es obligatorio.";
    }

    if (!safeTrim(form.description)) {
      return "La descripción es obligatoria.";
    }

    if (!safeTrim(form.address)) {
      return "La dirección o punto de referencia es obligatoria.";
    }

    if (!safeTrim(form.riskLevel)) {
      return "El nivel de riesgo es obligatorio.";
    }

    return "";
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Solo se permiten imágenes.");
      return;
    }

    const maxSizeMb = 1.2;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setMessage(`La imagen no debe superar ${maxSizeMb} MB.`);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result === "string") {
        updateField("imageData", result);
        setMessage("");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setMessage("El navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", String(position.coords.latitude));
        updateField("longitude", String(position.coords.longitude));
        setMessage("Ubicación capturada correctamente.");
      },
      () => {
        setMessage("No se pudo obtener la ubicación.");
      }
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        setMessage("Debes iniciar sesión para crear un reporte.");
        router.push("/login");
        return;
      }

      await axios.post(
        "/api/reports",
        {
          title: safeTrim(form.title),
          infrastructureType: safeTrim(form.infrastructureType),
          damageType: safeTrim(form.damageType),
          description: safeTrim(form.description),
          city: safeTrim(form.city),
          neighborhood: safeTrim(form.neighborhood),
          address: safeTrim(form.address),
          riskLevel: form.riskLevel,
          status: form.status,
          imageData: form.imageData,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push("/reports");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div>
          <p className="badge bg-green-50 text-green-700">Nuevo reporte</p>

          <h1 className="mt-4 text-3xl font-black text-slate-950 md:text-5xl">
            Registrar afectación
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Documenta una afectación visible en infraestructura pública o
            comunitaria, agregando ubicación, evidencia y nivel de riesgo.
          </p>

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Los campos marcados con <span className="text-red-500">*</span> son
            obligatorios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 grid gap-6 p-6">
          {message && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
              {message}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">
                Título del reporte
                <RequiredMark />
              </label>

              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="input"
                placeholder="Ejemplo: Andén deteriorado frente al colegio"
                required
              />
            </div>

            <div>
              <label className="label">
                Tipo de infraestructura
                <RequiredMark />
              </label>

              <select
                value={form.infrastructureType}
                onChange={(event) =>
                  updateField("infrastructureType", event.target.value)
                }
                className="input cursor-pointer"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Vía">Vía</option>
                <option value="Puente peatonal">Puente peatonal</option>
                <option value="Parque">Parque</option>
                <option value="Luminaria">Luminaria</option>
                <option value="Andén">Andén</option>
                <option value="Alcantarillado">Alcantarillado</option>
                <option value="Colegio">Colegio</option>
                <option value="Salón comunal">Salón comunal</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="label">
                Tipo de daño
                <RequiredMark />
              </label>

              <select
                value={form.damageType}
                onChange={(event) =>
                  updateField("damageType", event.target.value)
                }
                className="input cursor-pointer"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Grieta">Grieta</option>
                <option value="Hundimiento">Hundimiento</option>
                <option value="Deterioro">Deterioro</option>
                <option value="Obstrucción">Obstrucción</option>
                <option value="Falla eléctrica">Falla eléctrica</option>
                <option value="Riesgo estructural">Riesgo estructural</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">
                Descripción
                <RequiredMark />
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="input min-h-32 resize-none"
                placeholder="Describe brevemente la afectación visible."
                required
              />
            </div>

            <div>
              <label className="label">Ciudad</label>

              <input
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="input"
                placeholder="Bogotá"
              />
            </div>

            <div>
              <label className="label">Barrio o sector</label>

              <input
                value={form.neighborhood}
                onChange={(event) =>
                  updateField("neighborhood", event.target.value)
                }
                className="input"
                placeholder="Chapinero"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">
                Dirección o punto de referencia
                <RequiredMark />
              </label>

              <input
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                className="input"
                placeholder="Carrera 10 con Calle 20, frente al parque"
                required
              />
            </div>

            <div>
              <label className="label">
                Nivel de riesgo
                <RequiredMark />
              </label>

              <select
                value={form.riskLevel}
                onChange={(event) =>
                  updateField(
                    "riskLevel",
                    event.target.value as ReportForm["riskLevel"]
                  )
                }
                className="input cursor-pointer"
                required
              >
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>

            <div>
              <label className="label">Estado inicial</label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as ReportForm["status"]
                  )
                }
                className="input cursor-pointer"
              >
                <option value="Registrado">Registrado</option>
                <option value="En revisión">En revisión</option>
                <option value="Priorizado">Priorizado</option>
                <option value="En atención">En atención</option>
                <option value="Solucionado">Solucionado</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Camera className="text-green-700" />

                <div>
                  <h3 className="font-black text-slate-950">
                    Evidencia fotográfica
                  </h3>

                  <p className="text-sm text-slate-500">
                    Carga una imagen del daño visible. Campo opcional.
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="mt-5 block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:font-bold file:text-green-700"
              />

              {form.imageData && (
                <div className="relative mt-5 h-56 overflow-hidden rounded-3xl border border-slate-200">
                  <Image
                    src={form.imageData}
                    alt="Evidencia del reporte"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <LocateFixed className="text-green-700" />

                <div>
                  <h3 className="font-black text-slate-950">
                    Geolocalización
                  </h3>

                  <p className="text-sm text-slate-500">
                    Captura coordenadas desde el navegador. Campo opcional.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLocation}
                className="btn-secondary mt-5 w-full cursor-pointer"
              >
                Capturar ubicación
              </button>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <input
                  value={form.latitude}
                  onChange={(event) =>
                    updateField("latitude", event.target.value)
                  }
                  className="input"
                  placeholder="Latitud"
                />

                <input
                  value={form.longitude}
                  onChange={(event) =>
                    updateField("longitude", event.target.value)
                  }
                  className="input"
                  placeholder="Longitud"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar reporte"}
          </button>
        </form>
      </section>
    </main>
  );
}