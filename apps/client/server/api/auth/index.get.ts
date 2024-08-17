// For the frontend middleware it is injeced by the server auth middleware
export default defineEventHandler(async (event) => {
  return {
    user: event.context.user,
    session: event.context.session,
  };
});
