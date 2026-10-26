"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CloudDownload,
  FileSpreadsheet,
  Loader2,
  ShieldAlert,
} from "lucide-react";

type SyncResult = {
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  sheetTitle?: string;
};

export default function SyncPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sinkronisasi gagal");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-6 card-shadow">
      <h2 className="flex items-center gap-2 text-sm font-bold text-sky-900">
        <FileSpreadsheet className="h-4 w-4 text-sky-500" />
        Sinkronisasi Spreadsheet Google Form
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Menarik jawaban formulir dari spreadsheet Google (URL CSV pada{" "}
        <code className="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-[11px] text-sky-700">
          GOOGLE_SHEET_CSV_URL
        </code>
        ) dan memutakhirkannya ke basis data BNBA. Data baru otomatis berstatus{" "}
        <strong>Usulan Baru</strong>; data yang sudah ada (berdasarkan NIK)
        diperbarui tanpa mengubah tahapannya.
      </p>

      <div className="mt-4 rounded-2xl bg-sky-50/80 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
          Kolom yang dikenali
        </p>
        <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-500">
          No · Nama KK · NIK · No KK · Alamat Lengkap · Desa/Kelurahan ·
          Kecamatan · Foto Tampak Depan · Foto Tampak Samping Kanan · Foto
          Tampak Samping Kiri · Foto Tampak Belakang
        </p>
      </div>

      <button
        onClick={handleSync}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.01] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CloudDownload className="h-4 w-4" />
        )}
        {loading ? "Menyinkronkan…" : "Tarik Data dari Spreadsheet"}
      </button>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Sinkronisasi selesai
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Total Baris", value: result.total },
              { label: "Baru", value: result.inserted },
              { label: "Diperbarui", value: result.updated },
              { label: "Dilewati", value: result.skipped },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white p-3">
                <p className="text-xl font-extrabold text-sky-950">
                  {item.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
