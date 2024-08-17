export default defineEventHandler({
  onRequest: [middlewareAuth({ role: "owner" })],
  handler: async (event) => {
    const organization = event.context.organization!;
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .object({
          name: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          hourRequirement: z.number(),
        })
        .parse(body)
    );

    const db = useDrizzle();

    const periodPayload: typeof organizationPeriodsTable.$inferInsert = {
      name: validatedBody.name,
      startDate: validatedBody.startDate,
      endDate: validatedBody.endDate,
      hourRequirement: validatedBody.hourRequirement,
      organizationId: organization.id,
    };

    const res = await db
      .insert(organizationPeriodsTable)
      .values(periodPayload)
      .returning({
        id: organizationPeriodsTable.id,
      });

    return {
      message: "Successfully created new organization period",
    };
  },
});
