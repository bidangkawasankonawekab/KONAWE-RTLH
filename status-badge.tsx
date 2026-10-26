import { STATUS_META, type BnbaStatus } from "@/lib/constants";

export default function StatusBadge({
  status,
  size = "md",
}: {
  status: BnbaStatus | string;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status as BnbaStatus] ?? null;
  if (!meta) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
        {status}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${meta.badge} ${
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
