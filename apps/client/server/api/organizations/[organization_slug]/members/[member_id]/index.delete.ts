import { removedEmailTemplate } from "~/lib/constants/emailTemplates";

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
          member_id: z.string(),
        })
        .parse(params)
    );

    const membership = event.context
      .membership as typeof organizationMembersTable.$inferSelect;
    const db = useDrizzle();

    const targetedMembership = (
      await db
        .select({
          id: organizationMembersTable.id,
          email: usersTable.email,
          userId: organizationMembersTable.userId,
          displayName: organizationMembersTable.displayName,
          role: organizationMembersTable.role,
          organizationId: organizationMembersTable.organizationId,
        })
        .from(organizationMembersTable)
        .leftJoin(
          usersTable,
          eq(usersTable.id, organizationMembersTable.userId)
        )
        .where(eq(organizationMembersTable.id, validatedParams.member_id))
    )[0];

    if (!targetedMembership) {
      throw createCustomError({
        statusCode: 404,
        statusMessage: "Membership not found",
        message: "Membership not found",
        data: {
          details: "Membership not found",
        },
      });
    }

    if (
      hasRequiredPermission(membership.role, targetedMembership.role) &&
      membership.id !== targetedMembership.id
    ) {
      await db
        .delete(organizationMembersTable)
        .where(eq(organizationMembersTable.id, validatedParams.member_id));

      await sendEmail({
        to: targetedMembership.email!,
        subject: "You have been removed",
        html: removedEmailTemplate({
          organization,
          email: targetedMembership.email!,
        }),
      });

      return {
        message: `Successfully removed ${targetedMembership.displayName}`,
      };
    } else {
      throw createCustomError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "You do not have permission to perform this action",
        data: {
          details: "You do not have permission to perform this action",
        },
      });
    }
  },
});
