export const useSelectedPeriod = () =>
  useState<typeof organizationPeriodsTable.$inferSelect | null>(
    "useSelectedPeriod",
    () => null
  );
