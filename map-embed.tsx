import { MY_MAPS_URL } from "@/lib/constants";

export default function MapEmbed({
  className = "",
  title = "Peta Sebaran Bantuan RTLH Kabupaten Konawe",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <iframe
      src={MY_MAPS_URL}
      title={title}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      className={`h-full w-full border-0 ${className}`}
    />
  );
}
