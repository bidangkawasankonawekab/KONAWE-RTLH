import { and, count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { bnba, statusLogs } from "@/db/schema";
import type { BnbaStatus, SumberDana } from "./constants";
import { STATUS_ORDER, SUMBER_DANA_ORDER } from "./constants";

export type KecamatanStat = {
  kecamatan: string;
  total: number;
  selesai: number;
  proses: number;
};

export type OverviewStats = {
  total: number;
  totalNilai: number;
  selesaiCount: number;
  kecamatanCount: number;
  perStatus: Record<BnbaStatus, number>;
  perSumberDana: { key: SumberDana; total: number; nilai: number }[];
  belumDitetapkan: number;
  perKecamatan: KecamatanStat[];
};

export async function getOverviewStats(): Promise<OverviewStats> {
  const [totalsRow] = await db
    .select({ total: count(), totalNilai: sum(bnba.nilaiBantuan) })
    .from(bnba);

  const statusRows = await db
    .select({ status: bnba.status, total: count() })
    .from(bnba)
    .groupBy(bnba.status);

  const sumberRows = await db
    .select({
      sumberDana: bnba.sumberDana,
      total: count(),
      nilai: sum(bnba.nilaiBantuan),
    })
    .from(bnba)
    .groupBy(bnba.sumberDana);

  const kecamatanRows = await db
    .select({
      kecamatan: bnba.kecamatan,
      status: bnba.status,
      total: count(),
    })
    .from(bnba)
    .groupBy(bnba.kecamatan, bnba.status);

  const perStatus = Object.fromEntries(
    STATUS_ORDER.map((s) => [s, 0])
  ) as Record<BnbaStatus, number>;
  for (const row of statusRows) perStatus[row.status] = row.total;

  const perSumberDana = SUMBER_DANA_ORDER.map((key) => {
    const found = sumberRows.find((r) => r.sumberDana === key);
    return { key, total: found?.total ?? 0, nilai: Number(found?.nilai ?? 0) };
  });
  const belumDitetapkan =
    sumberRows.find((r) => r.sumberDana === null)?.total ?? 0;

  const kecMap = new Map<string, KecamatanStat>();
  for (const row of kecamatanRows) {
    const entry =
      kecMap.get(row.kecamatan) ?? {
        kecamatan: row.kecamatan,
        total: 0,
        selesai: 0,
        proses: 0,
      };
    entry.total += row.total;
    if (row.status === "SELESAI") entry.selesai += row.total;
    else entry.proses += row.total;
    kecMap.set(row.kecamatan, entry);
  }
  const perKecamatan = Array.from(kecMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return {
    total: totalsRow?.total ?? 0,
    totalNilai: Number(totalsRow?.totalNilai ?? 0),
    selesaiCount: perStatus.SELESAI,
    kecamatanCount: kecMap.size,
    perStatus,
    perSumberDana,
    belumDitetapkan,
    perKecamatan,
  };
}

export type BnbaListParams = {
  q?: string;
  kecamatan?: string;
  status?: string;
  sumberDana?: string;
  page?: number;
  pageSize?: number;
};

export async function getBnbaList(params: BnbaListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, params.pageSize ?? 12));
  const conditions = [];

  if (params.q) {
    const pattern = `%${params.q}%`;
    conditions.push(
      or(
        ilike(bnba.namaKk, pattern),
        ilike(bnba.nik, pattern),
        ilike(bnba.noKk, pattern),
        ilike(bnba.alamatLengkap, pattern),
        ilike(bnba.desaKelurahan, pattern)
      )
    );
  }
  if (params.kecamatan) conditions.push(eq(bnba.kecamatan, params.kecamatan));
  if (params.status && STATUS_ORDER.includes(params.status as BnbaStatus))
    conditions.push(eq(bnba.status, params.status as BnbaStatus));
  if (
    params.sumberDana &&
    SUMBER_DANA_ORDER.includes(params.sumberDana as SumberDana)
  )
    conditions.push(eq(bnba.sumberDana, params.sumberDana as SumberDana));

  const where = conditions.length ? and(...conditions) : undefined;

  const [items, [totalRow]] = await Promise.all([
    db
      .select()
      .from(bnba)
      .where(where)
      .orderBy(desc(bnba.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(bnba).where(where),
  ]);

  return {
    items,
    total: totalRow?.total ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((totalRow?.total ?? 0) / pageSize)),
  };
}

export async function getBnbaById(id: number) {
  const [row] = await db.select().from(bnba).where(eq(bnba.id, id)).limit(1);
  return row ?? null;
}

export async function getStatusHistory(bnbaId: number) {
  return db
    .select()
    .from(statusLogs)
    .where(eq(statusLogs.bnbaId, bnbaId))
    .orderBy(desc(statusLogs.createdAt));
}

export async function getRecentBnba(limit = 6) {
  return db.select().from(bnba).orderBy(desc(bnba.updatedAt)).limit(limit);
}

export async function getRecentLogs(limit = 8) {
  return db
    .select({
      id: statusLogs.id,
      bnbaId: statusLogs.bnbaId,
      fromStatus: statusLogs.fromStatus,
      toStatus: statusLogs.toStatus,
      note: statusLogs.note,
      changedBy: statusLogs.changedBy,
      createdAt: statusLogs.createdAt,
      namaKk: bnba.namaKk,
      kecamatan: bnba.kecamatan,
    })
    .from(statusLogs)
    .leftJoin(bnba, eq(statusLogs.bnbaId, bnba.id))
    .orderBy(desc(statusLogs.createdAt))
    .limit(limit);
}

/** Jumlah data per kecamatan untuk peta/histori */
export async function getKecamatanCounts() {
  const rows = await db
    .select({ kecamatan: bnba.kecamatan, total: count() })
    .from(bnba)
    .groupBy(bnba.kecamatan)
    .orderBy(desc(count()));
  return rows;
}

export const sqlNow = sql`now()`;
