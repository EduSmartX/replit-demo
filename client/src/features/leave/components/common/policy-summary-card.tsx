import { CheckCircle2, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type OrganizationRole } from "@/lib/api/leave-api";

interface PolicySummaryCardProps {
  mode: "create" | "view" | "edit";
  leaveTypeName: string;
  totalDays: string;
  carryForwardDays: string;
  effectiveFrom: string;
  effectiveTo?: string;
  selectedRoles: OrganizationRole[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PolicySummaryCard({
  mode,
  leaveTypeName,
  totalDays,
  carryForwardDays,
  effectiveFrom,
  effectiveTo,
  selectedRoles,
  isSubmitting,
  onSubmit,
  onCancel,
  onEdit,
}: PolicySummaryCardProps) {
  const isViewMode = mode === "view";

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-900">Leave Policy Summary</CardTitle>
        <CardDescription>Preview of your leave allocation configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Leave Type:</p>
          <p className="text-base font-semibold text-gray-900">{leaveTypeName || "Not selected"}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Total Days:</p>
          <p className="text-base font-semibold text-gray-900">{totalDays || "0"}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Carry Forward:</p>
          <p className="text-base font-semibold text-gray-900">{carryForwardDays || "0"} days</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Effective Period:</p>
          <p className="text-base font-semibold text-gray-900">
            {effectiveFrom}
            {effectiveTo && <> to {effectiveTo}</>}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">Applicable Roles:</p>
          {selectedRoles.length > 0 ? (
            <div className="space-y-1">
              {selectedRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {role.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No roles selected</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t pt-4">
          {isViewMode && onEdit && (
            <Button onClick={onEdit} className="bg-indigo-600 hover:bg-indigo-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit Policy
            </Button>
          )}
          {!isViewMode && (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Update Policy" : "Generate Policy"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {isViewMode ? "Back to List" : "Cancel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
