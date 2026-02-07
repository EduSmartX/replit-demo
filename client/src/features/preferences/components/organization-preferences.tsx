/**
 * Organization Preferences Component
 * Main preferences management interface that fetches and displays all preference categories.
 * Handles preference updates and cache invalidation with optimistic UI updates.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import { SuccessDialog } from "@/common/components/dialogs/success-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchGroupedPreferences, updatePreference } from "@/lib/api/preferences-api";
import { getShortErrorMessage, parseApiError } from "@/lib/error-utils";
import { PreferenceCategoryCard } from "./preference-category-card";
import { WorkingDayPolicyForm } from "./working-day-policy-form";

export function OrganizationPreferences() {
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  // Fetch preferences
  const {
    data: preferencesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organization-preferences"],
    queryFn: fetchGroupedPreferences,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { public_id: string; value: string | string[] }[]) => {
      const promises = updates.map((update) => updatePreference(update.public_id, update.value));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-preferences"] });
      setSuccessMessage({
        title: "Preferences Updated!",
        description: "Organization preferences have been updated successfully.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: unknown) => {
      const errorMessage = getShortErrorMessage(error);
      console.error("Failed to update preferences:", errorMessage);
    },
  });

  const handleSave = async (updates: { public_id: string; value: string | string[] }[]) => {
    await updateMutation.mutateAsync(updates);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  if (isError) {
    const parsedError = parseApiError(error);

    return (
      <div className="mx-auto mt-8 max-w-2xl space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">{parsedError.title}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-base">{parsedError.message}</p>
            {parsedError.details && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">Technical Details</summary>
                <pre className="mt-2 overflow-auto rounded bg-red-50 p-2 text-xs">
                  {parsedError.details}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!preferencesData?.data || preferencesData.data.length === 0) {
    return (
      <div className="py-20 text-center">
        <Settings className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-xl font-semibold text-gray-700">No Preferences Found</h3>
        <p className="text-gray-500">There are no organization preferences configured yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Organization Preferences</h1>
        <p className="text-base text-gray-600">
          Configure your organization&apos;s settings and preferences
        </p>
      </div>

      {/* Working Day Policy - At the Top */}
      <WorkingDayPolicyForm />

      {/* Preference Cards */}
      <div className="grid gap-6">
        {preferencesData.data.map((groupedPreference) => (
          <PreferenceCategoryCard
            key={groupedPreference.category}
            groupedPreference={groupedPreference}
            onSave={handleSave}
            isSaving={updateMutation.isPending}
          />
        ))}
      </div>

      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={() => setShowSuccessDialog(false)}
      />
    </div>
  );
}
