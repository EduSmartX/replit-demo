import { memo } from "react";
import { type Control } from "react-hook-form";
import {
  AddressInputFields,
  BloodGroupField,
  DateInputField,
  GenderField,
  OrganizationRoleField,
  SupervisorField,
  TextInputField,
} from "@/common/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherFormValues } from "../schemas/teacher-form-schema";

interface FullTeacherFieldsProps {
  isViewMode: boolean;
  control: Control<TeacherFormValues>;
  onAddressSelect?: (address: any) => void;
}

export const FullTeacherFields = memo<FullTeacherFieldsProps>(
  ({ isViewMode, control, onAddressSelect }) => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInputField
              control={control}
              name="employee_id"
              label="Employee ID"
              placeholder={isViewMode ? undefined : "EMP001"}
              disabled={isViewMode}
              required
            />
            <TextInputField
              control={control}
              name="email"
              label="Email"
              type="email"
              placeholder={isViewMode ? undefined : "teacher@example.com"}
              disabled={isViewMode}
              required
            />
            <TextInputField
              control={control}
              name="first_name"
              label="First Name"
              placeholder={isViewMode ? undefined : "John"}
              disabled={isViewMode}
              required
            />
            <TextInputField
              control={control}
              name="last_name"
              label="Last Name"
              placeholder={isViewMode ? undefined : "Doe"}
              disabled={isViewMode}
              required
            />
            <TextInputField
              control={control}
              name="phone"
              label="Phone"
              placeholder={isViewMode ? undefined : "1234567890"}
              disabled={isViewMode}
            />
            <GenderField control={control} name="gender" disabled={isViewMode} required />
            <BloodGroupField control={control} name="blood_group" disabled={isViewMode} />
            <DateInputField
              control={control}
              name="date_of_birth"
              label="Date of Birth"
              max={new Date()}
              disabled={isViewMode}
            />
            <DateInputField
              control={control}
              name="joining_date"
              label="Joining Date"
              disabled={isViewMode}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OrganizationRoleField control={control} name="organization_role" disabled={isViewMode} />
            <SupervisorField control={control} name="supervisor_email" disabled={isViewMode} />
            <TextInputField
              control={control}
              name="designation"
              label="Designation"
              placeholder={isViewMode ? undefined : "Senior Teacher"}
              disabled={isViewMode}
            />
            <TextInputField
              control={control}
              name="highest_qualification"
              label="Highest Qualification"
              placeholder={isViewMode ? undefined : "M.Ed"}
              disabled={isViewMode}
            />
            <TextInputField
              control={control}
              name="specialization"
              label="Specialization"
              placeholder={isViewMode ? undefined : "Mathematics"}
              disabled={isViewMode}
            />
            <TextInputField
              control={control}
              name="experience_years"
              label="Years of Experience"
              type="number"
              placeholder={isViewMode ? undefined : "5"}
              disabled={isViewMode}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInputField
              control={control}
              name="emergency_contact_name"
              label="Contact Name"
              placeholder={isViewMode ? undefined : "Jane Doe"}
              disabled={isViewMode}
              description={isViewMode ? "Emergency contact person for this teacher" : undefined}
            />
            <TextInputField
              control={control}
              name="emergency_contact_number"
              label="Contact Number"
              placeholder={isViewMode ? undefined : "1234567890"}
              disabled={isViewMode}
              description={isViewMode ? "Contact number for emergency situations" : undefined}
            />
          </CardContent>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressInputFields
                control={control}
                streetAddressName="street_address"
                addressLine2Name="address_line_2"
                cityName="city"
                stateName="state"
                zipCodeName="postal_code"
                countryName="country"
                onAddressSelect={onAddressSelect}
                disabled={isViewMode}
                showLocationButton={!isViewMode}
                gridCols="2"
              />
            </CardContent>
          </Card>
        </Card>
      </div>
    );
  }
);

FullTeacherFields.displayName = "FullTeacherFields";
