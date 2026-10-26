import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "SI-RTLH Konawe — Dinas Perumahan & Kawasan Permukiman",
    template: "%s · SI-RTLH Konawe",
  },
  description:
    "Sistem Informasi Rumah Tidak Layak Huni (SI-RTLH) Kabupaten Konawe — pendataan BNBA, pemetaan sebaran bantuan, dan pemantauan tahapan program perumahan yang transparan.",
  keywords: [
    "RTLH",
    "Konawe",
    "Perumahan",
    "Kawasan Permukiman",
    "BNBA",
    "Sulawesi Tenggara",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="bg-white font-sans text-slate-800 antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
