# Panduan Publikasi Website SI-RTLH Konawe

Dokumen ini berisi langkah lengkap untuk membawa **SI-RTLH Konawe** dari proyek
lokal menjadi website yang terpublish dan dapat diakses publik di internet,
misalnya di `https://si-rtlh-konawe.vercel.app` atau domain resmi
`https://si-rtlh.konawekab.go.id`.

Estimasi waktu: **± 60–90 menit** (jalur cepat Vercel + Neon, tanpa biaya).

---

## Daftar Isi

1. [Prasyarat & Akun yang Dibutuhkan](#1-prasyarat--akun-yang-dibutuhkan)
2. [Menyiapkan Kode Sumber](#2-menyiapkan-kode-sumber)
3. [Menyiapkan Database PostgreSQL Produksi](#3-menyiapkan-database-postgresql-produksi)
4. [Migrasi Skema & Data Awal](#4-migrasi-skema--data-awal)
5. [Menghubungkan Google Form + Spreadsheet](#5-menghubungkan-google-form--spreadsheet)
6. [Menghubungkan Google My Maps](#6-menghubungkan-google-my-maps)
7. [Deploy ke Vercel](#7-deploy-ke-vercel)
8. [Memasang Domain Resmi .go.id (Opsional)](#8-memasang-domain-resmi-goid-opsional)
9. [Checklist Uji Akhir Pasca-Deploy](#9-checklist-uji-akhir-pasca-deploy)
10. [Alternatif: Deploy di VPS Sendiri](#10-alternatif-deploy-di-vps-sendiri)
11. [Keamanan & Operasional](#11-keamanan--operasional)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prasyarat & Akun yang Dibutuhkan

Siapkan akun berikut (semuanya tersedia paket **gratis**):

| Layanan | Fungsi | Daftar |
| --- | --- | --- |
| GitHub | Menyimpan kode sumber | https://github.com |
| Vercel | Hosting aplikasi Next.js | https://vercel.com (login dengan GitHub) |
| Neon | Database PostgreSQL serverless | https://neon.tech (login dengan GitHub) |
| Akun Google dinas | Google Form, Spreadsheet, My Maps | https://accounts.google.com |

Perangkat kerja: komputer dengan **Node.js ≥ 20.9** (cek: `node -v`), dan Git.

> Alternatif database lain: Supabase, Railway, atau PostgreSQL di VPS/komputer
> dinas sendiri — langkahnya setara, yang penting Anda mendapatkan
> *connection string* `postgresql://...`.

---

## 2. Menyiapkan Kode Sumber

1. **Dapatkan seluruh folder proyek ini** (unduh ZIP dari platform, atau clone
   jika sudah terhubung ke Git), lalu buka di editor (VS Code).
2. Install dependensi:

   ```bash
   npm install
   ```

3. Buat file `.env` lokal untuk pengujian:

   ```bash
   cp .env.example .env
   ```

   Isi `DATABASE_URL` dengan database lokal/staging untuk mencoba. File `.env`
   sudah masuk `.gitignore` sehingga **tidak akan ikut ter-commit**.

4. (Lokal saja) jalankan untuk memastikan semuanya sehat:

   ```bash
   npx drizzle-kit push
   npx tsx src/db/seed.ts
   npm run build
   ```

5. **Unggah ke GitHub:**

   ```bash
   git init
   git add -A
   git commit -m "SI-RTLH Konawe — rilis awal"
   git branch -M main
   git remote add origin https://github.com/<nama-akun-atau-organisasi>/si-rtlh-konawe.git
   git push -u origin main
   ```

   Buat repository kosong terlebih dahulu di https://github.com/new (disarankan
   nama: `si-rtlh-konawe`, visibility *Private*).

---

## 3. Menyiapkan Database PostgreSQL Produksi (Neon)

1. Masuk ke https://neon.tech → **Create a project**.
2. Isi nama proyek: `si-rtlh-konawe`, pilih region **Singapore** (paling dekat
   dengan Indonesia), PostgreSQL versi terbaru → **Create project**.
3. Pada dashboard proyek, salin **Connection String**, bentuknya:

   ```
   postgresql://<user>:<password>@<host>.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. Simpan string ini baik-baik — ini adalah `DATABASE_URL` produksi Anda.

> **Catatan:** Neon free tier sudah mencakup 0,5 GB storage — lebih dari cukup
> untuk puluhan ribu baris data BNBA + riwayat. Backup otomatis (point-in-time)
> tersedia.

---

## 4. Migrasi Skema & Data Awal

Jalankan **dari komputer Anda** (folder proyek), mengarah ke database produksi:

```bash
# 1) Membuat tabel-tabel (users, bnba, status_logs + enum)
DATABASE_URL="<connection-string-neon>" npx drizzle-kit push --config drizzle.config.prod.ts

# 2) Membuat akun petugas awal + data contoh (hanya mengisi tabel yang kosong)
DATABASE_URL="<connection-string-neon>" npx tsx src/db/seed.ts
```

Hasil seed: 3 akun petugas dan 56 baris data **contoh**.

### Membersihkan data contoh (disarankan sebelum serah terima)

```bash
psql "<connection-string-neon>" -c "TRUNCATE bnba, status_logs RESTART IDENTITY CASCADE;"
```

Akun petugas tetap ada; data BNBA diisi ulang lewat sinkronisasi spreadsheet
(Tahap 5) atau kembali jalankan `npx tsx src/db/seed.ts` kapan pun.

### WAJIB: Ganti kata sandi akun produksi

```bash
# Buat hash kata sandi baru
node -e "console.log(require('bcryptjs').hashSync('KataSandiKuat!2026', 10))"

# Terapkan (ganti <hash> dengan keluaran perintah di atas)
psql "<connection-string-neon>" -c "UPDATE users SET password_hash='<hash>' WHERE username IN ('superadmin','operator.perkim','verifikator');"
```

---

## 5. Menghubungkan Google Form + Spreadsheet

Sistem membaca jawaban Google Form melalui **URL CSV** dari spreadsheet
responden yang sudah eksisting.

1. Buka **Google Form** pendataan BNBA → tab **Jawaban/Responses** → ikon
   *Link to Sheets* → **Buat spreadsheet baru** (atau gunakan yang sudah ada).
2. Di **Google Sheets** respon tersebut, pastikan header kolom sesuai format
   yang dikenali sistem:

   ```
   No · Nama KK · NIK · No KK · Alamat Lengkap · Desa/Kelurahan · Kecamatan
   Foto Rumah Tampak Depan · Foto Tampak Samping Kanan
   Foto Tampak Samping Kiri · Foto Tampak Belakang
   ```

   (Urutan bebas; pencocokan toleran huruf besar/kecil. Kolom tambahan seperti
   `Timestamp` otomatis diabaikan.)

3. Publikasikan sebagai CSV: **File → Publikasikan ke web** → pilih sheet
   *Form Responses 1* → format **CSV** → **Publikasikan** → salin tautan
   (berbentuk `https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?output=csv`).

   > Alternatif: ubah berbagi menjadi "Siapa saja yang memiliki link dapat
   > melihat", lalu gunakan
   > `https://docs.google.com/spreadsheets/d/<ID-SPREADSHEET>/export?format=csv`.

4. Simpan tautan tersebut sebagai env **`GOOGLE_SHEET_CSV_URL`** (Tahap 7).

5. **Uji sinkronisasi:** masuk sebagai petugas → **Dashboard → Tarik Data dari
   Spreadsheet**. Data baru otomatis berstatus *Usulan Baru*; data lama
   (berdasarkan NIK) diperbarui tanpa mengubah tahapannya.

> Foto rumah dari Google Drive otomatis dikonversi menjadi gambar yang tampil
> di website. Pastikan folder Drive hasil unggahan form dapat diakses
> *"Siapa saja yang memiliki link"* agar foto tampil untuk publik.

---

## 6. Menghubungkan Google My Maps

1. Buka https://mymaps.google.com → **Create a New Map / Buat Peta Baru**.
2. **Add layer → Import** → pilih spreadsheet BNBA (boleh file yang sama):
   - Pilih kolom **posisi penanda**: `Alamat Lengkap`, `Desa/Kelurahan`,
     `Kecamatan`.
   - Pilih kolom **judul penanda**: `Nama KK`.
3. Rapikan: ubah nama peta menjadi *"Sebaran Bantuan RTLH Kab. Konawe"*,
   atur warna/ikon per status bila diinginkan. Untuk sebaran terbaru, cukup
   impor ulang (timpa layer) secara berkala.
4. **Share/Bagikan →** ubah menjadi **Publik di web** (*Public on the web*,
   akses: dapat melihat).
5. Menu ⋮ → **"Sematkan di situs saya / Embed on my site"** → salin nilai
   `src` pada iframe, contoh:

   ```
   https://www.google.com/maps/d/embed?mid=1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```

6. Simpan sebagai env **`NEXT_PUBLIC_MY_MAPS_URL`** (Tahap 7).

> Opsional: `NEXT_PUBLIC_GOOGLE_FORM_URL` diisi tautan Google Form untuk tombol
> "Isi Formulir Usulan" pada beranda.

---

## 7. Deploy ke Vercel

### 7.1 Import proyek

1. Masuk https://vercel.com → **Add New… → Project**.
2. **Import** repository `si-rtlh-konawe` dari GitHub.
3. Vercel otomatis mendeteksi **Next.js** — biarkan pengaturan bawaan
   (Build: `next build`, Install: `npm install`).

### 7.2 Isi Environment Variables

Pada langkah yang sama (atau nanti di **Project → Settings → Environment
Variables**, scope *Production* + *Preview*), tambahkan:

| Key | Nilai |
| --- | --- |
| `DATABASE_URL` | connection string Neon (Tahap 3) |
| `SESSION_SECRET` | string acak panjang — buat via `openssl rand -base64 48` |
| `GOOGLE_SHEET_CSV_URL` | URL CSV dari Tahap 5 |
| `NEXT_PUBLIC_MY_MAPS_URL` | URL embed My Maps dari Tahap 6 |
| `NEXT_PUBLIC_GOOGLE_FORM_URL` | URL Google Form pendataan |

### 7.3 Deploy

Klik **Deploy** → tunggu ± 2–3 menit → website live di
`https://<nama-proyek>.vercel.app`.

Setiap `git push` ke branch `main` berikutnya akan otomatis membangun ulang dan
mempublish versi terbaru (CI/CD bawaan Vercel).

> Deploy via CLI (opsional): `npm i -g vercel && vercel --prod`

---

## 8. Memasang Domain Resmi .go.id (Opsional)

1. **Usulkan subdomain** ke Diskominfo Kab. Konawe, misal
   `si-rtlh.perumahan.konawekab.go.id` atau `si-rtlh.konawekab.go.id`.
2. Di Vercel: **Project → Settings → Domains → Add** → masukkan subdomain
   tersebut.
3. Minta admin DNS (Diskominfo) menambahkan record:

   | Type | Name | Value |
   | --- | --- | --- |
   | `CNAME` | `si-rtlh` (atau `si-rtlh.perumahan`) | `cname.vercel-dns.com` |

4. Tunggu propagasi (± 5–60 menit). **HTTPS/SSL otomatis** diterbitkan Vercel
   (Let's Encrypt) — tidak perlu sertifikat manual.

> Untuk kepatuhan aplikasi pemerintah: pertimbangkan pendaftaran **PSE
> (Penyelenggara Sistem Elektronik)** ke Komdigi dan pencantuman kebijakan
> privasi. Sistem ini sudah menyamarkan NIK/No. KK untuk publik sesuai prinsip
> UU PDP No. 27/2022.

---

## 9. Checklist Uji Akhir Pasca-Deploy

- [ ] Homepage tampil, statistik bergerak (bukan 0 semua)
- [ ] `/data` — pencarian, filter kecamatan/status/sumber dana, pagination
- [ ] `/data/<id>` — foto tampil, langkah status, riwayat muncul
- [ ] `/peta` — My Maps tampil dengan penanda lokasi
- [ ] `/login` — login petugas berhasil; **ganti password demo**
- [ ] Dashboard admin — "Tarik Data dari Spreadsheet" menghasilkan ringkasan
      baris baru/diperbarui
- [ ] Edit status dari detail profil → riwayat bertambah & beranda ikut berubah
- [ ] Akses tanpa login: API edit menolak (403), NIK tersamarkan
- [ ] Tampilan mobile (menu hamburger, kartu data)
- [ ] Data contoh sudah dibersihkan (Tahap 4) bila serah terima

---

## 10. Alternatif: Deploy di VPS Sendiri

Cocok bila dinas mewajibkan server sendiri (Ubuntu 22.04/24.04, 1 vCPU/1 GB
RAM sudah cukup).

```bash
# 1) Node.js 22 + PostgreSQL + Nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs postgresql nginx certbot python3-certbot-nginx git

# 2) Database lokal
sudo -u postgres psql -c "CREATE DATABASE si_rtlh;"
sudo -u postgres psql -c "CREATE USER si_rtlh WITH PASSWORD 'password-kuat';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE si_rtlh TO si_rtlh;"

# 3) Kode & environment
git clone https://github.com/<org>/si-rtlh-konawe.git && cd si-rtlh-konawe
npm ci
cp .env.example .env && nano .env        # isi DATABASE_URL=postgresql://si_rtlh:password-kuat@127.0.0.1:5432/si_rtlh dll.

# 4) Skema + akun awal
npx drizzle-kit push --config drizzle.config.prod.ts
npx tsx src/db/seed.ts

# 5) Build & jalankan dengan PM2
npm run build
sudo npm i -g pm2
pm2 start npm --name si-rtlh -- start
pm2 save && pm2 startup
```

Nginx reverse proxy `/etc/nginx/sites-available/si-rtlh`:

```nginx
server {
    listen 80;
    server_name si-rtlh.konawekab.go.id;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    client_max_body_size 10m;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/si-rtlh /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d si-rtlh.konawekab.go.id   # HTTPS otomatis
```

Update versi: `git pull && npm ci && npm run build && pm2 restart si-rtlh`.

---

## 11. Keamanan & Operasional

- **Jangan pernah commit `.env`** — sudah dilindungi `.gitignore`.
- `SESSION_SECRET` produksi wajib unik & panjang (≥ 48 karakter acak); rotasi
  bila dicurigai bocor (semua sesi login akan logout).
- Ganti password seluruh akun seed sebelum serah terima; gunakan password kuat
  per petugas.
- Batasi visibilitas spreadsheet respon: *Publish to web (CSV)* cukup untuk
  sinkronisasi; **jangan** beri akses edit ke publik.
- Folder Drive foto form: cukup "dapat melihat dengan link".
- Monitoring: Vercel → tab *Logs/Analytics*; Neon → dashboard query. Aktifkan
  notifikasi email Vercel untuk build gagal.
- Backup berkala: ekspor CSV dari Neon (`psql -c "\copy bnba TO 'bnba.csv' CSV HEADER"`)
  atau gunakan fitur *branch/restore* Neon.
- Alur kerja rutin: warga isi Google Form → operator klik **Tarik Data** →
  verifikator lapangan → operator memajukan status di detail profil →
  import ulang ke My Maps saat ada perubahan sebaran.

## 12. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| "Variabel GOOGLE_SHEET_CSV_URL belum disetel" | Env belum diisi / belum redeploy | Isi env di Vercel → **Redeploy** |
| Sinkronisasi 0 baris valid | Header kolom tidak cocok | Samakan header dengan format Tahap 5 |
| Foto Drive tidak tampil | File tidak publik | Set folder Drive: "Siapa saja dengan link dapat melihat" |
| Login gagal setelah deploy | Akun belum ada di DB produksi | Jalankan seed Tahap 4 langkah 2 |
| Error koneksi database | SSL/URL salah | Pastikan string Neon utuh termasuk `?sslmode=require` |
| My Maps kosong/403 | Peta belum publik | My Maps → Share → *Public on the web* |
| Perubahan env tidak berlaku | Build lama | Vercel → Deployments → **Redeploy** (NEXT_PUBLIC_* butuh build ulang) |

---

© Dinas Perumahan dan Kawasan Permukiman Kabupaten Konawe — SI-RTLH Konawe.
