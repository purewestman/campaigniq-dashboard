import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, files, InsertFile, FileRecord } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── File Storage Queries ────────────────────────────────────────────

export async function insertFile(file: InsertFile): Promise<FileRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(files).values(file);
  const insertId = result[0].insertId;

  const rows = await db.select().from(files).where(eq(files.id, insertId)).limit(1);
  return rows[0];
}

export async function listFiles(): Promise<FileRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(files).orderBy(desc(files.createdAt));
}

export async function getFileById(id: number): Promise<FileRecord | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return rows[0];
}

export async function deleteFile(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(files).where(eq(files.id, id));
}

export async function updateFileMetadata(
  id: number,
  updates: { description?: string; category?: string }
): Promise<FileRecord | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {};
  if (updates.description !== undefined) updateSet.description = updates.description;
  if (updates.category !== undefined) updateSet.category = updates.category;

  if (Object.keys(updateSet).length > 0) {
    await db.update(files).set(updateSet).where(eq(files.id, id));
  }

  return getFileById(id);
}
