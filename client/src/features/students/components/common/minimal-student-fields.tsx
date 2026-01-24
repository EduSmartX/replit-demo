import { memo } from "react";
import { type Control } from "react-hook-form";
import {
  GenderField,
  SelectField,
  SupervisorField,
  TextInputField,
} from "@/common/components/forms";
import { Card, CardContent } from "@/components/ui/card";
import type { StudentFormValues } from "../../schemas/student-form-schema";

interface MinimalStudentFieldsProps {
  control: Control<StudentFormValues>;
  classes: any[];
  loadingClasses: boolean;
  isCreateMode: boolean;
  isViewMode?: boolean;
  showAsCard?: boolean;
  initialData?: any;
  showClassNote?: boolean;
}

export const MinimalStudentFields = memo<MinimalStudentFieldsProps>(({ 
  control, 
  classes, 
  loadingClasses,
  isCreateMode,
  isViewMode = false,
  showAsCard = true,
  initialData,
  showClassNote = true
}) => {
  const content = (
    <div className="space-y-6">
      {/* Class Selection - Always first and required */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900">Class Assignment</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              control={control}
              name="class_id"
              label="Class"
              placeholder="Select class"
              disabled={isViewMode || loadingClasses || !isCreateMode}
              required
              options={Array.isArray(classes) ? classes.map((cls: any) => ({
                value: cls.public_id,
                label: `${cls.class_master?.name || ""} - ${cls.name}`,
              })) : []}
            />

            <SupervisorField
              control={control}
              name="supervisor_email"
              disabled={isViewMode}              
            />
          </div>

          {showClassNote && !isCreateMode && initialData?.class_assigned && (
            <div className="rounded-md bg-gray-100 p-3">
              <p className="text-sm text-gray-700">
                <strong>Current Class:</strong> {initialData.class_assigned.class_master?.name || ""}{" "}
                - {initialData.class_assigned.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInputField
            control={control}
            name="roll_number"
            label="Roll Number"
            placeholder="001"
            required
            disabled={isViewMode}
          />
          <TextInputField
            control={control}
            name="first_name"
            label="First Name"
            placeholder="John"
            required
            disabled={isViewMode}
          />
          <TextInputField
            control={control}
            name="last_name"
            label="Last Name"
            placeholder="Doe"
            required
            disabled={isViewMode}
          />
          <GenderField 
            control={control} 
            name="gender" 
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  if (showAsCard) {
    return (
      <Card>
        <CardContent className="pt-6">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
});

MinimalStudentFields.displayName = "MinimalStudentFields";
