import type { Config } from "drizzle-kit";
import { config } from "dotenv";

console.log(process.env.NODE_ENV);

config({
  path:
    process.env.NODE_ENV === "prod"
      ? ".env.prod"
      : process.env.NODE_ENV === "stage"
        ? ".env.stage"
        : ".env.dev",
});

export default {
  dialect: "sqlite",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  driver: "d1-http",
  verbose: true,
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config;
