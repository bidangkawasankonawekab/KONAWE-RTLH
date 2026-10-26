"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, LogIn, ShieldAlert, UserRound } from "lucide-react";

const fieldClass =
  "w-full rounded-xl border border-sky-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal masuk");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="glass bg-white p-8 sm:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-sky-400 text-white shadow-lg shadow-sky-500/40">
        <LogIn className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-sky-950">
        Masuk ke SI-RTLH Konawe
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Gunakan akun petugas yang diberikan oleh Super Admin.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div className="relative">
          <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama pengguna"
            autoComplete="username"
            required
            className={fieldClass}
          />
        </div>
        <div className="relative">
          <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {loading ? "Memverifikasi…" : "Masuk Sistem"}
        </button>
      </form>

      <div className="mt-7 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
          Akun Petugas (Demo)
        </p>
        <div className="mt-2 space-y-1 font-mono text-xs text-slate-600">
          <p>
            operator.perkim <span className="text-slate-400">/ Konawe@2026</span>{" "}
            <span className="text-sky-500">— Operator</span>
          </p>
          <p>
            verifikator <span className="text-slate-400">/ Konawe@2026</span>{" "}
            <span className="text-sky-500">— Verifikator</span>
          </p>
          <p>
            superadmin <span className="text-slate-400">/ Konawe@2026</span>{" "}
            <span className="text-sky-500">— Super Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
