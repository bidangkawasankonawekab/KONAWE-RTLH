import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bnba } from "@/db/schema";
import { canEdit, getSession } from "@/lib/auth";
import { csvToBnbaRows, type BnbaCsvRow } from "@/lib/csv";
import { KECAMATAN_LIST, type SumberDana } from "@/lib/constants";

function normalizeKecamatan(raw: string | undefined): string | null {
  if (!raw) return null;
  const clean = raw.replace(/kec\.?/i, "").trim();
  const found = KECAMATAN_LIST.find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  return found ?? clean;
}

function normalizeNik(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(0, 16) : null;
}

function mapSumberDana(raw: string | undefined): SumberDana | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("apbn") || s.includes("pkp") || s.includes("kemen"))
    return "APBN_KEMENPKP";
  if (s.includes("provinsi")) return "APBD_PROVINSI";
  if (s.includes("kabupaten") || s.includes("kab")) return "APBD_KABUPATEN";
  if (s.includes("csr")) return "CSR";
  return "LAINNYA";
}

function toPayload(row: BnbaCsvRow) {
  return {
    namaKk: row.namaKk!.slice(0, 180),
    nik: normalizeNik(row.nik),
    noKk: row.noKk?.replace(/\D/g, "").slice(0, 20) || null,
    alamatLengkap: (row.alamatLengkap || "-").slice(0, 500),
    desaKelurahan: (row.desaKelurahan || "-").slice(0, 140),
    kecamatan: normalizeKecamatan(row.kecamatan)!.slice(0, 140),
    fotoDepan: row.fotoDepan || null,
    fotoKanan: row.fotoKanan || null,
    fotoKiri: row.fotoKiri || null,
    fotoBelakang: row.fotoBelakang || null,
    sumberDana: mapSumberDana(row.sumberDana),
    tahun: Number.isFinite(Number(row.tahun))
      ? Math.min(2035, Math.max(2020, Math.round(Number(row.tahun))))
      : new Date().getFullYear(),
  };
}

export async function POST() {
  const session = await getSession();
  if (!session || !canEdit(session)) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan masuk sebagai petugas." },
      { status: 403 }
    );
  }

  const url = process.env.GOOGLE_SHEET_CSV_URL;
  if (!url) {
    return NextResponse.json(
      {
        error:
          "Variabel lingkungan GOOGLE_SHEET_CSV_URL belum disetel. Isi dengan URL ekspor CSV spreadsheet Google Anda (File → Bagikan/Publikasikan → CSV).",
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, { cache: "no-store", redirect: "follow" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil spreadsheet (HTTP ${res.status}). Pastikan tautan dapat diakses publik.` },
        { status: 502 }
      );
    }
    const text = await res.text();
    const rows = csvToBnbaRows(text).slice(0, 2000);
    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ada baris valid yang ditemukan. Pastikan header kolom sesuai format Google Form pendataan.",
        },
        { status: 422 }
      );
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const payload = toPayload(row);
      if (!payload.kecamatan) {
        skipped++;
        continue;
      }
      if (payload.nik) {
        const [existing] = await db
          .select({ id: bnba.id })
          .from(bnba)
          .where(eq(bnba.nik, payload.nik))
          .limit(1);
        if (existing) {
          await db
            .update(bnba)
            .set({
              namaKk: payload.namaKk,
              noKk: payload.noKk,
              alamatLengkap: payload.alamatLengkap,
              desaKelurahan: payload.desaKelurahan,
              kecamatan: payload.kecamatan,
              fotoDepan: payload.fotoDepan,
              fotoKanan: payload.fotoKanan,
              fotoKiri: payload.fotoKiri,
              fotoBelakang: payload.fotoBelakang,
            })
            .where(eq(bnba.id, existing.id));
          updated++;
          continue;
        }
      } else {
        const [existing] = await db
          .select({ id: bnba.id })
          .from(bnba)
          .where(
            and(
              eq(bnba.namaKk, payload.namaKk),
              eq(bnba.kecamatan, payload.kecamatan)
            )
          )
          .limit(1);
        if (existing) {
          skipped++;
          continue;
        }
      }
      await db.insert(bnba).values(payload);
      inserted++;
    }

    return NextResponse.json({
      ok: true,
      total: rows.length,
      inserted,
      updated,
      skipped,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Sinkronisasi gagal: ${err.message}`
            : "Sinkronisasi gagal.",
      },
      { status: 500 }
    );
  }
}
