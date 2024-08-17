import { Context, Hono } from "hono";
import dayjs from "dayjs";
import {
  createDrizzleD1,
  eq,
  organizationMembersTable,
  organizationsTable,
  sql,
} from "@neo-hours/db";
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

type AnyObject = Record<string, any>;

function removeDuplicates<T extends AnyObject, K extends keyof T>(
  rows: T[],
  uniqueFields: { [P in K]: (item: T[P]) => string }
): { [P in K]: T[P][] } {
  const uniqueMaps: { [P in K]: Map<string, T[P]> } = Object.keys(
    uniqueFields
  ).reduce(
    (acc, key) => {
      acc[key as K] = new Map();
      return acc;
    },
    {} as { [P in K]: Map<string, T[P]> }
  );

  for (const row of rows) {
    for (const [field, getUniqueKey] of Object.entries(uniqueFields) as [
      K,
      (item: T[K]) => string,
    ][]) {
      if (row[field]) {
        const key = getUniqueKey(row[field]);
        if (!uniqueMaps[field].has(key)) {
          uniqueMaps[field].set(key, row[field]);
        }
      }
    }
  }

  return Object.keys(uniqueFields).reduce(
    (acc, key) => {
      acc[key as K] = Array.from(uniqueMaps[key as K].values());
      return acc;
    },
    {} as { [P in K]: T[P][] }
  );
}
function calculateAge(birthDate: Date, currentDate: Date): number {
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = currentDate.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

app.get("/", async (c) => {
  return c.json({ message: "Cron Health" });
});
async function updateSchoolGrades(env: Bindings) {
  const db = createDrizzleD1(env.DB);

  const rows = await db
    .select({
      members: organizationMembersTable,
      organizations: organizationsTable,
    })
    .from(organizationsTable)
    .leftJoin(
      organizationMembersTable,
      eq(organizationMembersTable.organizationId, organizationsTable.id)
    )
    .where(
      eq(
        sql`JSON_EXTRACT(${organizationsTable.additionalInfo}, '$.type')`,
        "school"
      )
    );

  const { members, organizations } = removeDuplicates(rows, {
    members: (m) => m!.id,
    organizations: (o) => o!.id,
  });

  console.log("Organizations", organizations);

  for (const organization of organizations) {
    if (organization?.additionalInfo.type === "school") {
      const endDate = dayjs(
        new Date(organization.additionalInfo.details.endDate)
      ).format("YYYY-MM-DD");
      const currentDate = dayjs(new Date()).format("YYYY-MM-DD");
      console.log(
        new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        ).toISOString()
      );
      console.log("End Date", endDate, "Current Date", currentDate);

      // Check if it's the end of the school year
      if (currentDate === endDate) {
        console.log("Running end of school year procedure");

        await db.update(organizationsTable).set({
          additionalInfo: {
            ...organization.additionalInfo,
            details: {
              ...organization.additionalInfo.details,
              startDate: dayjs(new Date()).add(1, "year").toISOString(),
              endDate: dayjs(new Date()).add(1, "year").toISOString(),
            },
          },
        });
        const organizationMembers = members.filter(
          (m) => m!.organizationId === organization.id
        );

        for (const member of organizationMembers) {
          if (
            member?.additionalInfo &&
            member.additionalInfo.type === "school"
          ) {
            const currentGrade = member.additionalInfo.details.grade;
            const newGrade = currentGrade + 1;

            // Update the grade for each student
            await db
              .update(organizationMembersTable)
              .set({
                additionalInfo: {
                  ...member.additionalInfo,
                  details: {
                    ...member.additionalInfo.details,
                    grade: newGrade,
                  },
                },
              })
              .where(eq(organizationMembersTable.id, member.id));

            // Check if the student's new grade exceeds the gradeCutOff
            if (newGrade > organization.additionalInfo.details.gradeCutOff) {
              await db
                .update(organizationMembersTable)
                .set({
                  status: "inactive",
                })
                .where(eq(organizationMembersTable.id, member.id));
            }
          }
        }
      }
    }
  }

  console.log("School grades updated successfully");
}
async function updateRotatingMembersAge(env: Bindings) {
  const db = createDrizzleD1(env.DB);

  const rows = await db
    .select({
      members: organizationMembersTable,
      organizations: organizationsTable,
    })
    .from(organizationsTable)
    .leftJoin(
      organizationMembersTable,
      eq(organizationMembersTable.organizationId, organizationsTable.id)
    )
    .where(
      eq(
        sql`JSON_EXTRACT(${organizationsTable.additionalInfo}, '$.type')`,
        "rotating"
      )
    );

  const { members, organizations } = removeDuplicates(rows, {
    members: (m) => m!.id,
    organizations: (o) => o!.id,
  });

  for (const organization of organizations) {
    if (organization?.additionalInfo.type === "rotating") {
      const { ageCutOff } = organization.additionalInfo.details;

      const organizationMembers = members.filter(
        (m) => m!.organizationId === organization.id
      );

      for (const member of organizationMembers) {
        if (
          member?.additionalInfo &&
          member.additionalInfo.type === "rotating"
        ) {
          const endDate = dayjs(
            new Date(member.additionalInfo.details.birthday)
          ).format("YYYY-MM-DD");
          const currentDate = dayjs(new Date()).format("YYYY-MM-DD");
          // Update the age for each member
          if (currentDate === endDate) {
            const newAge = member.additionalInfo.details.age + 1;
            await db
              .update(organizationMembersTable)
              .set({
                additionalInfo: {
                  ...member.additionalInfo,
                  details: {
                    ...member.additionalInfo.details,
                    age: newAge,
                  },
                },
              })
              .where(eq(organizationMembersTable.id, member.id));
            if (newAge > ageCutOff) {
              await db
                .update(organizationMembersTable)
                .set({
                  status: "inactive",
                })
                .where(eq(organizationMembersTable.id, member.id));
            }
          }
        }
      }
    }
  }

  console.log("Rotating members age updated successfully");
}

export default {
  fetch: app.fetch,
  scheduled: async (event, env, c) => {
    await updateSchoolGrades(env);
    await updateRotatingMembersAge(env);
  },
} satisfies ExportedHandler<Bindings>;
