/**
 * Organization Preferences Component
 * Main preferences management interface that fetches and displays all preference categories.
 * Handles preference updates and cache invalidation with optimistic UI updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { PreferenceCategoryCard } from "./preference-category-card";
import { WorkingDayPolicyForm } from "./working-day-policy-form";
import { fetchGroupedPreferences, updatePreference } from "@/lib/api/preferences-api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { parseApiError, getShortErrorMessage } from "@/lib/error-utils";

export function OrganizationPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const promises = updates.map((update) =>
        updatePreference(update.public_id, update.value)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-preferences"] });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = getShortErrorMessage(error);
      toast({
        title: "Failed to update preferences",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSave = async (updates: { public_id: string; value: string | string[] }[]) => {
    await updateMutation.mutateAsync(updates);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  if (isError) {
    const parsedError = parseApiError(error);
    
    return (
      <div className="max-w-2xl mx-auto mt-8 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">{parsedError.title}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-base">{parsedError.message}</p>
            {parsedError.details && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                  {parsedError.details}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!preferencesData?.data || preferencesData.data.length === 0) {
    return (
      <div className="text-center py-20">
        <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Preferences Found</h3>
        <p className="text-gray-500">
          There are no organization preferences configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Organization Preferences
            </h1>
            <p className="text-gray-600 mt-1">
              Configure your organization's settings and preferences
            </p>
          </div>
        </div>
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
    </div>
  );
}
