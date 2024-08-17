import { drizzle } from "drizzle-orm/d1";
import {
  organizationMembersTable,
  organizationsTable,
  usersTable,
} from "../schema";
import { tables } from "..";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      const db = drizzle(env.DB, {
        schema: tables,
      });

      const organizationPayload: typeof organizationsTable.$inferInsert = {
        id: "random-club",
        name: "The Random Club",
        description: "The Random Club",
        slug: "random-club",
        additionalInfo: {
          type: "school",
          details: {
            startDate: new Date("2024-08-15").toISOString(),
            endDate: new Date("2025-05-23").toISOString(),
            gradeCutOff: 12,
          },
        },
      };

      const insertedOrganization = await db
        .insert(organizationsTable)
        .values(organizationPayload)
        .returning({
          id: organizationsTable.id,
        });

      const randomUser = await db
        .insert(usersTable)
        .values({
          displayName: "Random Super Admin",
          verifiedAt: new Date().toISOString(),
          email: "admin@random.com"
        })
        .returning({
          id: usersTable.id,
        });

      const randomUserMember = await db
        .insert(organizationMembersTable)
        .values({
          organizationId: insertedOrganization[0].id,
          userId: randomUser[0].id,
          role: "owner",
          displayName: "Leo Club Super Admin",
          status: "active",
        })
        .returning({
          id: organizationMembersTable.id,
        });

      return Response.json({
        res: {
          insertedOrganization,
          randomUser,
          randomUserMember,
        },
      });
    } catch (e) {
      console.error(e);
      return Response.json({
        message: "Database already seeded",
      });
    }
  },
} satisfies ExportedHandler<Env>;