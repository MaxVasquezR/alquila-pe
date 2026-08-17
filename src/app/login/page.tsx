import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl">Entrar</h1>
      <p className="mt-2 text-ink-400">Solo cuentas con DNI peruano y celular WhatsApp.</p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
