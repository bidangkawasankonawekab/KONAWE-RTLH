import Link from "next/link";
import { Home, Mail, MapPin, Phone } from "lucide-react";
import { DINAS_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-sky-950 text-sky-100">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-700 text-white shadow-lg shadow-sky-500/30">
              <Home className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-extrabold tracking-tight text-white">
                SI-RTLH <span className="text-sky-400">Konawe</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-sky-300/80">
                Rumah Layak Huni untuk Semua
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-sky-200/80">
            {DINAS_NAME}. Sistem informasi terpadu untuk pendataan Baseline
            Nama dan Alamat (BNBA), pemetaan sebaran bantuan, serta pemantauan
            tahapan penanganan rumah tidak layak huni secara transparan dan
            akuntabel.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">
            Navigasi
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm font-medium text-sky-100/85">
            {[
              { href: "/", label: "Beranda" },
              { href: "/data", label: "Data BNBA" },
              { href: "/peta", label: "Peta Sebaran Bantuan" },
              { href: "/login", label: "Masuk Sistem" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">
            Kantor Dinas
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-sky-100/85">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>
                Jl. Poros Unaaha, Kec. Unaaha, Kabupaten Konawe, Sulawesi
                Tenggara 93411
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>(0408) 000‑0000</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>perkim@konawekab.go.id</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-sky-300/70 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {DINAS_NAME}. Hak cipta dilindungi.
          </p>
          <p>Terhubung dengan Google Forms, Spreadsheet &amp; Google My Maps.</p>
        </div>
      </div>
    </footer>
  );
}
