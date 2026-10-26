import { BadgeCheck, ClipboardList, FileCheck2, FilePlus2 } from "lucide-react";
import CountUp from "@/components/count-up";
import { STATUS_META, STATUS_ORDER, type BnbaStatus } from "@/lib/constants";

const ICONS: Record<BnbaStatus, typeof FilePlus2> = {
  USULAN_BARU: FilePlus2,
  TAHAP_VERIFIKASI: ClipboardList,
  MASUK_SK: FileCheck2,
  SELESAI: BadgeCheck,
};

export default function StatusFlow({
  perStatus,
}: {
  perStatus: Record<BnbaStatus, number>;
}) {
  return (
    <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent lg:block" />
      {STATUS_ORDER.map((status, index) => {
        const meta = STATUS_META[status];
        const Icon = ICONS[status];
        return (
          <div
            key={status}
            className="group relative rounded-3xl border border-sky-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:card-shadow"
          >
            <div className="flex items-start justify-between">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                  boxShadow: `0 10px 24px -10px ${meta.color}90`,
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Tahap {index + 1}
              </span>
            </div>
            <p className="mt-5 text-4xl font-extrabold tracking-tight text-sky-950">
              <CountUp end={perStatus[status]} />
            </p>
            <p className="mt-1 text-sm font-bold text-sky-800">{meta.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {meta.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
