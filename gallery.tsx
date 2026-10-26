"use client";

import { useState } from "react";
import { ExternalLink, HardDrive } from "lucide-react";
import FotoThumb from "@/components/foto-thumb";
import { driveViewUrl } from "@/lib/drive";

export type GalleryPhoto = {
  key: string;
  label: string;
  url: string;
  isDrive: boolean;
};

export default function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [active, setActive] = useState(0);
  const current = photos[active];

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-sky-50/60 text-sky-300">
        <HardDrive className="h-10 w-10" />
        <p className="mt-3 text-sm font-semibold text-sky-700">
          Dokumentasi foto belum tersedia
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-sky-50 card-shadow">
        <FotoThumb
          key={current.url}
          url={current.url}
          alt={`Foto ${current.label}`}
          eager
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-sky-950/80 to-transparent p-5 pt-14">
          <p className="text-sm font-bold text-white">{current.label}</p>
          <a
            href={driveViewUrl(current.url) ?? current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/30"
          >
            {current.isDrive && <HardDrive className="h-3.5 w-3.5" />}
            Buka Foto
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <button
            key={photo.key}
            onClick={() => setActive(index)}
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
              index === active
                ? "border-sky-500 shadow-lg shadow-sky-500/30"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <FotoThumb
              url={photo.url}
              alt={photo.label}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {index === active && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white" />
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Sumber foto: tautan Google Drive hasil unggahan formulir pendataan.
      </p>
    </div>
  );
}
