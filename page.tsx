import type { Metadata } from "next";
import { ExternalLink, Map as MapIcon, MapPin } from "lucide-react";
import MapEmbed from "@/components/map-embed";
import { KECAMATAN_LIST, MY_MAPS_URL } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { getKecamatanCounts, getOverviewStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Peta Sebaran Bantuan",
  description:
    "Peta sebaran bantuan penanganan Rumah Tidak Layak Huni Kabupaten Konawe, terhubung dengan Google My Maps.",
};

export default async function PetaPage() {
  const [counts, stats] = await Promise.all([
    getKecamatanCounts(),
    getOverviewStats(),
  ]);
  const countMap = new Map(counts.map((c) => [c.kecamatan, c.total]));
  const myMapsViewUrl = MY_MAPS_URL.replace("/embed", "/viewer");

  return (
    <div className="bg-gradient-to-b from-sky-50 to-white">
      <section className="relative overflow-hidden bg-sky-950 pb-16 pt-32 text-white">
        <div className="hero-grid absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-300">
            <MapIcon className="h-4 w-4" /> Google My Maps
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Peta Sebaran <span className="text-gradient-sky">Bantuan</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/80 sm:text-base">
            Setiap penanda pada peta merepresentasikan lokasi penerima bantuan
            yang terverifikasi. Peta ini tersinkron langsung dengan Google My
            Maps Dinas Perkim Kab. Konawe.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-emerald-300" />
              {formatNumber(stats.total)} titik · {stats.kecamatanCount}{" "}
              kecamatan
            </span>
            <a
              href={myMapsViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/40 transition-all hover:scale-[1.03]"
            >
              Buka di Google My Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white p-2 card-shadow">
            <div className="h-[560px] overflow-hidden rounded-[1.6rem] bg-sky-100">
              <MapEmbed />
            </div>
          </div>

          <aside className="flex flex-col rounded-[2rem] border border-sky-100 bg-white p-6 card-shadow">
            <h2 className="text-sm font-bold text-sky-900">
              Cakupan per Kecamatan
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Jumlah unit usulan terdata pada setiap kecamatan.
            </p>
            <div className="mt-4 max-h-[480px] flex-1 space-y-1 overflow-y-auto pr-1">
              {KECAMATAN_LIST.map((kec) => {
                const total = countMap.get(kec) ?? 0;
                return (
                  <div
                    key={kec}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      total > 0
                        ? "bg-sky-50/70 hover:bg-sky-100/70"
                        : "opacity-45"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold text-slate-600">
                      <MapPin
                        className={`h-3.5 w-3.5 ${total > 0 ? "text-sky-500" : "text-slate-300"}`}
                      />
                      {kec}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        total > 0
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-xs leading-relaxed text-sky-800">
              Kecamatan tanpa penanda berarti belum ada usulan yang masuk —
              formulir pendataan masih terbuka untuk seluruh wilayah.
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
