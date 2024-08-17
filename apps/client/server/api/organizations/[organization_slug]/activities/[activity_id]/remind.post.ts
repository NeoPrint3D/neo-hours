import { activityReminderEmailTemplate } from "~/lib/constants/emailTemplates";

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "admin",
    }),
    middlewareRateLimit({
      namespace: "organization.send-emails",
      limit: 5,
      duration: 60,
    }),
  ],
  handler: async (event) => {
    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
          activity_id: z.string(),
        })
        .parse(params)
    );

    const db = useDrizzle();

    const activity = (
      await db
        .select()
        .from(activitiesTable)
        .where(eq(activitiesTable.id, validatedParams.activity_id))
    )[0];

    if (!activity) {
      throw createCustomError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Activity not found",
        data: {
          details: "Activity not found",
        },
      });
    }

    const organization = (
      await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, validatedParams.organization_slug))
    )[0];

    const organizationMembers = await db
      .select({
        id: organizationMembersTable.id,
        email: usersTable.email,
        userId: organizationMembersTable.userId,
        displayName: organizationMembersTable.displayName,
        role: organizationMembersTable.role,
      })
      .from(organizationMembersTable)
      .leftJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
      .where(eq(organizationMembersTable.organizationId, organization.id));

    const promiseArray = organizationMembers.map((member) => {
      return sendEmail({
        to: member.email!,
        subject: `Reminder: ${activity.name} | ${organization.name}`,
        html: activityReminderEmailTemplate({
          email: member.email!,
          organization,
          activity,
        }),
      });
    });

    await Promise.all(promiseArray);

    await db
      .update(activitiesTable)
      .set({
        lastReminderSentAt: new Date().toISOString(),
      })
      .where(eq(activitiesTable.id, validatedParams.activity_id));

    return {
      message: "Successfully sent reminders",
    };
  },
});
