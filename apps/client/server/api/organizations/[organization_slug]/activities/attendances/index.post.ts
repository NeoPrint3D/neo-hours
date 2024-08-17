export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .object({
          activityId: z.string(),
          hours: z.number(),
        })
        .parse(body)
    );

    const db = useDrizzle();

    // prevent duplicate attendance

    const member = event.context
      .membership as typeof organizationMembersTable.$inferSelect;
    const attendance = (
      await db
        .select()
        .from(activityAttendancesTable)
        .where(
          and(
            eq(activityAttendancesTable.activityId, validatedBody.activityId),
            eq(activityAttendancesTable.organizationMemberId, member.id)
          )
        )
    ).at(0);

    if (attendance) {
      throw createCustomError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Attendance already submitted",
        data: {
          details: "Attendance already submitted",
        },
      });
    }

    await db.insert(activityAttendancesTable).values({
      organizationMemberId: member.id,
      activityId: validatedBody.activityId,
      hours: validatedBody.hours,
    });

    return {
      message: "Attendance submitted successfully",
    };
  },
});
