const numberFmt = new Intl.NumberFormat("id-ID");

export function formatNumber(value: number | null | undefined): string {
  return numberFmt.format(Number(value ?? 0));
}

export function formatIdr(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  if (n >= 1_000_000_000) {
    const m = n / 1_000_000_000;
    return `Rp ${m.toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  }
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    return `Rp ${jt.toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  }
  return `Rp ${numberFmt.format(n)}`;
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Menyamarkan sebagian digit NIK/No KK untuk tampilan publik. */
export function maskNik(value: string | null | undefined): string {
  if (!value) return "-";
  const clean = value.replace(/\D/g, "");
  if (clean.length < 8) return value;
  return `${clean.slice(0, 6)}••••••${clean.slice(-4)}`;
}
