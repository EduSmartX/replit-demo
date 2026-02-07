/**
 * Teacher Form Helper Functions
 */

export function getOrganizationRoleCode(
  roleName: string | undefined,
  orgRoles: Array<{ code: string; name: string }>
): string {
  if (!roleName || orgRoles.length === 0) {
    return "";
  }

  const matchingRole = orgRoles.find((role) => role.name === roleName);
  return matchingRole?.code || "";
}
