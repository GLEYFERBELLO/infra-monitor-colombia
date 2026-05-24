import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export default function StatCard({ title, value, description, icon: Icon }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-950">{value}</h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-green-50 p-3 text-green-700">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
