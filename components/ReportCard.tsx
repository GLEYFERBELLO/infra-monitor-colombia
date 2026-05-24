import Link from "next/link";
import { MapPin, AlertTriangle, CalendarDays } from "lucide-react";
import { Report } from "@/types";
import { formatDate, riskClass, statusClass } from "@/lib/utils";

export default function ReportCard({ report }: { report: Report }) {
  return (
    <Link href={`/reports/${report._id}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
      {report.imageData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={report.imageData} alt={report.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-green-50 text-slate-400">
          Sin imagen
        </div>
      )}
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={`badge ${riskClass(report.riskLevel)}`}>
            <AlertTriangle size={14} /> {report.riskLevel}
          </span>
          <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
        </div>
        <h3 className="line-clamp-2 text-lg font-black text-slate-950">{report.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{report.description}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-500">
          <p className="flex items-center gap-2"><MapPin size={16} /> {report.city} - {report.neighborhood}</p>
          <p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(report.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}
