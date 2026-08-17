import { AuthForm } from "@/components/AuthForm";

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-4xl">Crear cuenta</h1>
      <p className="mt-2 text-ink-400">
        El DNI y el celular se validan en el siguiente paso. Sin eso no puedes publicar ni alquilar.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
