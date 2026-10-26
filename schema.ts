import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const bnbaStatusEnum = pgEnum("bnba_status", [
  "USULAN_BARU",
  "TAHAP_VERIFIKASI",
  "MASUK_SK",
  "SELESAI",
]);

export const sumberDanaEnum = pgEnum("sumber_dana", [
  "APBN_KEMENPKP",
  "APBD_PROVINSI",
  "APBD_KABUPATEN",
  "CSR",
  "LAINNYA",
]);

export const userRoleEnum = pgEnum("user_role", ["SUPER_ADMIN", "OPERATOR"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  username: varchar("username", { length: 80 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("OPERATOR"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bnba = pgTable(
  "bnba",
  {
    id: serial("id").primaryKey(),
    namaKk: varchar("nama_kk", { length: 180 }).notNull(),
    nik: varchar("nik", { length: 20 }).unique(),
    noKk: varchar("no_kk", { length: 20 }),
    alamatLengkap: text("alamat_lengkap").notNull(),
    desaKelurahan: varchar("desa_kelurahan", { length: 140 }).notNull(),
    kecamatan: varchar("kecamatan", { length: 140 }).notNull(),
    sumberDana: sumberDanaEnum("sumber_dana"),
    status: bnbaStatusEnum("status").notNull().default("USULAN_BARU"),
    tahun: integer("tahun").notNull().default(2025),
    nilaiBantuan: integer("nilai_bantuan").notNull().default(20000000),
    fotoDepan: text("foto_depan"),
    fotoKanan: text("foto_kanan"),
    fotoKiri: text("foto_kiri"),
    fotoBelakang: text("foto_belakang"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("bnba_kecamatan_idx").on(t.kecamatan),
    index("bnba_status_idx").on(t.status),
    index("bnba_sumber_dana_idx").on(t.sumberDana),
  ]
);

export const statusLogs = pgTable(
  "status_logs",
  {
    id: serial("id").primaryKey(),
    bnbaId: integer("bnba_id")
      .notNull()
      .references(() => bnba.id, { onDelete: "cascade" }),
    fromStatus: bnbaStatusEnum("from_status"),
    toStatus: bnbaStatusEnum("to_status").notNull(),
    note: text("note"),
    changedBy: varchar("changed_by", { length: 160 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("status_logs_bnba_idx").on(t.bnbaId)]
);

export type BnbaRow = typeof bnba.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type StatusLogRow = typeof statusLogs.$inferSelect;
