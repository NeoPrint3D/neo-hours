export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "admin",
    }),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;
    const validatedQuery = await getValidatedQuery(event, (query) =>
      z
        .object({
          limit: z.number().optional(),
          offset: z.number().optional(),
          status: z
            .enum(["pending", "active", "inactive", "rejected"])
            .optional(),
        })
        .parse(query)
    );
    const db = useDrizzle();

    const memberCols = getTableColumns(organizationMembersTable);

    if (validatedQuery.status) {
      const members = await db
        .select({
          ...memberCols,
          email: usersTable.email,
        })
        .from(organizationMembersTable)
        .leftJoin(
          usersTable,
          eq(usersTable.id, organizationMembersTable.userId)
        )
        .where(
          and(
            eq(organizationMembersTable.organizationId, organization.id),
            eq(organizationMembersTable.status, validatedQuery.status)
          )
        );

      return members;
    }

    const members = await db
      .select({
        ...memberCols,
        email: usersTable.email,
      })
      .from(organizationMembersTable)
      .leftJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
      .where(eq(organizationMembersTable.organizationId, organization.id));

    return members;
  },
});
