import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

type DbState = { db: Database; ready: Promise<void> };

// Un solo cliente por proceso. En desarrollo el módulo se recarga con cada
// cambio, así que lo guardamos en globalThis para no abrir PGlite dos veces.
const globalForDb = globalThis as unknown as { __learnreactDb?: DbState };

function createDb(): DbState {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Pocas conexiones por instancia: en Vercel cada función serverless abre su propio pool.
    // Usa la cadena "pooled" de Neon (host con -pooler) para no agotar conexiones.
    const pool = new Pool({ connectionString: url, max: 5 });
    // Las migraciones de Postgres real se aplican con `pnpm db:migrate`.
    return { db: drizzlePg(pool, { schema }), ready: Promise.resolve() };
  }

  // Ruta acotada a ./.data: una ruta totalmente dinámica haría que el build empaquete
  // todo el proyecto en la función de servidor (Vercel tiene límite de tamaño).
  const dataDir = path.join(process.cwd(), ".data", process.env.PGLITE_DIR ?? "pglite");
  mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema });
  const ready = migratePglite(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  return { db, ready };
}

function getState(): DbState {
  globalForDb.__learnreactDb ??= createDb();
  return globalForDb.__learnreactDb;
}

/** Devuelve la base de datos lista para usar (migrada si es PGlite). */
export async function getDb(): Promise<Database> {
  const state = getState();
  await state.ready;
  return state.db;
}

/** Acceso síncrono para librerías que reciben la instancia al configurarse (Better Auth). */
export function getDbUnsafe(): Database {
  return getState().db;
}
