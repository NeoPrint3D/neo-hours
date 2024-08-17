// For the frontend middleware
export default defineEventHandler({
  onRequest: [
    injectOrganizationData(),
    middlewareAuth({
      role: "verified",
    }),
  ],
  handler: async (event) => {
    const user = event.context.user!;
    const organization = event.context.organization!;

    const db = useDrizzle();

    const membershipData = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, organization.id),
          eq(organizationMembersTable.userId, user.id)
        )
      )
      .limit(1);

    if (!membershipData.length) {
      throw createCustomError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Not a member of this organization",
        data: {
          redirectText: "Join this organization",
          redirectTo: `/orgs/${organization.slug}/join`,
          details:
            "Must be a member of this organization to access this resource",
        },
      });
    }
    event.context.membership = membershipData[0];
    return membershipData[0];
  },
});
