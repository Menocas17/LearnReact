"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { bookmark } from "@/db/schema";
import { lessons } from "@/content/lessons";
import { getCurrentUser } from "@/lib/auth/current-user";

const input = z.object({
  lessonId: z.string().min(1).max(200),
  block: z.number().int().min(0).max(10_000),
  excerpt: z.string().max(200),
});

/** Guarda (o mueve) el único marcador del usuario. */
export async function saveBookmark(raw: z.input<typeof input>) {
  const data = input.parse(raw);
  const user = await getCurrentUser();
  if (!lessons.some((l) => l.id === data.lessonId)) throw new Error("Lección no válida");
  const db = await getDb();
  const values = { ...data, userId: user.id, updatedAt: new Date() };
  await db.insert(bookmark).values(values).onConflictDoUpdate({ target: bookmark.userId, set: values });
  refresh();
}
