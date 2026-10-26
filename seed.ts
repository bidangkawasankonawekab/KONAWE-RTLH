import "dotenv/config";
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { db, pool } from "./index";
import { bnba, statusLogs, users } from "./schema";
import {
  KECAMATAN_LIST,
  SUMBER_DANA_ORDER,
  type BnbaStatus,
} from "../lib/constants";

/* ---------------- util deterministik ---------------- */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260702);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const int = (min: number, max: number) =>
  min + Math.floor(rnd() * (max - min + 1));

/* ---------------- pool data contoh ---------------- */
const NAMA_PRIA = [
  "La Ode Hasanuddin",
  "La Ode Arifudin",
  "La Mbao",
  "La Aca",
  "La Ngasara",
  "La Salami",
  "La Ode Samsul Bahri",
  "Muhammad Ridwan",
  "Samsudin",
  "Abdul Rahim",
  "La Unga",
  "Bahrum",
  "La Idu",
  "Sahidin",
  "La Ode Kasim",
  "Herman Tone",
  "Yusuf Baruku",
  "La Farid",
  "La Ode Muslimin",
  "Amiruddin",
  "La Rukman",
  "Syaiful",
  "La Ode Rizal",
  "Nasruddin",
];
const NAMA_WANITA = [
  "Wa Ode Siti Rahma",
  "Wa Ode Nurlaela",
  "Wa Ndoa",
  "Wa Ine",
  "Wa Ode Munasifah",
  "Wa Tina",
  "Wa Daria",
  "Sitti Hasnia",
  "Wa Ode Rabia",
  "Wa Ode Nurhayati",
  "Nurhalima",
  "Wa Ode Samsia",
  "Rosniati",
  "Wa Ode Hasriani",
  "Ratna Sari",
  "Wa Umaya",
  "Wa Ode Masni",
  "Wa Ode Saribanun",
];
const DESA_POOL = [
  "Asinua Jaya",
  "Puuhopa",
  "Morome",
  "Lalonggaluku",
  "Tawamelewe",
  "Amesiu",
  "Peking",
  "Abuki Jaya",
  "Langgonawe",
  "Waturousaha",
  "Mataiwoi",
  "Anggopiu",
  "Puusuli",
  "Tetewatu",
  "Lameuru",
  "Sambuli",
  "Inalobue",
  "Tudouano",
  "Mosiku",
  "Wawolesea",
  "Arombu",
  "Padangguni Lama",
  "Onewila",
  "Lalonggombu",
  "Uepai Indah",
  "Sonai",
  "Tapulia",
  "Linomoiyo",
  "Wanggudu Raya",
  "Ambekairi",
];
const FOTO_SET = [
  {
    depan: "/images/house-a-depan.jpg",
    samping: "/images/house-a-samping.jpg",
    belakang: "/images/house-a-belakang.jpg",
  },
  {
    depan: "/images/house-b-depan.jpg",
    samping: "/images/house-b-samping.jpg",
    belakang: "/images/house-b-belakang.jpg",
  },
];

const CATATAN = [
  "Foto dan berkas lengkap, menunggu jadwal verifikasi lapangan.",
  "Hasil verifikasi: rumah panggung kayu rusak berat, layak dibantu.",
  "Lolos verifikasi berkas dan survei lapangan.",
  "Diusulkan masuk SK penerima bantuan tahun anggaran berjalan.",
  "Pembangunan selesai 100%, serah terima dengan keluarga penerima.",
  "Musyawarah desa menyetujui usulan ini untuk diprioritaskan.",
];

async function seed() {
  console.log("Memeriksa data awal…");

  /* Pengguna */
  const [userCount] = await db.select({ total: count() }).from(users);
  if (userCount.total === 0) {
    const hash = bcrypt.hashSync("Konawe@2026", 10);
    await db.insert(users).values([
      {
        name: "Super Admin",
        username: "superadmin",
        passwordHash: hash,
        role: "SUPER_ADMIN",
      },
      {
        name: "Operator Perkim",
        username: "operator.perkim",
        passwordHash: hash,
        role: "OPERATOR",
      },
      {
        name: "Verifikator Lapangan",
        username: "verifikator",
        passwordHash: hash,
        role: "OPERATOR",
      },
    ]);
    console.log("✔ 3 akun petugas dibuat (kata sandi: Konawe@2026)");
  } else {
    console.log("• Akun sudah ada, dilewati.");
  }

  /* Data BNBA */
  const [bnbaCount] = await db.select({ total: count() }).from(bnba);
  if (bnbaCount.total > 0) {
    console.log("• Data BNBA sudah terisi, dilewati.");
    await pool.end();
    return;
  }

  const TOTAL = 56;
  const usedNames = new Set<string>();
  const rows = [];

  for (let i = 0; i < TOTAL; i++) {
    const namePool = rnd() > 0.42 ? NAMA_PRIA : NAMA_WANITA;
    let nama = pick(namePool);
    let attempts = 0;
    while (usedNames.has(nama) && attempts < 30) {
      nama = pick(namePool);
      attempts++;
    }
    if (usedNames.has(nama)) {
      nama = `${nama} ${["II", "III", "IV", "V", "VI"][i % 5]}`;
    }
    usedNames.add(nama);

    // Pastikan semua kecamatan terwakili, sisanya acak (Unaaha lebih padat)
    const kecamatan =
      i < KECAMATAN_LIST.length
        ? KECAMATAN_LIST[i]
        : rnd() < 0.22
          ? "Unaaha"
          : pick(KECAMATAN_LIST);

    const desa = pick(DESA_POOL);
    const roll = rnd();
    const status: BnbaStatus =
      roll < 0.32
        ? "USULAN_BARU"
        : roll < 0.58
          ? "TAHAP_VERIFIKASI"
          : roll < 0.78
            ? "MASUK_SK"
            : "SELESAI";

    let sumberDana = null as (typeof SUMBER_DANA_ORDER)[number] | null;
    if (status === "SELESAI" || status === "MASUK_SK") {
      sumberDana = pick(SUMBER_DANA_ORDER);
    } else if (status === "TAHAP_VERIFIKASI" && rnd() < 0.4) {
      sumberDana = pick(SUMBER_DANA_ORDER);
    }

    const tahun =
      status === "SELESAI" ? pick([2023, 2023, 2024, 2024, 2025]) : pick([2025, 2025, 2026]);
    const kecIdx = KECAMATAN_LIST.indexOf(
      kecamatan as (typeof KECAMATAN_LIST)[number]
    );
    const nik = `7404${String((kecIdx < 0 ? 0 : kecIdx) + 1).padStart(2, "0")}${String(
      int(1, 28)
    ).padStart(2, "0")}${String(int(1, 12)).padStart(2, "0")}${String(
      int(60, 99)
    )}${String(1000 + i).slice(1)}${int(0, 9)}`;
    const noKk = `7404${String(202400000000 + i * 37 + int(0, 36)).slice(0, 12)}`;
    const foto = FOTO_SET[i % FOTO_SET.length];

    rows.push({
      namaKk: nama,
      nik,
      noKk,
      alamatLengkap: `Dusun ${["I", "II", "III", "IV"][i % 4]} RT ${String(
        int(1, 9)
      ).padStart(3, "0")}/RW ${String(int(1, 4)).padStart(3, "0")}, Desa ${desa}`,
      desaKelurahan: desa,
      kecamatan,
      status,
      sumberDana,
      tahun,
      nilaiBantuan: pick([17500000, 20000000, 20000000, 25000000]),
      fotoDepan: foto.depan,
      fotoKanan: foto.samping,
      fotoKiri: foto.samping,
      fotoBelakang: foto.belakang,
    });
  }

  const inserted = await db.insert(bnba).values(rows).returning({
    id: bnba.id,
    status: bnba.status,
    tahun: bnba.tahun,
  });

  /* Riwayat status contoh */
  const logs: (typeof statusLogs.$inferInsert)[] = [];
  for (const rec of inserted) {
    const base = new Date(rec.tahun, int(0, 5), int(1, 27), 9, 15);
    logs.push({
      bnbaId: rec.id,
      fromStatus: null,
      toStatus: "USULAN_BARU",
      note: "Usulan masuk melalui formulir pendataan daring.",
      changedBy: "Sistem Pendataan",
      createdAt: base,
    });
    if (rec.status !== "USULAN_BARU") {
      logs.push({
        bnbaId: rec.id,
        fromStatus: "USULAN_BARU",
        toStatus: rec.status === "TAHAP_VERIFIKASI" ? "TAHAP_VERIFIKASI" : rec.status,
        note: pick(CATATAN),
        changedBy: "Operator Perkim",
        createdAt: new Date(base.getTime() + 86400000 * int(20, 90)),
      });
    }
  }
  await db.insert(statusLogs).values(logs);

  console.log(`✔ ${inserted.length} data BNBA & ${logs.length} riwayat dibuat.`);
  await pool.end();
}

seed().catch(async (err) => {
  console.error("Gagal melakukan seed:", err);
  await pool.end();
  process.exit(1);
});
