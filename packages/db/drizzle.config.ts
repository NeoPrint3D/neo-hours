import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  verbose: true,
} satisfies Config;
