"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  Menu,
  Table2,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/data", label: "Data BNBA", icon: Table2 },
  { href: "/peta", label: "Peta Sebaran", icon: Map },
];

type Props = { user: { name: string; role: string } | null };

export default function NavbarClient({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "glass border-b border-sky-100 py-2 shadow-[0_10px_40px_-20px_rgba(2,132,199,0.4)]"
          : "border-b border-transparent bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-sky-700 text-white shadow-lg shadow-sky-500/30 transition-transform duration-300 group-hover:scale-105">
            <Home className="h-5 w-5" strokeWidth={2.4} />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/30" />
          </span>
          <span className="leading-tight">
            <span
              className={`block text-[15px] font-extrabold tracking-tight transition-colors ${
                solid ? "text-sky-900" : "text-white"
              }`}
            >
              SI-RTLH <span className="font-semibold text-sky-400">Konawe</span>
            </span>
            <span
              className={`block text-[10px] font-medium uppercase tracking-[0.16em] transition-colors ${
                solid ? "text-sky-600/70" : "text-sky-100/80"
              }`}
            >
              Dinas Perkim Kab. Konawe
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? solid
                      ? "bg-sky-100 text-sky-800"
                      : "bg-white/15 text-white"
                    : solid
                      ? "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                      : "text-sky-50/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                href="/admin"
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  solid
                    ? "text-sky-800 hover:bg-sky-50"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="max-w-32 truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.03] hover:shadow-sky-500/50"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.03] hover:shadow-sky-500/50"
            >
              <LogIn className="h-4 w-4" /> Masuk
            </Link>
          )}
        </div>

        <button
          aria-label="Buka menu"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors md:hidden ${
            solid ? "text-sky-900 hover:bg-sky-50" : "text-white hover:bg-white/10"
          }`}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="glass absolute inset-x-3 top-full mt-2 rounded-2xl border border-sky-100 p-3 shadow-xl md:hidden">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-50"
            >
              <Icon className="h-4 w-4 text-sky-500" /> {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-50"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-500" /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 text-sm font-bold text-white"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 text-sm font-bold text-white"
            >
              <LogIn className="h-4 w-4" /> Masuk Sistem
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
