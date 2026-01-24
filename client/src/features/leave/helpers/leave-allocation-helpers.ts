/**
 * Leave Allocation Form Helpers
 */

import type { LeaveAllocation, OrganizationRole } from "@/lib/api/leave-api";
import type { LeaveAllocationFormValues } from "../schemas/leave-allocation-schema";

export function parseLocalDate(dateString: string | null | undefined): Date | undefined {
  if (!dateString) {return undefined;}
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

export function parseRoleNames(rolesString?: string): string[] {
  if (!rolesString) {return [];}
  return rolesString
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

export function roleNamesToIds(roleNames: string[], availableRoles: OrganizationRole[]): number[] {
  return availableRoles
    .filter((role) => roleNames.includes(role.name))
    .map((role) => role.id);
}

export function getDefaultFormValues(): Partial<LeaveAllocationFormValues> {
  return {
    leave_type: 0,
    name: "",
    description: "",
    total_days: "",
    max_carry_forward_days: "0",
    roles: [],
    effective_from: new Date(),
  };
}

export function getFormValuesFromAllocation(
  allocation: LeaveAllocation,
  roles: OrganizationRole[]
): LeaveAllocationFormValues {
  const roleNames = parseRoleNames(allocation.roles);
  const roleIds = roleNamesToIds(roleNames, roles);

  return {
    leave_type: allocation.leave_type_id || 0,
    name: allocation.name || "",
    description: allocation.description || "",
    total_days: allocation.total_days.toString(),
    max_carry_forward_days: allocation.max_carry_forward_days.toString(),
    roles: roleIds,
    effective_from: parseLocalDate(allocation.effective_from) || new Date(),
    effective_to: parseLocalDate(allocation.effective_to),
  };
}

export function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0];
}
