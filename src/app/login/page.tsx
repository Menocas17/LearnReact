import { LoginButton } from "./login-button";

export const metadata = { title: "Entrar · LearnReact" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-muted">Plataforma personal. Entra con la cuenta de GitHub autorizada.</p>
      </div>
      <LoginButton />
    </div>
  );
}
