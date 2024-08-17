export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "verified",
    }),
  ],
  handler: async (event) => {
    const db = useDrizzle();
    const user = event.context.user!;
    const memberOfOrganizations = await db
      .select()
      .from(organizationMembersTable)
      .leftJoin(
        organizationsTable,
        eq(organizationMembersTable.organizationId, organizationsTable.id)
      )
      .where(eq(organizationMembersTable.userId, user.id));

    const publicOrganizations = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.isPublic, true));

    return {
      memberOfOrganizations,
      publicOrganizations,
    };
  },
});
