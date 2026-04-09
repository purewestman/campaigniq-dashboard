import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * File metadata table for S3-stored documents.
 * Actual file bytes live in S3; this table tracks metadata for querying/authorization.
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  /** Original filename as uploaded by the user */
  filename: varchar("filename", { length: 512 }).notNull(),
  /** S3 object key for retrieval */
  fileKey: varchar("fileKey", { length: 1024 }).notNull(),
  /** Public CDN URL returned by storagePut */
  url: text("url").notNull(),
  /** MIME type of the file */
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  /** File size in bytes */
  sizeBytes: bigint("sizeBytes", { mode: "number" }).notNull(),
  /** Category/tag for organizing files (e.g., "certification", "training", "report") */
  category: varchar("category", { length: 64 }).default("general"),
  /** Optional description or notes about the file */
  description: text("description"),
  /** ID of the user who uploaded the file */
  uploadedById: int("uploadedById").notNull(),
  /** Name of the uploader (denormalized for display) */
  uploadedByName: varchar("uploadedByName", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FileRecord = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;
