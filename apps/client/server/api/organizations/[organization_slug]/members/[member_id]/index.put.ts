import {
  acceptedEmailTemplate,
  rejectedEmailTemplate,
} from "~/lib/constants/emailTemplates";

const baseSchema = z.object({
  action: z.enum(["edit", "deactivate", "reactivate", "approve", "reject"]),
});

const editSchema = baseSchema.extend({
  action: z.literal("edit"),
  data: z.object({
    displayName: z.string().optional(),
    role: z.enum(["admin", "member", "owner"]).optional(),
    email: z.string().email(),
    status: z.enum(["active", "pending", "rejected", "inactive"]).optional(),
  }),
});

const deactivateSchema = baseSchema.extend({
  action: z.literal("deactivate"),
  data: z.object({
    email: z.string().email(),
  }),
});

const reactivateSchema = baseSchema.extend({
  action: z.literal("reactivate"),
  data: z.object({
    email: z.string().email(),
  }),
});

const approveSchema = baseSchema.extend({
  action: z.literal("approve"),
  data: z.object({
    email: z.string().email(),
  }),
});

const rejectSchema = baseSchema.extend({
  action: z.literal("reject"),
  data: z.object({
    email: z.string().email(),
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
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .discriminatedUnion("action", [
          editSchema,
          deactivateSchema,
          reactivateSchema,
          approveSchema,
          rejectSchema,
        ])
        .parse(body)
    );

    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          member_id: z.string(),
        })
        .parse(params)
    );

    console.log("validatedParams", validatedParams);

    const db = useDrizzle();

    switch (validatedBody.action) {
      case "edit": {
        console.log(validatedBody.data);
        await db
          .update(organizationMembersTable)
          .set({
            ...validatedBody.data,
          })
          .where(eq(organizationMembersTable.id, validatedParams.member_id));

        return {
          message: "Successfully edited member",
        };
      }
      case "approve": {
        await db
          .update(organizationMembersTable)
          .set({
            status: "active",
          })
          .where(eq(organizationMembersTable.id, validatedParams.member_id));

        await sendEmail({
          to: validatedBody.data.email,
          subject: "You've been approved!",
          html: acceptedEmailTemplate({
            organization,
            email: validatedBody.data.email,
          }),
        });
        return {
          message: "Successfully approved member",
        };
      }
      case "reject": {
        await db
          .delete(organizationMembersTable)
          .where(eq(organizationMembersTable.id, validatedParams.member_id));

        await sendEmail({
          to: validatedBody.data.email,
          subject: "You've been rejected",
          html: rejectedEmailTemplate({
            organization,
            email: validatedBody.data.email,
          }),
        });

        return {
          message: "Successfully rejected member",
        };
      }
      case "deactivate": {
        await db
          .update(organizationMembersTable)
          .set({
            status: "inactive",
          })
          .where(eq(organizationMembersTable.id, validatedParams.member_id));

        await sendEmail({
          to: validatedBody.data.email,
          subject: "You've been deactivated",
          html: deactivatedEmailTemplate({
            organization,
            email: validatedBody.data.email,
          }),
        });
        return {
          message: "Successfully deactivated member",
        };
      }
      case "reactivate": {
        await db
          .update(organizationMembersTable)
          .set({
            status: "active",
          })
          .where(eq(organizationMembersTable.id, validatedParams.member_id));

        await sendEmail({
          to: validatedBody.data.email,
          subject: "You've been reactivated",
          html: reactivatedEmailTemplate({
            organization,
            email: validatedBody.data.email,
          }),
        });
        return {
          message: "Successfully reactivated member",
        };
      }
    }
  },
});
