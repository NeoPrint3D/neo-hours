export default defineEventHandler({
  handler: async (event) => {
    const validatedQuery = await getValidatedQuery(event, (query) =>
      z
        .object({
          id: z.string(),
        })
        .parse(query)
    );
    if (!import.meta.dev) {
      throw createCustomError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "This route is not available in production",
        data: {
          details: "This route is not available in production",
        },
      });
    }
    const lucia = useLucia();

    const session = await lucia.createSession(validatedQuery.id, {});

    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    return sendRedirect(event, "/");
  },
});
