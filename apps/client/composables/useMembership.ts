export const useMembership = () =>
  useState<typeof organizationMembersTable.$inferSelect | null>(
    "useMembership",
    () => null
  );
