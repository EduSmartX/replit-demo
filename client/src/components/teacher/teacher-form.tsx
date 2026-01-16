import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, Edit } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AddressManagementForm,
  type AddressManagementFormRef,
} from "@/components/common/address-management-form";
import {
  TextInputField,
  BloodGroupField,
  GenderField,
  MultiSelectField,
  SelectField,
} from "@/components/common/form-fields";
import { SuccessMessage } from "@/components/common/success-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  createTeacher,
  updateTeacher,
  fetchSubjects,
  fetchOrganizationRoles,
  fetchOrganizationUsers,
  type TeacherCreatePayload,
  type TeacherUpdatePayload,
  type Teacher,
} from "@/lib/api/teacher-api";
import { parseApiError } from "@/lib/error-parser";
import { getFormConfig } from "@/lib/utils/form-utils";
import type { FormMode } from "@/lib/utils/form-utils";

const teacherFormSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  highest_qualification: z.string().optional(),
  joining_date: z.string().optional(),
  specialization: z.string().optional(),
  designation: z.string().optional(),
  experience_years: z.string().optional(),
  subjects: z.array(z.number()).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_number: z.string().optional(),
  blood_group: z.string().optional(),
  gender: z.string().optional(),
  organization_role: z.string().optional(),
  supervisor_email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

interface TeacherFormProps {
  mode?: FormMode;
  initialData?: Teacher | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function TeacherForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  onEdit,
}: TeacherFormProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  const addressFormRef = useRef<AddressManagementFormRef>(null);

  const formConfig = getFormConfig(mode, "Teacher");
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Fetch subjects
  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });

  // Fetch organization roles
  const { data: orgRolesData, isLoading: loadingOrgRoles } = useQuery({
    queryKey: ["organization-roles"],
    queryFn: fetchOrganizationRoles,
  });

  // Fetch organization users (for supervisor)
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["organization-users"],
    queryFn: fetchOrganizationUsers,
  });

  const subjects = Array.isArray(subjectsData) ? subjectsData : [];
  const orgRoles = useMemo(() => (Array.isArray(orgRolesData) ? orgRolesData : []), [orgRolesData]);
  const users = Array.isArray(usersData) ? usersData : [];

  // Map organization_role name to code using useMemo to avoid recalculating on every render
  const organizationRoleCode = useMemo(() => {
    if (!initialData?.user?.organization_role || orgRoles.length === 0) {
      return "";
    }
    const matchingRole = orgRoles.find((role) => role.name === initialData.user?.organization_role);
    return matchingRole?.code || "";
  }, [initialData?.user?.organization_role, orgRoles]);

  // Initialize form
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      employee_id: "",
      email: "",
      phone: "",
      first_name: "",
      last_name: "",
      highest_qualification: "",
      joining_date: "",
      specialization: "",
      designation: "",
      experience_years: "",
      subjects: [],
      emergency_contact_name: "",
      emergency_contact_number: "",
      blood_group: "",
      gender: "",
      organization_role: "",
      supervisor_email: "",
    },
  });

  // Update form when initialData changes - only if form hasn't been modified
  useEffect(() => {
    if (initialData && initialData.user) {
      // Only reset form if user hasn't made changes (not dirty)
      if (!form.formState.isDirty) {
        const formValues = {
          employee_id: initialData.employee_id || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          first_name: initialData.user?.first_name || "",
          last_name: initialData.user?.last_name || "",
          highest_qualification: initialData.highest_qualification || "",
          joining_date: initialData.joining_date || "",
          specialization: initialData.specialization || "",
          designation: initialData.designation || "",
          experience_years: initialData.experience_years?.toString() || "",
          subjects: initialData.subjects?.map((s) => parseInt(s.public_id)) || [],
          emergency_contact_name: initialData.emergency_contact_name || "",
          emergency_contact_number: initialData.emergency_contact_number || "",
          blood_group: initialData.user?.blood_group || "",
          gender: initialData.user?.gender || "",
          organization_role: organizationRoleCode,
          supervisor_email:
            (initialData.user as { supervisor?: { email?: string } })?.supervisor?.email || "",
        };

        form.reset(formValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, organizationRoleCode, orgRoles]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TeacherCreatePayload) => createTeacher(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
        exact: false,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<TeacherUpdatePayload>) => {
      if (!initialData?.public_id) {
        throw new Error("Teacher ID is required for update");
      }
      return updateTeacher(initialData.public_id, data);
    },
    onSuccess: async (updatedTeacher) => {
      // Reset form with updated data to clear dirty state
      if (updatedTeacher) {
        const teacher = updatedTeacher;
        form.reset(
          {
            employee_id: teacher.employee_id || "",
            email: teacher.email || "",
            phone: teacher.phone || "",
            first_name: teacher.user?.first_name || "",
            last_name: teacher.user?.last_name || "",
            highest_qualification: teacher.highest_qualification || "",
            joining_date: teacher.joining_date || "",
            specialization: teacher.specialization || "",
            designation: teacher.designation || "",
            experience_years: teacher.experience_years?.toString() || "",
            subjects:
              teacher.subjects?.map((s: { public_id: string }) => parseInt(s.public_id)) || [],
            emergency_contact_name: teacher.emergency_contact_name || "",
            emergency_contact_number: teacher.emergency_contact_number || "",
            blood_group: teacher.user?.blood_group || "",
            gender: teacher.user?.gender || "",
            organization_role: teacher.user?.organization_role || "",
            supervisor_email:
              (teacher.user as { supervisor?: { email?: string } })?.supervisor?.email || "",
          },
          { keepDirty: false }
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
        exact: false,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    const payload: TeacherCreatePayload = {
      employee_id: values.employee_id,
      email: values.email,
      phone: values.phone || "",
      first_name: values.first_name,
      last_name: values.last_name,
      highest_qualification: values.highest_qualification || "",
      joining_date: values.joining_date || undefined,
      specialization: values.specialization || "",
      designation: values.designation || "",
      experience_years: values.experience_years ? parseInt(values.experience_years) : undefined,
      subjects: values.subjects || [],
      emergency_contact_name: values.emergency_contact_name || "",
      emergency_contact_number: values.emergency_contact_number || "",
      blood_group: values.blood_group || "",
      gender: values.gender || "",
      organization_role: values.organization_role || "",
      supervisor_email: values.supervisor_email || "",
    };

    if (isEditMode) {
      // Don't send email in edit mode (email is immutable)
      const { email: _email, ...updatePayload } = payload;

      try {
        // Submit teacher update
        await updateMutation.mutateAsync(updatePayload);

        // Also submit address if address form exists
        if (addressFormRef.current && initialData) {
          try {
            await addressFormRef.current.submitAddress();
          } catch (addressError) {
            console.error("Address update failed:", addressError);
            // Don't fail the whole operation if address update fails
            toast({
              title: "Warning",
              description:
                "Teacher updated but address update failed. Please try updating the address separately.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        // Error already handled by mutation onError
      }
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Success message
  if (showSuccess) {
    return (
      <SuccessMessage
        title={formConfig.successMessage}
        description={
          isEditMode
            ? "The teacher information has been updated successfully."
            : "A new teacher has been added to your organization successfully."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
            {formConfig.title}
          </h1>
          <p className="mt-2 text-gray-600">{formConfig.description}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-purple-900">Teacher Information</CardTitle>
          <CardDescription className="text-purple-700">
            {isViewMode
              ? "Teacher details are displayed below"
              : isEditMode
                ? "Update the fields you want to change"
                : "All fields marked with * are required"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="employee_id"
                    label="Employee ID"
                    placeholder="EMP001"
                    required
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="teacher@example.com"
                    required
                    disabled={isViewMode || isEditMode}
                    description={isEditMode ? "Email cannot be changed in edit mode" : undefined}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="first_name"
                    label="First Name"
                    placeholder="John"
                    required
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="last_name"
                    label="Last Name"
                    placeholder="Doe"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />

                  <GenderField control={form.control} name="gender" disabled={isViewMode} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <BloodGroupField
                    control={form.control}
                    name="blood_group"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="joining_date"
                    label="Joining Date"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="designation"
                    label="Designation"
                    placeholder="Senior Teacher"
                    disabled={isViewMode}
                    description="Current position or job title"
                  />

                  <TextInputField
                    control={form.control}
                    name="highest_qualification"
                    label="Highest Qualification"
                    placeholder="M.Ed., B.Ed."
                    disabled={isViewMode}
                    description="Highest degree or certification earned"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="experience_years"
                    label="Experience (Years)"
                    type="number"
                    placeholder="5"
                    disabled={isViewMode}
                    description="Total years of teaching experience"
                  />

                  <TextInputField
                    control={form.control}
                    name="specialization"
                    label="Specialization"
                    placeholder="Mathematics, Science, etc."
                    disabled={isViewMode}
                    description="Area of expertise or specialization"
                  />
                </div>

                {!isCreateMode && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      control={form.control}
                      name="organization_role"
                      label="Organization Role"
                      placeholder="Select organization role"
                      disabled={isViewMode || loadingOrgRoles}
                      description="Select the role for this teacher"
                      options={orgRoles.map((role) => ({
                        value: role.code,
                        label: role.name,
                      }))}
                    />
                    <SelectField
                      control={form.control}
                      name="supervisor_email"
                      label="Supervisor"
                      placeholder="Select supervisor"
                      disabled={isViewMode || loadingUsers}
                      description="Select a supervisor from existing users"
                      options={users.map((user) => ({
                        value: user.email,
                        label: `${user.full_name} (${user.email})`,
                      }))}
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {isCreateMode && (
                    <SelectField
                      control={form.control}
                      name="organization_role"
                      label="Organization Role"
                      placeholder="Select organization role"
                      disabled={isViewMode || loadingOrgRoles}
                      description="Leave empty to use default (Teacher)"
                      options={orgRoles.map((role) => ({
                        value: role.code,
                        label: role.name,
                      }))}
                    />
                  )}

                  {isCreateMode && (
                    <SelectField
                      control={form.control}
                      name="supervisor_email"
                      label="Supervisor"
                      placeholder="Select supervisor"
                      disabled={isViewMode || loadingUsers}
                      description="Optional - Select a supervisor from existing users"
                      options={users.map((user) => ({
                        value: user.email,
                        label: `${user.full_name} (${user.email})`,
                      }))}
                    />
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <MultiSelectField
                    control={form.control}
                    name="subjects"
                    label="Subjects"
                    description="Select the subjects this teacher can teach"
                    disabled={isViewMode}
                    options={subjects}
                    loading={loadingSubjects}
                    placeholder="Select subjects..."
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="emergency_contact_name"
                    label="Emergency Contact Name"
                    placeholder="Jane Doe"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="emergency_contact_number"
                    label="Emergency Contact Number"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Back to List button removed from here - moved to bottom */}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Address Management Section - Show in Edit and View modes */}
      {(isEditMode || isViewMode) && initialData && (
        <div className="mt-6">
          <AddressManagementForm
            ref={addressFormRef}
            userPublicId={initialData.user?.public_id || initialData.public_id}
            resourceName={initialData.full_name}
            currentAddress={initialData.user?.address || initialData.addresses?.[0] || null}
            mode={mode}
            onEditMode={onEdit}
            hideActions={isEditMode}
          />
        </div>
      )}

      {/* Action buttons at the bottom of the page */}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isViewMode ? "Back to List" : "Cancel"}
        </Button>
        {isViewMode ? (
          <Button
            onClick={onEdit}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
        ) : (
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Teacher" : "Create Teacher"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
