import { getDb } from "@/db";
import { getAuth } from "@/lib/auth/server";

async function handler(request: Request) {
  await getDb(); // asegura que las migraciones estén aplicadas (PGlite)
  return getAuth().handler(request);
}

export { handler as GET, handler as POST };
