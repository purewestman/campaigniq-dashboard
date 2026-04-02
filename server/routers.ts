import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { insertFile, listFiles, deleteFile, updateFileMetadata } from "./db";
import { z } from "zod";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  files: router({
    /** List all files, newest first */
    list: protectedProcedure.query(async () => {
      return listFiles();
    }),

    /** Upload a file — receives base64-encoded data from the client */
    upload: protectedProcedure
      .input(
        z.object({
          filename: z.string().min(1).max(512),
          base64Data: z.string(),
          mimeType: z.string().min(1).max(128),
          sizeBytes: z.number().int().positive(),
          category: z.string().max(64).optional().default("general"),
          description: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.base64Data, "base64");

        // Generate a unique S3 key with random suffix to prevent enumeration
        const ext = input.filename.includes(".")
          ? "." + input.filename.split(".").pop()
          : "";
        const fileKey = `pei-files/${ctx.user.id}-${nanoid(12)}${ext}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save metadata to database
        const record = await insertFile({
          filename: input.filename,
          fileKey,
          url,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          category: input.category,
          description: input.description ?? null,
          uploadedById: ctx.user.id,
          uploadedByName: ctx.user.name ?? "Unknown",
        });

        return record;
      }),

    /** Update file metadata (description, category) */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          description: z.string().max(2000).optional(),
          category: z.string().max(64).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updated = await updateFileMetadata(input.id, {
          description: input.description,
          category: input.category,
        });
        return updated;
      }),

    /** Delete a file (removes DB record; S3 object remains for safety) */
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteFile(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
