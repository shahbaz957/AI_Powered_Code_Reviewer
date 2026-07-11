import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("⚠️  WARNING: DATABASE_URL is not set. Database operations will fail.");
} else {
  // Normalize postgres:// to postgresql:// (Prisma requires postgresql://)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
    process.env.DATABASE_URL = dbUrl.replace("postgres://", "postgresql://");
    console.log("✓ Normalized DATABASE_URL from postgres:// to postgresql://");
  }
  // Note: SSL mode should be set in DATABASE_URL environment variable if needed
  // We don't automatically add it to avoid forcing SSL when database doesn't support it
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" &&
      process.env.PRISMA_LOG_QUERIES === "1"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
