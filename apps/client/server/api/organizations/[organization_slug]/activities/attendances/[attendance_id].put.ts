export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "organization_activities_attendances.put",
      limit: 100,
      duration: 60,
    }),
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const membership = event.context.membership!;
    if (hasRequiredPermission(membership.role, "admin")) {
      const validatedParams = await getValidatedRouterParams(event, (params) =>
        z
          .object({
            attendance_id: z.string(),
          })
          .parse(params)
      );
      const validatedBody = await readValidatedBody(event, (body) =>
        z
          .object({
            action: z.enum(["approve", "reject"]),
          })
          .parse(body)
      );

      const db = useDrizzle();

      switch (validatedBody.action) {
        case "approve": {
          await db
            .update(activityAttendancesTable)
            .set({
              status: "approved",
            })
            .where(
              eq(activityAttendancesTable.id, validatedParams.attendance_id)
            );

          console;
          return {
            message: "Attendance approved successfully",
          };
        }
        case "reject": {
          await db
            .update(activityAttendancesTable)
            .set({
              status: "rejected",
            })
            .where(
              eq(activityAttendancesTable.id, validatedParams.attendance_id)
            );
          return {
            message: "Attendance rejected successfully",
          };
        }
      }

      return {
        message: "Attendance updated successfully",
      };
    } else {
      const db = useDrizzle();

      const validatedBody = await readValidatedBody(event, (body) =>
        z
          .object({
            action: z.literal("edit"),
            data: z.object({
              hours: z.number().min(0.5).max(24),
            }),
          })
          .parse(body)
      );

      const validatedParams = await getValidatedRouterParams(event, (params) =>
        z
          .object({
            attendance_id: z.string(),
          })
          .parse(params)
      );

      const attendance = (
        await db
          .select()
          .from(activityAttendancesTable)
          .where(eq(activityAttendancesTable.id, validatedParams.attendance_id))
          .limit(1)
      )[0];

      if (attendance.status === "rejected") {
        await db
          .update(activityAttendancesTable)
          .set({
            hours: validatedBody.data.hours,
          })
          .where(
            eq(activityAttendancesTable.id, validatedParams.attendance_id)
          );

        return {
          message: "Attendance resubmitted successfully",
        };
      } else {
        throw createError({
          status: 400,
          statusMessage: "Invalid action",
          message: "Attendance can only be resubmitted if it has been rejected",
        });
      }
    }
  },
});
