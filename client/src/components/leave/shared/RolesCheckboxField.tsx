import { Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SYSTEM_NAME } from "@/lib/constants";
import { type OrganizationRole } from "@/lib/api/leave-api";

interface RolesCheckboxFieldProps {
  control: Control<any>;
  roles: OrganizationRole[];
}

export function RolesCheckboxField({ control, roles }: RolesCheckboxFieldProps) {
  return (
    <FormField
      control={control}
      name="roles"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Applicable Roles *</FormLabel>
            <FormDescription>
              Select the roles that this leave policy applies to
            </FormDescription>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> These are {SYSTEM_NAME} system-defined roles. Select the roles applicable for your organization. These roles will be assigned to staff members and teachers when you add them to the system.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-lg p-4 max-h-64 overflow-y-auto">
            {roles.map((role) => (
              <FormField
                key={role.id}
                control={control}
                name="roles"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={role.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(role.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, role.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== role.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {role.name}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
