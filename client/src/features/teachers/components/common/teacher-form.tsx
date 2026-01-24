/**
 * Teacher Form Component (Common - Reusable)
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LoadingSpinner } from "@/common/components";
import { SuccessMessage } from "@/common/components/dialogs";
import { useOrganizationRoles } from "@/common/components/forms";
import { AddressManagementForm } from "@/common/components/forms/address-management-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { getOrganizationRoleCode } from "@/features/teachers/helpers/teacher-form-helpers";
import { useTeacherFormLogic } from "@/features/teachers/hooks/use-teacher-form-logic";
import { apiRequest, type ApiResponse } from "@/lib/api";
import type { Teacher } from "@/lib/api/teacher-api";
import { ORGANIZATION_ROLE_CODES } from "@/lib/constants/organization-roles";
import type { FormMode } from "@/lib/utils/form-utils";
import { getFormConfig } from "@/lib/utils/form-utils";
import { MultiTeacherFormSection } from "./multi-teacher-form-section";
import { SingleTeacherFormSection } from "./single-teacher-form-section";
import { TeacherFormActions } from "./teacher-form-actions";
import { TeacherFormHeader } from "./teacher-form-header";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [minimalFields, setMinimalFields] = useState(false);

  const formConfig = getFormConfig(mode, "Teacher");

  // Fetch organization roles to map name to code
  const { data: orgRoles = [], isLoading: isLoadingRoles } = useOrganizationRoles();

  // Preload supervisors for edit/view modes - use different key to avoid conflicts
  const { isLoading: isLoadingSupervisors } = useQuery({
    queryKey: ["organization-users-preload"],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<any[]>>(
        `${API_BASE_URL}/api/users/supervisors/`,
        { method: "GET" }
      );
      if ("success" in response && "data" in response) {
        return response.data || [];
      }
      return [];
    },
    enabled: mode === "edit" || mode === "view",
    staleTime: Infinity, // Cache forever since it's just preloading
  });

  // Map organization_role name to code
  const organizationRoleCode = useMemo(() => {
    const roleName = initialData?.user?.organization_role || initialData?.organization_role;
    if (!roleName) {
      return ORGANIZATION_ROLE_CODES.TEACHER;
    }
    return getOrganizationRoleCode(roleName, orgRoles);
  }, [initialData?.user?.organization_role, initialData?.organization_role, orgRoles]);

  // Show loading state while organization roles are loading for edit/view modes
  // For edit/view modes, we need ALL data loaded before rendering the form
  const isDataLoading = (mode === "edit" || mode === "view") && (
    isLoadingRoles || 
    isLoadingSupervisors ||
    !organizationRoleCode ||
    (initialData && !initialData.user)
  );

  // ALWAYS call the hook (React rules)
  const {
    form,
    fields,
    showSuccess,
    isLoading,
    addressFormRef,
    expandedSections,
    isViewMode,
    isEditMode,
    isCreateMode,
    onSubmit,
    toggleSection,
    handleRemove,
    handleAdd,
  } = useTeacherFormLogic({
    mode,
    initialData,
    organizationRoleCode,
    minimalFields,
    onSuccess,
  });

  // Return loading early AFTER calling hooks
  if (isDataLoading) {
    return <LoadingSpinner message="Loading form data..." />;
  }

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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <TeacherFormHeader
        title={formConfig.title}
        description={formConfig.description}
        isViewMode={isViewMode}
        isCreateMode={isCreateMode}
        minimalFields={minimalFields}
        onBack={onCancel!}
        onEdit={onEdit}
        onMinimalFieldsChange={setMinimalFields}
      />

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
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {isCreateMode && minimalFields && fields.length > 0 ? (
                <MultiTeacherFormSection
                  control={form.control}
                  fields={fields}
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                  onRemove={handleRemove}
                  onAdd={handleAdd}
                />
              ) : (
                <SingleTeacherFormSection
                  control={form.control}
                  isViewMode={isViewMode}
                  isEditMode={isEditMode}
                  isCreateMode={isCreateMode}
                  minimalFields={minimalFields}
                />
              )}

              {/* Action buttons for create mode - submit immediately */}
              {!isViewMode && isCreateMode && (
                <TeacherFormActions
                  isViewMode={isViewMode}
                  isEditMode={isEditMode}
                  isLoading={isLoading}
                  minimalFields={minimalFields}
                  teacherCount={fields.length}
                  onCancel={onCancel!}
                  onEdit={onEdit}
                  onSubmit={() => {}} // Not needed, form handles submission
                />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Address Management Section - Show in Edit and View modes */}
      {(isEditMode || isViewMode) && initialData && initialData.user && (
        <div className="mt-6">
          <AddressManagementForm
            ref={addressFormRef}
            userPublicId={initialData.user.public_id}
            resourceName={initialData.full_name}
            currentAddress={initialData.user.address || null}
            mode={isViewMode ? "view" : "edit"}
            onEditMode={onEdit}
            hideActions={isEditMode}
          />
        </div>
      )}

      {/* Update button at the bottom - for edit mode only */}
      {isEditMode && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TeacherFormActions
              isViewMode={isViewMode}
              isEditMode={isEditMode}
              isLoading={isLoading}
              minimalFields={minimalFields}
              teacherCount={fields.length}
              onCancel={onCancel!}
              onEdit={onEdit}
              onSubmit={() => {}} // Not needed, form handles submission
            />
          </form>
        </Form>
      )}

      {/* View mode actions - outside form since it's just navigation */}
      {isViewMode && (
        <TeacherFormActions
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          isLoading={isLoading}
          minimalFields={minimalFields}
          teacherCount={fields.length}
          onCancel={onCancel!}
          onEdit={onEdit}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
}

