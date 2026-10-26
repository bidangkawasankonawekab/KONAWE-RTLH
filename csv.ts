/**
 * Parser CSV sederhana namun tangguh untuk ekspor Google Sheets
 * (mendukung nilai ber-kutip, koma di dalam sel, dan baris baru di sel).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[\r\n]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Mencocokkan header kolom Google Form/Spreadsheet ke field database. */
export function mapHeaderToField(header: string): string | null {
  const h = normalizeHeader(header);
  if (h === "no" || h === "nomor") return "nomor";
  if (h.includes("nama") && (h.includes("kk") || h.includes("kepala")))
    return "namaKk";
  if (h === "nama" || h === "nama lengkap") return "namaKk";
  if (h.includes("nik")) return "nik";
  if (h.includes("no kk") || h.includes("nomor kk") || h.includes("no kartu keluarga"))
    return "noKk";
  if (h.includes("alamat")) return "alamatLengkap";
  if (h.includes("desa") || h.includes("kelurahan")) return "desaKelurahan";
  if (h.includes("kecamatan")) return "kecamatan";
  if (h.includes("depan")) return "fotoDepan";
  if (h.includes("kanan")) return "fotoKanan";
  if (h.includes("kiri")) return "fotoKiri";
  if (h.includes("belakang")) return "fotoBelakang";
  if (h.includes("sumber")) return "sumberDana";
  if (h.includes("tahun")) return "tahun";
  return null;
}

export type BnbaCsvRow = Partial<{
  nomor: string;
  namaKk: string;
  nik: string;
  noKk: string;
  alamatLengkap: string;
  desaKelurahan: string;
  kecamatan: string;
  fotoDepan: string;
  fotoKanan: string;
  fotoKiri: string;
  fotoBelakang: string;
  sumberDana: string;
  tahun: string;
}>;

export function csvToBnbaRows(text: string): BnbaCsvRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(mapHeaderToField);
  return rows
    .slice(1)
    .map((cells) => {
      const out: BnbaCsvRow = {};
      cells.forEach((cell, i) => {
        const field = headers[i];
        if (field) (out as Record<string, string>)[field] = cell.trim();
      });
      return out;
    })
    .filter((r) => r.namaKk && r.kecamatan);
}
