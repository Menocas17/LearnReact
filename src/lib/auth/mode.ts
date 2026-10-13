export type AuthMode = "local" | "github";

/**
 * "local" permite usar la app sin login (un único usuario) en tu máquina.
 * - En desarrollo es el modo por defecto.
 * - En producción solo se acepta si lo pides con AUTH_MODE=local y no hay
 *   DATABASE_URL (es decir, con PGlite en tu disco). Un despliegue real
 *   necesita DATABASE_URL, así que siempre exige GitHub.
 */
export function getAuthMode(): AuthMode {
  const requested = process.env.AUTH_MODE;
  if (process.env.NODE_ENV === "production") {
    return requested === "local" && !process.env.DATABASE_URL ? "local" : "github";
  }
  return requested === "github" ? "github" : "local";
}

export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  return allowedEmails().includes(email.toLowerCase());
}
