export const useOrganization = () =>
  useState<typeof organizationsTable.$inferSelect | null>(
    "useOrganization",
    () => null
  );
