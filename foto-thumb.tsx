"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { driveImageSrc } from "@/lib/drive";

type Props = {
  url: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
};

export default function FotoThumb({ url, alt, className = "", eager }: Props) {
  const [error, setError] = useState(false);
  const src = driveImageSrc(url, 900);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 text-sky-300 ${className}`}
      >
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={className}
    />
  );
}
