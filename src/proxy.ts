import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { getAuthMode } from "@/lib/auth/mode";

// Chequeo optimista: si no hay cookie de sesión, al login.
// La validación real ocurre en getCurrentUser() (Data Access Layer).
export function proxy(request: NextRequest) {
  if (getAuthMode() === "local") return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
