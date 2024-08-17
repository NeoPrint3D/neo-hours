const activityQuerySchema = z.object({
  page: z.preprocess(Number, z.number()).optional().default(1),
  limit: z.preprocess(Number, z.number()).optional().default(10),
  isPublished: z
    .preprocess((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    }, z.boolean())
    .optional()
    .default(true),
  sortyBy: z
    .enum(["scheduledStartDatetime", "createdAt"])
    .optional()
    .default("scheduledStartDatetime"),

  organizationPeriodId: z.string().optional(),

  includeTotal: z.preprocess(Boolean, z.boolean()).optional().default(false),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// export default cachedEventHandler(
export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "activities.get",
      strategy: "user",
      limit: 60,
      duration: 60,
    }),
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const validatedQuery = await getValidatedQuery(
      event,
      activityQuerySchema.parse
    );
    const db = useDrizzle();

    // const rows = await db
    //   .select({
    //     activities: activitiesTable,
    //     attendance: activityAttendancesTable,
    //     organizationPeriod: organizationPeriodsTable,
    //   })
    //   .from(activitiesTable)
    //   .innerJoin(
    //     activityAttendancesTable,
    //     eq(activitiesTable.id, activityAttendancesTable.activityId)
    //   )
    //   .innerJoin(
    //     organizationPeriodsTable,
    //     eq(organizationPeriodsTable.id, activitiesTable.organizationPeriodId)
    //   )
    //   .where(
    //     and(
    //       eq(activitiesTable.organizationId, validatedParams.organization_slug),
    //       eq(organizationPeriodsTable.startYear, "2024")
    //     )
    //   )
    //   .orderBy(desc(activitiesTable.scheduledStartDatetime))
    //   .offset(query.page * ACTIVITY_LIMIT)
    //   .limit(ACTIVITY_LIMIT)

    if (!validatedQuery.organizationPeriodId) {
      return {
        total: 0,
        activities: [],
      };
    }

    if (validatedQuery.includeTotal) {
      const totalActivities = await db
        .select({
          count: count(),
        })
        .from(activitiesTable)
        .where(
          eq(
            activitiesTable.organizationPeriodId,
            validatedQuery.organizationPeriodId
          )
        );

      const activities = await db
        .select()
        .from(activitiesTable)
        .where(
          and(
            eq(
              activitiesTable.organizationPeriodId,
              validatedQuery.organizationPeriodId
            ),
            eq(
              activitiesTable.isPublished,
              validatedQuery.isPublished === false &&
                hasRequiredPermission(event.context.membership?.role, "admin")
                ? false
                : true
            )
          )
        )
        .orderBy(desc(activitiesTable.scheduledStartDatetime))
        .offset((validatedQuery.page - 1) * validatedQuery.limit)
        .limit(validatedQuery.limit);

      return {
        total: totalActivities[0].count,
        activities,
      };
    }

    const activities = await db
      .select()
      .from(activitiesTable)
      .where(
        and(
          eq(
            activitiesTable.organizationPeriodId,
            validatedQuery.organizationPeriodId
          ),
          eq(activitiesTable.isPublished, true),
          ne(activitiesTable.scheduledStartDatetime, "TBD")
        )
      )
      .orderBy(desc(activitiesTable.scheduledStartDatetime))
      .offset((validatedQuery.page - 1) * validatedQuery.limit)
      .limit(validatedQuery.limit);

    return {
      total: 0,
      activities,
    };
  },
});
//   {
//     maxAge: 0,
//     getKey: (event) => event.node.req.url as string,
//   }
// )
