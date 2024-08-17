import type { User } from "lucia";

export type AppPermissions = "verified" | "member" | "admin" | "owner";

export function isUserVerified(user?: User): boolean {
  return Boolean(user && user.verifiedAt);
}

export function isOrganizationPermission(
  permissionType: AppPermissions
): boolean {
  return ["member", "admin", "owner"].includes(permissionType);
}

export function hasRequiredPermission(
  currentMembershipRole: AppPermissions | undefined,
  requiredPermission: AppPermissions
): boolean {
  switch (currentMembershipRole) {
    case "member":
      return requiredPermission === "member";
    case "admin":
      return ["member", "admin"].includes(requiredPermission);
    case "owner":
      return ["member", "admin", "owner"].includes(requiredPermission);
    default:
      return false;
  }
}
