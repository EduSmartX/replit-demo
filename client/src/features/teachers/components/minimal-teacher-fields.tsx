import { memo } from "react";
import { type Control } from "react-hook-form";
import { GenderField, OrganizationRoleField, TextInputField } from "@/common/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORGANIZATION_ROLE_CODES } from "@/lib/constants";
import type { TeacherFormValues } from "../schemas/teacher-form-schema";

interface MinimalTeacherFieldsProps {
  control: Control<TeacherFormValues>;
}

export const MinimalTeacherFields = memo<MinimalTeacherFieldsProps>(({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information (Required Fields Only)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInputField
          control={control}
          name="employee_id"
          label="Employee ID"
          placeholder="EMP001"
          required
        />
        <TextInputField
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="teacher@example.com"
          required
        />
        <TextInputField
          control={control}
          name="first_name"
          label="First Name"
          placeholder="John"
          required
        />
        <TextInputField
          control={control}
          name="last_name"
          label="Last Name"
          placeholder="Doe"
          required
        />
        <GenderField control={control} name="gender" required />
        <OrganizationRoleField
          control={control}
          name="organization_role"
          defaultRoleCode={ORGANIZATION_ROLE_CODES.TEACHER}
          required
        />
      </CardContent>
    </Card>
  );
});

MinimalTeacherFields.displayName = "MinimalTeacherFields";
