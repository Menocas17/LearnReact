import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { user as userTable } from "@/db/schema";
import { getAuthMode, isEmailAllowed } from "./mode";
import { getAuth } from "./server";

export type CurrentUser = {
  id: string;
  name: string;
  image: string | null;
};

const LOCAL_USER = {
  id: "local",
  name: "Aprendiz",
  email: "local@learnreact.dev",
} as const;

/**
 * Data Access Layer: única puerta para saber quién es el usuario.
 * Siempre se resuelve en tiempo de petición, nunca durante el prerender.
 * Devuelve null si no hay sesión válida.
 */
export const getSessionUser = cache(async (): Promise<CurrentUser | null> => {
  if (getAuthMode() === "local") {
    // connection() marca este dato como de tiempo de petición (nunca se prerenderiza).
    await connection();
    const db = await getDb();
    await db.insert(userTable).values(LOCAL_USER).onConflictDoNothing();
    return { id: LOCAL_USER.id, name: LOCAL_USER.name, image: null };
  }

  const requestHeaders = await headers();
  await getDb();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session || !isEmailAllowed(session.user.email)) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    image: session.user.image ?? null,
  };
});

/** Igual que getSessionUser, pero redirige a /login si no hay sesión. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
