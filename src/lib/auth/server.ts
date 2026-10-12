import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDbUnsafe } from "@/db";
import * as schema from "@/db/schema";
import { isEmailAllowed } from "./mode";

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDbUnsafe(), { provider: "pg", schema }),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          // La plataforma es personal: solo se crean cuentas de la lista permitida.
          before: async (newUser) => (isEmailAllowed(newUser.email) ? undefined : false),
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Se crea al primer uso para no exigir las variables de GitHub en modo local. */
export function getAuth() {
  instance ??= createAuth();
  return instance;
}
