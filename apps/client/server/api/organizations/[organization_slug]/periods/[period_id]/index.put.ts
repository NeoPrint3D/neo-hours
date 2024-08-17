const baseSchema = z.object({
  action: z.enum(["edit"]),
});

const editSchema = baseSchema.extend({
  action: z.literal("edit"),
  data: z.object({
    name: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(255, "Maximum 255 characters"),
    startDate: z.string(),
    endDate: z.string(),
    hourRequirement: z.number().min(0.5, "Minimum 0.5 hours"),
  }),
});

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "owner",
    }),
  ],
  handler: async (event) => {
    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
          period_id: z.string(),
        })
        .parse(params)
    );

    const validatedBody = await readValidatedBody(event, (body) =>
      z.discriminatedUnion("action", [editSchema]).parse(body)
    );
    const db = useDrizzle();

    switch (validatedBody.action) {
      case "edit": {
        await db
          .update(organizationPeriodsTable)
          .set({
            ...validatedBody.data,
          })
          .where(eq(organizationPeriodsTable.id, validatedParams.period_id));
        return {
          message: "Successfully edited period",
        };
      }
    }
  },
});
