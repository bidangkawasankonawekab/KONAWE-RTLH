export const APP_NAME = "SI-RTLH Konawe";
export const APP_LONG_NAME =
  "Sistem Informasi Rumah Tidak Layak Huni Kabupaten Konawe";
export const DINAS_NAME =
  "Dinas Perumahan dan Kawasan Permukiman Kabupaten Konawe";

export const STATUS_ORDER = [
  "USULAN_BARU",
  "TAHAP_VERIFIKASI",
  "MASUK_SK",
  "SELESAI",
] as const;

export type BnbaStatus = (typeof STATUS_ORDER)[number];

export const STATUS_META: Record<
  BnbaStatus,
  {
    label: string;
    description: string;
    color: string;
    badge: string;
    dot: string;
    step: number;
  }
> = {
  USULAN_BARU: {
    label: "Usulan Baru",
    description:
      "Data usulan penerima bantuan masuk melalui formulir pendataan dan menunggu tindak lanjut.",
    color: "#0ea5e9",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    step: 1,
  },
  TAHAP_VERIFIKASI: {
    label: "Tahap Verifikasi",
    description:
      "Tim verifikator lapangan melakukan peninjauan kondisi rumah dan kelengkapan berkas.",
    color: "#f59e0b",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    step: 2,
  },
  MASUK_SK: {
    label: "Masuk SK",
    description:
      "Penerima bantuan ditetapkan dalam Surat Keputusan dan siap menerima bantuan pembangunan.",
    color: "#6366f1",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
    step: 3,
  },
  SELESAI: {
    label: "Selesai",
    description:
      "Pembangunan/peningkatan kualitas rumah telah selesai dan rumah dinyatakan layak huni.",
    color: "#10b981",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    step: 4,
  },
};

export const SUMBER_DANA_ORDER = [
  "APBN_KEMENPKP",
  "APBD_PROVINSI",
  "APBD_KABUPATEN",
  "CSR",
  "LAINNYA",
] as const;

export type SumberDana = (typeof SUMBER_DANA_ORDER)[number];

export const SUMBER_DANA_META: Record<
  SumberDana,
  { label: string; short: string; color: string; soft: string }
> = {
  APBN_KEMENPKP: {
    label: "APBN — Kementerian PKP",
    short: "APBN KemenPKP",
    color: "#0369a1",
    soft: "bg-sky-100 text-sky-800",
  },
  APBD_PROVINSI: {
    label: "APBD Provinsi",
    short: "APBD Provinsi",
    color: "#0284c7",
    soft: "bg-sky-100 text-sky-800",
  },
  APBD_KABUPATEN: {
    label: "APBD Kabupaten",
    short: "APBD Kabupaten",
    color: "#2563eb",
    soft: "bg-blue-100 text-blue-800",
  },
  CSR: {
    label: "CSR / Tanggung Jawab Sosial Perusahaan",
    short: "CSR",
    color: "#14b8a6",
    soft: "bg-teal-100 text-teal-800",
  },
  LAINNYA: {
    label: "Sumber Lainnya",
    short: "Lainnya",
    color: "#94a3b8",
    soft: "bg-slate-100 text-slate-700",
  },
};

/** 28 Kecamatan di Kabupaten Konawe, Sulawesi Tenggara */
export const KECAMATAN_LIST = [
  "Abuki",
  "Amonggedo",
  "Anggalomoare",
  "Anggaberi",
  "Asinua",
  "Besulutu",
  "Bondoala",
  "Kapoiala",
  "Konawe",
  "Lalonggasumeeto",
  "Lambuya",
  "Latoma",
  "Meluhu",
  "Morosi",
  "Onembute",
  "Padangguni",
  "Pondidaha",
  "Puriala",
  "Routa",
  "Sampara",
  "Soropia",
  "Tongauna",
  "Tongauna Utara",
  "Uepai",
  "Unaaha",
  "Wawotobi",
  "Wonggeduku",
  "Wonggeduku Barat",
] as const;

export const FOTO_SLOTS = [
  { key: "fotoDepan", label: "Tampak Depan" },
  { key: "fotoKanan", label: "Tampak Samping Kanan" },
  { key: "fotoKiri", label: "Tampak Samping Kiri" },
  { key: "fotoBelakang", label: "Tampak Belakang" },
] as const;

export const MY_MAPS_URL =
  process.env.NEXT_PUBLIC_MY_MAPS_URL ??
  "https://www.google.com/maps/d/embed?mid=1vB5fS1q4b2WjJ4xVQmY2r7y3o9k&hl=id";
