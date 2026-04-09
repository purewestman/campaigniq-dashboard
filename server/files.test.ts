import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "pei-files/1-abc123.pdf",
    url: "https://cdn.example.com/pei-files/1-abc123.pdf",
  }),
}));

// Mock the db module
const mockFiles: any[] = [];
let nextId = 1;

vi.mock("./db", () => ({
  insertFile: vi.fn().mockImplementation(async (file: any) => {
    const record = { id: nextId++, ...file, createdAt: new Date(), updatedAt: new Date() };
    mockFiles.push(record);
    return record;
  }),
  listFiles: vi.fn().mockImplementation(async () => {
    return [...mockFiles].reverse();
  }),
  deleteFile: vi.fn().mockImplementation(async (id: number) => {
    const idx = mockFiles.findIndex((f) => f.id === id);
    if (idx !== -1) mockFiles.splice(idx, 1);
  }),
  updateFileMetadata: vi.fn().mockImplementation(async (id: number, updates: any) => {
    const file = mockFiles.find((f) => f.id === id);
    if (!file) return undefined;
    if (updates.description !== undefined) file.description = updates.description;
    if (updates.category !== undefined) file.category = updates.category;
    file.updatedAt = new Date();
    return file;
  }),
  // Also mock user functions that might be imported
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getDb: vi.fn(),
}));

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "admin@pei-dashboard.test",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("files.upload", () => {
  beforeEach(() => {
    mockFiles.length = 0;
    nextId = 1;
  });

  it("uploads a file and returns metadata", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.upload({
      filename: "partner-report.pdf",
      base64Data: Buffer.from("test file content").toString("base64"),
      mimeType: "application/pdf",
      sizeBytes: 17,
      category: "report",
      description: "Q1 partner compliance report",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.filename).toBe("partner-report.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.sizeBytes).toBe(17);
    expect(result.category).toBe("report");
    expect(result.description).toBe("Q1 partner compliance report");
    expect(result.uploadedById).toBe(1);
    expect(result.uploadedByName).toBe("Test Admin");
    expect(result.url).toBe("https://cdn.example.com/pei-files/1-abc123.pdf");
  });

  it("uses 'general' as default category when not specified", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.upload({
      filename: "notes.txt",
      base64Data: Buffer.from("some notes").toString("base64"),
      mimeType: "text/plain",
      sizeBytes: 10,
    });

    expect(result.category).toBe("general");
  });

  it("rejects upload when user is not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.files.upload({
        filename: "secret.pdf",
        base64Data: Buffer.from("secret").toString("base64"),
        mimeType: "application/pdf",
        sizeBytes: 6,
      })
    ).rejects.toThrow();
  });

  it("rejects upload with empty filename", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.files.upload({
        filename: "",
        base64Data: Buffer.from("data").toString("base64"),
        mimeType: "application/pdf",
        sizeBytes: 4,
      })
    ).rejects.toThrow();
  });

  it("rejects upload with zero sizeBytes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.files.upload({
        filename: "empty.pdf",
        base64Data: "",
        mimeType: "application/pdf",
        sizeBytes: 0,
      })
    ).rejects.toThrow();
  });
});

describe("files.list", () => {
  beforeEach(() => {
    mockFiles.length = 0;
    nextId = 1;
  });

  it("returns empty array when no files exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.files.list();
    expect(result).toEqual([]);
  });

  it("returns files after upload", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.files.upload({
      filename: "file1.pdf",
      base64Data: Buffer.from("content1").toString("base64"),
      mimeType: "application/pdf",
      sizeBytes: 8,
      category: "certification",
    });

    await caller.files.upload({
      filename: "file2.xlsx",
      base64Data: Buffer.from("content2").toString("base64"),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sizeBytes: 8,
      category: "training",
    });

    const result = await caller.files.list();
    expect(result).toHaveLength(2);
    // Newest first (reversed)
    expect(result[0].filename).toBe("file2.xlsx");
    expect(result[1].filename).toBe("file1.pdf");
  });

  it("rejects list when user is not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.files.list()).rejects.toThrow();
  });
});

describe("files.delete", () => {
  beforeEach(() => {
    mockFiles.length = 0;
    nextId = 1;
  });

  it("deletes a file by id and returns success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Upload a file first
    const uploaded = await caller.files.upload({
      filename: "to-delete.pdf",
      base64Data: Buffer.from("delete me").toString("base64"),
      mimeType: "application/pdf",
      sizeBytes: 9,
    });

    const result = await caller.files.delete({ id: uploaded.id });
    expect(result).toEqual({ success: true });

    // Verify it's gone from the list
    const remaining = await caller.files.list();
    expect(remaining).toHaveLength(0);
  });

  it("rejects delete when user is not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.files.delete({ id: 1 })).rejects.toThrow();
  });

  it("rejects delete with invalid id (zero)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.files.delete({ id: 0 })).rejects.toThrow();
  });

  it("rejects delete with negative id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.files.delete({ id: -1 })).rejects.toThrow();
  });
});

describe("files.update", () => {
  beforeEach(() => {
    mockFiles.length = 0;
    nextId = 1;
  });

  it("updates file description and category", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const uploaded = await caller.files.upload({
      filename: "update-me.pdf",
      base64Data: Buffer.from("update content").toString("base64"),
      mimeType: "application/pdf",
      sizeBytes: 14,
      category: "general",
      description: "Original description",
    });

    const updated = await caller.files.update({
      id: uploaded.id,
      description: "Updated description",
      category: "compliance",
    });

    expect(updated).toBeDefined();
    expect(updated!.description).toBe("Updated description");
    expect(updated!.category).toBe("compliance");
  });

  it("rejects update when user is not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.files.update({ id: 1, description: "hack" })
    ).rejects.toThrow();
  });
});
