import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AlertTriangle, BarChart3, Camera, MapPin, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_35%),linear-gradient(180deg,#ffffff,#f8fafc)]">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <span className="badge bg-green-50 text-green-700">Monitoreo preventivo comunitario</span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            InfraMonitor Colombia
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Plataforma inteligente para registrar, ubicar, clasificar y hacer seguimiento a reportes de infraestructura pública y comunitaria en Colombia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary text-center">Crear primer reporte</Link>
            <Link href="/reports" className="btn-secondary text-center">Ver reportes</Link>
          </div>
        </div>

        <div className="card relative overflow-hidden p-6">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-green-200 blur-3xl" />
          <div className="relative grid gap-4">
            {[
              { icon: Camera, title: "Evidencia fotográfica", text: "Documenta daños visibles con imágenes." },
              { icon: MapPin, title: "Ubicación", text: "Registra ciudad, barrio, dirección y referencia." },
              { icon: AlertTriangle, title: "Clasificación de riesgo", text: "Prioriza casos bajos, medios, altos o críticos." },
              { icon: BarChart3, title: "Indicadores", text: "Consulta estadísticas para apoyar decisiones preventivas." },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex gap-4">
                  <div className="rounded-2xl bg-green-50 p-3 text-green-700"><item.icon size={22} /></div>
                  <div>
                    <h3 className="font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6"><ShieldCheck className="text-green-700" /><h3 className="mt-4 font-black">Trazabilidad</h3><p className="mt-2 text-sm text-slate-500">Cada reporte conserva estado, fecha, evidencia y ubicación.</p></div>
          <div className="card p-6"><AlertTriangle className="text-green-700" /><h3 className="mt-4 font-black">Prevención</h3><p className="mt-2 text-sm text-slate-500">Ayuda a identificar riesgos antes de que se conviertan en daños mayores.</p></div>
          <div className="card p-6"><BarChart3 className="text-green-700" /><h3 className="mt-4 font-black">Análisis</h3><p className="mt-2 text-sm text-slate-500">Organiza reportes por zona, estado y nivel de riesgo.</p></div>
        </div>
      </section>
    </main>
  );
}
