import { activityUpdateReminderEmailTemplate } from "~/lib/constants/emailTemplates";

const baseSchema = z.object({
  action: z.enum(["publish", "unpublish", "edit"]),
});

const publishSchema = baseSchema.extend({
  action: z.literal("publish"),
});

const unpublishSchema = baseSchema.extend({
  action: z.literal("unpublish"),
});

const editSchema = baseSchema.extend({
  action: z.literal("edit"),
  data: z.object({
    name: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(255, "Maximum 255 characters"),
    hours: z.number().min(0.5, "Minimum 0.5 hours").max(24, "Maximum 24 hours"),
    description: z.string().optional(),
    scheduledStartDatetime: z.string(),
    scheduledEndDatetime: z.string().optional(),
    location: z.string().optional(),
    organizationPeriodId: z.string().min(1, "Organization period is required"),
    contactVerificationInfo: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }),
    isPublished: z.boolean(),
    sendReminder: z.boolean(),
  }),
});

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "admin",
    }),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;
    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
          activity_id: z.string(),
        })
        .parse(params)
    );

    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .discriminatedUnion("action", [
          publishSchema,
          unpublishSchema,
          editSchema,
        ])
        .parse(body)
    );
    const db = useDrizzle();

    switch (validatedBody.action) {
      case "publish": {
        await db
          .update(activitiesTable)
          .set({
            isPublished: true,
          })
          .where(eq(activitiesTable.id, validatedParams.activity_id));

        return {
          message: "Successfully published activity",
        };
      }
      case "unpublish": {
        await db
          .update(activitiesTable)
          .set({
            isPublished: false,
          })
          .where(eq(activitiesTable.id, validatedParams.activity_id));

        return {
          message: "Successfully unpublished activity",
        };
      }
      case "edit": {
        const rawDb = hubDatabase();

        const oldActivity = (
          await db
            .select()
            .from(activitiesTable)
            .where(eq(activitiesTable.id, validatedParams.activity_id))
        )[0];

        await db
          .update(activitiesTable)
          .set({
            name: validatedBody.data.name,
            hours: validatedBody.data.hours,
            description: validatedBody.data.description,
            scheduledStartDatetime: validatedBody.data.scheduledStartDatetime,
            scheduledEndDatetime: validatedBody.data.scheduledEndDatetime,
            location: validatedBody.data.location,
            organizationPeriodId: validatedBody.data.organizationPeriodId,
          })
          .where(eq(activitiesTable.id, validatedParams.activity_id));

        // update the json

        const stmt = /* sql */ `
          UPDATE activities
          SET contact_verification_info = JSON_REPLACE(
            contact_verification_info,
          ${Object.entries(validatedBody.data.contactVerificationInfo)
            .map(([key]) => `'$.${key}', ?`)
            .join(", ")}
          )
          WHERE id = '${validatedParams.activity_id}'
        `;

        console.log(stmt);

        await rawDb
          .prepare(stmt)
          .bind(...Object.values(validatedBody.data.contactVerificationInfo))
          .run();

        if (validatedBody.data.sendReminder) {
          const organizationMembers = await db
            .select({
              id: organizationMembersTable.id,
              email: usersTable.email,
              userId: organizationMembersTable.userId,
              displayName: organizationMembersTable.displayName,
              role: organizationMembersTable.role,
            })
            .from(organizationMembersTable)
            .leftJoin(
              usersTable,
              eq(usersTable.id, organizationMembersTable.userId)
            )
            .where(
              eq(
                organizationMembersTable.organizationId,
                validatedParams.organization_slug
              )
            );

          const newActivity = (
            await db
              .select()
              .from(activitiesTable)
              .where(eq(activitiesTable.id, validatedParams.activity_id))
          )[0];

          const promiseArray = organizationMembers.map((member) => {
            return sendEmail({
              to: member.email!,
              subject: `Updated Activity Reminder: ${newActivity.name} | ${organization.name}`,
              html: activityUpdateReminderEmailTemplate({
                email: member.email!,
                organization,
                newActivity,
                oldActivity,
              }),
            });
          });
          await Promise.all(promiseArray);
        }

        return {
          message: "Successfully edited activity",
        };
      }
    }
  },
});
