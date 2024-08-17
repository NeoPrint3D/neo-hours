import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import fs from "node:fs";

const dbName = fs
  .readdirSync(".data/d1/miniflare-D1DatabaseObject")
  .find((file) => file.endsWith(".sqlite"));

console.log(dbName);

if (!dbName) {
  throw new Error("No database found in .data/d1");
}

const betterSqlite = new Database(
  `.data/d1/miniflare-D1DatabaseObject/${dbName}`
);

const db = drizzle(betterSqlite);
migrate(db, { migrationsFolder: "migrations" });
try {
  const ftsFile = fs.readFileSync("./src/schema/fts.sql", "utf-8");
  betterSqlite.exec(ftsFile);
} catch (e) {
  console.log("FTS already exists");
}
betterSqlite.close();
