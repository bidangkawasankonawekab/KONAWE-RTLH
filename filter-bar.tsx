"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import {
  KECAMATAN_LIST,
  STATUS_META,
  STATUS_ORDER,
  SUMBER_DANA_META,
  SUMBER_DANA_ORDER,
} from "@/lib/constants";

type Props = {
  q: string;
  kecamatan: string;
  status: string;
  sumberDana: string;
};

const selectClass =
  "w-full appearance-none rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export default function FilterBar({ q, kecamatan, status, sumberDana }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(q);

  function apply(next: { q?: string; kecamatan?: string; status?: string; sumberDana?: string }) {
    const params = new URLSearchParams();
    const merged = { q: keyword, kecamatan, status, sumberDana, ...next };
    if (merged.q) params.set("q", merged.q);
    if (merged.kecamatan) params.set("kecamatan", merged.kecamatan);
    if (merged.status) params.set("status", merged.status);
    if (merged.sumberDana) params.set("sumberDana", merged.sumberDana);
    const qs = params.toString();
    router.push(qs ? `/data?${qs}` : "/data");
  }

  return (
    <div className="rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-xl shadow-sky-900/5 backdrop-blur sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply({});
          }}
          className="relative"
        >
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari nama, NIK, No. KK, alamat, atau desa…"
            className="w-full rounded-xl border border-sky-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </form>

        <select
          value={kecamatan}
          onChange={(e) => apply({ kecamatan: e.target.value })}
          className={selectClass}
        >
          <option value="">Semua Kecamatan</option>
          {KECAMATAN_LIST.map((kec) => (
            <option key={kec} value={kec}>
              {kec}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => apply({ status: e.target.value })}
          className={selectClass}
        >
          <option value="">Semua Status</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>

        <select
          value={sumberDana}
          onChange={(e) => apply({ sumberDana: e.target.value })}
          className={selectClass}
        >
          <option value="">Semua Sumber Dana</option>
          {SUMBER_DANA_ORDER.map((s) => (
            <option key={s} value={s}>
              {SUMBER_DANA_META[s].short}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setKeyword("");
            router.push("/data");
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-100"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
