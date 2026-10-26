/**
 * Helper untuk tautan Google Drive yang berasal dari unggahan Google Form.
 * Mengubah berbagai format tautan berbagi menjadi URL gambar yang bisa
 * ditampilkan langsung pada elemen <img>.
 */
export function extractDriveId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /drive\.google\.com\/open\?[^"']*id=([a-zA-Z0-9_-]{10,})/,
    /drive\.google\.com\/uc\?[^"']*id=([a-zA-Z0-9_-]{10,})/,
    /drive\.google\.com\/thumbnail\?[^"']*id=([a-zA-Z0-9_-]{10,})/,
    /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function isDriveUrl(url: string | null | undefined): boolean {
  return extractDriveId(url) !== null;
}

/** URL yang aman dipakai sebagai src <img> */
export function driveImageSrc(
  url: string | null | undefined,
  size = 1000
): string | null {
  if (!url) return null;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
  return url;
}

/** URL untuk membuka berkas di Google Drive */
export function driveViewUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/file/d/${id}/view`;
  return url;
}
