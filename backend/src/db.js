import prismaClientPkg from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const { PrismaClient } = prismaClientPkg;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./data/loklang.db",
});

export const prisma = new PrismaClient({ adapter });