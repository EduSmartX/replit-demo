import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { type OrganizationRole } from "@/lib/api/leave-api";
import { SYSTEM_NAME } from "@/lib/constants";
import type { Control, FieldValues } from "react-hook-form";

interface RolesCheckboxFieldProps {
  control: Control<FieldValues>;
  roles: OrganizationRole[];
}

export function RolesCheckboxField({ control, roles }: RolesCheckboxFieldProps) {
  return (
    <FormField
      control={control}
      name="roles"
      render={({ field, fieldState }) => (
        <FormItem className="space-y-3">
          <div className="mb-4">
            <FormLabel className="text-base">Applicable Roles *</FormLabel>
            <FormDescription>Select the roles that this leave policy applies to</FormDescription>
            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> These are {SYSTEM_NAME} system-defined
                roles. Select the roles applicable for your organization. These roles will be
                assigned to staff members and teachers when you add them to the system.
              </p>
            </div>
          </div>
          <FormControl>
            <div className="grid max-h-64 grid-cols-1 gap-3 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 md:grid-cols-2">
              {roles.map((role) => (
                <div key={role.id} className="flex flex-row items-start space-x-3">
                  <Checkbox
                    checked={field.value?.includes(role.id)}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange([...field.value, role.id])
                        : field.onChange(field.value?.filter((value: number) => value !== role.id));
                    }}
                  />
                  <label className="cursor-pointer text-sm font-normal">{role.name}</label>
                </div>
              ))}
            </div>
          </FormControl>
          {fieldState.error && (
            <p className="mt-2 text-base font-semibold text-red-500">{fieldState.error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}
