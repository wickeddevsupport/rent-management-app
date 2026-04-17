import { PrismaClient } from "@prisma/client";

declare global {
  var __rentPrisma: PrismaClient | undefined;
}

export const db = global.__rentPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__rentPrisma = db;
