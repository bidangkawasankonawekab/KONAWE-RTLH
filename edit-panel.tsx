"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save, ShieldAlert } from "lucide-react";
import {
  STATUS_META,
  STATUS_ORDER,
  SUMBER_DANA_META,
  SUMBER_DANA_ORDER,
} from "@/lib/constants";

type Props = {
  bnbaId: number;
  currentStatus: string;
  currentSumberDana: string | null;
  tahun: number;
  nilaiBantuan: number;
  userName: string;
  userRole: string;
};

const fieldClass =
  "w-full rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export default function EditPanel({
  bnbaId,
  currentStatus,
  currentSumberDana,
  tahun,
  nilaiBantuan,
  userName,
  userRole,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [sumberDana, setSumberDana] = useState(currentSumberDana ?? "");
  const [tahunVal, setTahunVal] = useState(String(tahun));
  const [nilaiVal, setNilaiVal] = useState(String(nilaiBantuan));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    status !== currentStatus ||
    sumberDana !== (currentSumberDana ?? "") ||
    tahunVal !== String(tahun) ||
    nilaiVal !== String(nilaiBantuan);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/bnba/${bnbaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          sumberDana: sumberDana || null,
          tahun: Number(tahunVal) || tahun,
          nilaiBantuan: Number(nilaiVal) || nilaiBantuan,
          note: note || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan perubahan");
      setSaved(true);
      setNote("");
      router.refresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 card-shadow"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-sky-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-sky-400 text-white">
            <Save className="h-4 w-4" />
          </span>
          Pembaruan Manual BNBA
        </h3>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700">
          {userRole === "SUPER_ADMIN" ? "Super Admin" : "Operator"}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Masuk sebagai <strong>{userName}</strong>. Perubahan status akan
        tercatat pada riwayat pemutakhiran data.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            Status Tahapan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_ORDER.map((s) => {
              const meta = STATUS_META[s];
              const active = status === s;
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-all ${
                    active
                      ? "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-500/30"
                      : "border-sky-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: active ? "#fff" : meta.color }}
                  />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Sumber Dana
            </label>
            <select
              value={sumberDana}
              onChange={(e) => setSumberDana(e.target.value)}
              className={fieldClass}
            >
              <option value="">Belum ditetapkan</option>
              {SUMBER_DANA_ORDER.map((s) => (
                <option key={s} value={s}>
                  {SUMBER_DANA_META[s].short}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Tahun Anggaran
            </label>
            <input
              type="number"
              min={2020}
              max={2035}
              value={tahunVal}
              onChange={(e) => setTahunVal(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            Nilai Bantuan (Rp)
          </label>
          <input
            type="number"
            min={0}
            step={500000}
            value={nilaiVal}
            onChange={(e) => setNilaiVal(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            Catatan (opsional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Contoh: hasil verifikasi lapangan 12 Juni…"
            className={`${fieldClass} resize-none`}
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
            <ShieldAlert className="h-4 w-4" /> {error}
          </p>
        )}
        {saved && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Perubahan berhasil disimpan dan
            tercatat.
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !dirty}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Menyimpan…" : "Simpan Pembaruan"}
        </button>
      </div>
    </form>
  );
}
