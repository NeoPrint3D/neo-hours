export const usePeriods = () =>
  useState<(typeof organizationPeriodsTable.$inferSelect)[] | null>(
    "usePeriods",
    () => null
  );
