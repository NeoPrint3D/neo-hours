import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as drizzleImports from "drizzle-orm";

import * as dbTables from "./schema";

export const tables = dbTables;

export const tableNames = Object.keys(dbTables) as (keyof typeof dbTables)[];
export const drizzleImportNames = Object.keys(
  drizzleImports
) as (keyof typeof drizzleImports)[];

export const createDrizzleD1 = (db: D1Database) => drizzleD1(db);

export * from "./schema";
export * from "./utils";
export * from "./types";
export * from "drizzle-orm";
