import Database from "better-sqlite3";
import fs from "node:fs";
import { faker } from "@faker-js/faker";

import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  activitiesTable,
} from "../schema";
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

async function seedInitial() {
  const insertedOrganization = await db
    .insert(organizationsTable)
    .values({
      id: "random-club",
      name: "Random Club",
      description: "The Random Club",
      slug: "random-club",
      additionalInfo: {
        type: "school",
        details: {
          gradeCutOff: 12,
          startDate: new Date("2024-08-10").toISOString(),
          endDate: new Date("2025-05-23").toISOString(),
        },
      },
    })
    .returning({
      id: organizationsTable.id,
    });

  const johnUser = await db
    .insert(usersTable)
    .values({
      displayName: "John Doe",
      verifiedAt: new Date().toISOString(),
      email: "john@doe.com",
    })
    .returning({
      id: usersTable.id,
    });

  const randomAdminUser = await db
    .insert(usersTable)
    .values({
      displayName: "Random Super Admin",
      verifiedAt: new Date().toISOString(),
      email: "admin@random.com",
    })
    .returning({
      id: usersTable.id,
    });

  const randomMember = await db
    .insert(organizationMembersTable)
    .values({
      organizationId: insertedOrganization[0].id,
      userId: randomAdminUser[0].id,
      role: "owner",
      displayName: "Random Super Admin",
      status: "active",
    })
    .returning({
      id: organizationMembersTable.id,
    });

  const johnMember = await db
    .insert(organizationMembersTable)
    .values({
      organizationId: insertedOrganization[0].id,
      userId: johnUser[0].id,
      role: "owner",
      displayName: "John Doe",
      status: "active",
    })
    .returning({
      id: organizationMembersTable.id,
    });

  console.log({
    insertedOrganization,
    randomAdminUser,
     randomMember,
     johnUser,
     johnMember,
  });
}

async function seedActivites() {
  for (let i = 0; i < 100; i++) {
    const payload: typeof activitiesTable.$inferInsert = {
      name: faker.lorem.words(),
      organizationId: "random-club", 
      description: faker.lorem.paragraph(),
      scheduledStartDatetime: faker.date
        .future({
          refDate: new Date(),
        })
        .toISOString(),
      hours: faker.number.int({
        min: 1,
        max: 10,
      }),
      location: faker.location.streetAddress(),
      organizationPeriodId: "ORG_PERIOD_ID", // Input org period id to seed random activities
      contactVerificationInfo: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    await db.insert(activitiesTable).values(payload).returning({
      id: organizationsTable.id,
    });
  }
}

seedInitial().catch(() => console.log("Database already seeded"));

// seedActivites().catch(() => console.log("Database already seeded"));
