"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

export function Header({ user, isAdmin }: { user: PublicUser | null; isAdmin?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Explorar" },
    { href: "/protocolo", label: "Protocolo" },
    { href: "/alquileres", label: "Intercambios" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-[#F4F1EA]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-forest-800 sm:text-2xl">
            Alquila
          </span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-700 sm:inline">
            Beta Lima
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-ink-700 hover:bg-white",
                path === l.href && "bg-white text-forest-800 shadow-sm",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Link
                href="/items/nuevo"
                className="hidden min-h-[44px] items-center rounded-full bg-forest-800 px-3 py-1.5 text-sm font-semibold text-white md:inline-flex"
              >
                Publicar
              </Link>
              <Link
                href="/perfil"
                className="hidden min-h-[44px] items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold sm:inline-flex"
              >
                {user.nombre}
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="hidden text-xs font-semibold text-gold-700 md:inline">
                  Admin
                </Link>
              ) : null}
              <button
                onClick={logout}
                className="hidden min-h-[44px] items-center text-xs text-ink-400 hover:text-ink-900 md:inline-flex"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-semibold text-ink-700 sm:inline">
                Entrar
              </Link>
              <Link
                href="/registro"
                className="hidden min-h-[44px] items-center rounded-full bg-forest-800 px-3 py-1.5 text-sm font-semibold text-white sm:inline-flex"
              >
                Crear cuenta
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-white md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink-100 bg-[#F4F1EA] px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-semibold",
                    path === l.href ? "bg-white text-forest-800" : "text-ink-700",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <Link href="/items/nuevo" onClick={() => setOpen(false)} className="block min-h-[44px] px-3 py-2.5 text-sm font-semibold">
                    Publicar bien
                  </Link>
                </li>
                <li>
                  <Link href="/perfil" onClick={() => setOpen(false)} className="block min-h-[44px] px-3 py-2.5 text-sm font-semibold">
                    Mi perfil
                  </Link>
                </li>
                {isAdmin ? (
                  <li>
                    <Link href="/admin" onClick={() => setOpen(false)} className="block min-h-[44px] px-3 py-2.5 text-sm font-semibold text-gold-700">
                      Admin
                    </Link>
                  </li>
                ) : null}
                <li>
                  <button onClick={() => { setOpen(false); logout(); }} className="block min-h-[44px] w-full px-3 py-2.5 text-left text-sm text-ink-400">
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" onClick={() => setOpen(false)} className="block min-h-[44px] px-3 py-2.5 text-sm font-semibold">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/registro" onClick={() => setOpen(false)} className="block min-h-[44px] px-3 py-2.5 text-sm font-semibold text-forest-800">
                    Crear cuenta
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
