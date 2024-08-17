export const memberLinks = (organizationId: string) => ({
  topLinks: [
    {
      name: "Home",
      path: `/orgs/${organizationId}/home`,
      icon: "lucide:home",
    },
    {
      name: "Me",
      path: `/orgs/${organizationId}/me`,
      icon: "lucide:user",
    },
    {
      name: "Activities",
      path: `/orgs/${organizationId}/activities`,
      icon: "lucide:ticket",
    },
  ],
  bottomLinks: [
    {
      name: "Home",
      path: `/`,
      icon: "lucide:external-link",
    },
    {
      name: "Logout",
      action: logout,
      icon: "lucide:log-out",
    },
  ],
});

export const adminLinks = (organizationId: string) => ({
  topLinks: [
    ...memberLinks(organizationId).topLinks,
    {
      name: "Attendance",
      path: `/orgs/${organizationId}/attendance`,
      icon: "lucide:hand",
    },
    {
      name: "Members",
      path: `/orgs/${organizationId}/members`,
      icon: "lucide:users",
    },
  ],
  bottomLinks: [...memberLinks(organizationId).bottomLinks],
});

export const ownerLinks = (organizationId: string) => ({
  topLinks: [
    ...adminLinks(organizationId).topLinks,
    {
      name: "Periods",
      path: `/orgs/${organizationId}/periods`,
      icon: "lucide:calendar",
    },
  ].filter((link) => !["Me"].includes(link.name)),
  bottomLinks: [
    {
      name: "Org. Settings",
      path: `/orgs/${organizationId}/settings`,
      icon: "lucide:building",
    },
    ...adminLinks(organizationId).bottomLinks,
  ],
});

export const sidebarLinks = (
  currentRole: AppPermissions | undefined,
  organizationId: string
) =>
  hasRequiredPermission(currentRole, "owner")
    ? ownerLinks(organizationId)
    : hasRequiredPermission(currentRole, "admin")
      ? adminLinks(organizationId)
      : memberLinks(organizationId);
