export default defineEventHandler({
  handler: async (event) => {
    if (!event.context.session) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Not logged in",
      });
    }

    const lucia = useLucia();
    await lucia.invalidateSession(event.context.session.id);

    appendHeader(
      event,
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize(),
    );

    await sendRedirect(event, "/login");
  },
});
