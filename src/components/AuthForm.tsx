"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRITOS_LIMA } from "@/lib/peru";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload =
      mode === "login"
        ? { email: fd.get("email"), password: fd.get("password") }
        : {
            nombre: fd.get("nombre"),
            apellidos: fd.get("apellidos"),
            dni: fd.get("dni"),
            telefono: fd.get("telefono"),
            email: fd.get("email"),
            password: fd.get("password"),
            distrito: fd.get("distrito"),
            acceptTerms: fd.get("acceptTerms") === "on",
          };
    const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error");
      return;
    }
    router.push(mode === "register" ? "/verificar" : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {mode === "register" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="nombre" label="Nombres" required />
            <Field name="apellidos" label="Apellidos" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="dni" label="DNI (8 dígitos)" required maxLength={8} />
            <Field name="telefono" label="Celular (9 dígitos)" required maxLength={9} />
          </div>
          <label className="block text-sm font-medium">
            Distrito
            <select
              name="distrito"
              required
              className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-3 py-2"
            >
              {DISTRITOS_LIMA.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <Field name="email" label="Correo" type="email" required />
      <Field name="password" label="Contraseña" type="password" required />
      {mode === "register" && (
        <label className="flex items-start gap-2 text-sm">
          <input name="acceptTerms" type="checkbox" required className="mt-1" />
          <span>
            Acepto los{" "}
            <Link href="/legal/terminos" className="font-semibold text-forest-700" target="_blank">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/legal/privacidad" className="font-semibold text-forest-700" target="_blank">
              Política de Privacidad
            </Link>{" "}
            (Ley 29733).
          </span>
        </label>
      )}
      {error ? <p className="text-sm font-medium text-danger-600">{error}</p> : null}
      <button
        disabled={loading}
        className="w-full rounded-full bg-forest-800 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
      <div className="rounded-xl bg-ink-50 p-3 text-xs leading-5 text-ink-700">
        <p className="font-bold">Cuentas demo · contraseña Demo2026!</p>
        <p>admin@alquila.pe — panel /admin</p>
        <p>luis.vargas@alquila.pe — arrendatario (firma DNI 1450)</p>
        <p>maria.torres@alquila.pe — dueña, sillas activas (1239)</p>
        <p>carlos.mendoza@alquila.pe — dueño, devolución taladro (1235)</p>
        <p>diego.ramirez@alquila.pe — acepta la PS5 (1458)</p>
        <p>rosa.huaman@alquila.pe — sin verificar (bloqueo anti-estafa)</p>
      </div>
      {mode === "login" ? (
        <p className="text-center text-sm">
          ¿Nuevo?{" "}
          <Link href="/registro" className="font-semibold text-forest-700">
            Regístrate
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-forest-700">
            Entra
          </Link>
        </p>
      )}
    </form>
  );
}

function Field(props: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        maxLength={props.maxLength}
        className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-3 py-2"
      />
    </label>
  );
}
