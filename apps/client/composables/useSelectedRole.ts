export const useSelectedRole = () =>
  useState<Exclude<AppPermissions, "verified"> | undefined>(
    "selectedRole",
    () => useMembership().value?.role
  );
