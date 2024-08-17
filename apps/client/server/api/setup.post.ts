export default defineEventHandler({
  handler: async () => {
    if (!import.meta.dev) {
      throw createCustomError({
        statusCode: 500,
        statusMessage: "Not in a development environment",
        message: "Not in a development environment",
        data: { details: "Not in a development environment" },
      });
    }
    try {
      const db = useDrizzle();

      await db.select().from(usersTable);
      console.log("setup.get.ts");
    } catch {
      console.log("setup.get.ts error");
    }
  },
});
