// TODO: add pagination

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const validatedQuery = await getValidatedQuery(event, (query) =>
      z
        .object({
          status: z.enum(["pending", "approved", "rejected"]).optional(),
          // TODO: try to find a way to default to latest period
          organizationPeriodId: z.string(),
          mine: z
            .string()
            .refine((value) => value === "true")
            .optional(),
        })
        .parse(query)
    );
    const db = useDrizzle();
    const membership = event.context
      .membership as typeof organizationMembersTable.$inferSelect;
    const attendanceCols = getTableColumns(activityAttendancesTable);
    if (
      hasRequiredPermission(membership.role, "admin") &&
      !validatedQuery.mine
    ) {
      if (validatedQuery.status) {
        const attendances = await db
          .select({
            ...attendanceCols,
            member: {
              name: organizationMembersTable.displayName,
            },
            activity: {
              id: activitiesTable.id,
              name: activitiesTable.name,
            },
          })
          .from(activityAttendancesTable)
          .leftJoin(
            activitiesTable,
            eq(activitiesTable.id, activityAttendancesTable.activityId)
          )
          .leftJoin(
            organizationPeriodsTable,
            eq(
              organizationPeriodsTable.id,
              activitiesTable.organizationPeriodId
            )
          )
          .leftJoin(
            organizationMembersTable,
            eq(
              organizationMembersTable.id,
              activityAttendancesTable.organizationMemberId
            )
          )
          .where(
            and(
              eq(
                organizationPeriodsTable.id,
                validatedQuery.organizationPeriodId
              ),
              eq(activityAttendancesTable.status, validatedQuery.status)
            )
          )
          .orderBy(desc(activitiesTable.scheduledStartDatetime));

        if (membership.role === "admin") {
          return {
            attendances,
            total: attendances.length,
            totalHours: attendances.reduce((p, a) => p + a.hours, 0),
          };
        }

        return {
          attendances,
          total: attendances.length,
          totalHours: 0,
        };
      }

      const attendances = await db
        .select({
          ...attendanceCols,
          member: {
            name: organizationMembersTable.displayName,
          },
          activity: {
            id: activitiesTable.id,
            name: activitiesTable.name,
          },
        })
        .from(activityAttendancesTable)
        .leftJoin(
          activitiesTable,
          eq(activitiesTable.id, activityAttendancesTable.activityId)
        )
        .leftJoin(
          organizationPeriodsTable,
          eq(organizationPeriodsTable.id, activitiesTable.organizationPeriodId)
        )
        .leftJoin(
          organizationMembersTable,
          eq(
            organizationMembersTable.id,
            activityAttendancesTable.organizationMemberId
          )
        )
        .where(
          and(
            eq(organizationPeriodsTable.id, validatedQuery.organizationPeriodId)
          )
        )
        .orderBy(desc(activitiesTable.scheduledStartDatetime));

      return {
        attendances,
        total: attendances.length,
        totalHours: 0,
      };
    } else if (hasRequiredPermission(membership.role, "member")) {
      if (validatedQuery.status) {
        const attendances = await db
          .select({
            ...attendanceCols,
            member: {
              name: organizationMembersTable.displayName,
            },
            activity: {
              id: activitiesTable.id,
              name: activitiesTable.name,
            },
          })
          .from(activityAttendancesTable)
          .leftJoin(
            activitiesTable,
            eq(activitiesTable.id, activityAttendancesTable.activityId)
          )
          .leftJoin(
            organizationPeriodsTable,
            eq(
              organizationPeriodsTable.id,
              activitiesTable.organizationPeriodId
            )
          )
          .leftJoin(
            organizationMembersTable,
            eq(
              organizationMembersTable.id,
              activityAttendancesTable.organizationMemberId
            )
          )
          .where(
            and(
              eq(
                organizationPeriodsTable.id,
                validatedQuery.organizationPeriodId
              ),
              eq(activityAttendancesTable.organizationMemberId, membership.id),
              eq(activityAttendancesTable.status, validatedQuery.status)
            )
          )
          .orderBy(desc(activitiesTable.scheduledStartDatetime));

        return {
          attendances,
          total: attendances.length,
          totalHours: attendances.reduce((p, a) => p + a.hours, 0),
        };
      }

      const attendances = await db
        .select({
          ...attendanceCols,
          member: {
            name: organizationMembersTable.displayName,
          },
          activity: {
            id: activitiesTable.id,
            name: activitiesTable.name,
          },
        })
        .from(activityAttendancesTable)
        .leftJoin(
          activitiesTable,
          eq(activitiesTable.id, activityAttendancesTable.activityId)
        )
        .leftJoin(
          organizationPeriodsTable,
          eq(organizationPeriodsTable.id, activitiesTable.organizationPeriodId)
        )
        .leftJoin(
          organizationMembersTable,
          eq(
            organizationMembersTable.id,
            activityAttendancesTable.organizationMemberId
          )
        )
        .where(
          and(
            eq(
              organizationPeriodsTable.id,
              validatedQuery.organizationPeriodId
            ),
            eq(activityAttendancesTable.organizationMemberId, membership.id)
          )
        )
        .orderBy(desc(activitiesTable.scheduledStartDatetime));

      return {
        attendances,
        total: attendances.length,
        totalHours: attendances.reduce((p, a) => p + a.hours, 0),
      };
    }
  },
});
