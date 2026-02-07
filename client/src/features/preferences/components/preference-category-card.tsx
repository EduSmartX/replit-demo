/**
 * Preference Category Card Component
 * Displays a group of related preferences within a collapsible card.
 * Tracks changes and provides save/cancel actions for the preference group.
 */

import { Save, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GroupedPreference, Preference } from "@/lib/api/preferences-api";
import { PreferenceField } from "./preference-field";

interface PreferenceCategoryCardProps {
  groupedPreference: GroupedPreference;
  onSave: (updates: { public_id: string; value: string | string[] }[]) => Promise<void>;
  isSaving?: boolean;
}

export function PreferenceCategoryCard({
  groupedPreference,
  onSave,
  isSaving = false,
}: PreferenceCategoryCardProps) {
  const [preferences, setPreferences] = useState<Preference[]>(groupedPreference.preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const handleChange = (index: number, value: string | string[], hasError: boolean = false) => {
    const updated = [...preferences];
    updated[index] = { ...updated[index], value };
    setPreferences(updated);
    setHasChanges(true);
    setSavedSuccess(false);
    setHasValidationErrors(hasError);
  };

  const handleSave = async () => {
    const updates = preferences
      .filter((pref, index) => {
        const original = groupedPreference.preferences[index];
        return JSON.stringify(pref.value) !== JSON.stringify(original.value);
      })
      .map((pref) => ({
        public_id: pref.public_id,
        value: pref.value,
      }));

    if (updates.length > 0) {
      try {
        await onSave(updates);
        setHasChanges(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } catch (error) {
        setSavedSuccess(false);
      }
    }
  };

  const handleReset = () => {
    setPreferences(groupedPreference.preferences);
    setHasChanges(false);
    setSavedSuccess(false);
  };

  const getCategoryTitle = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      attendance: "📊",
      authentication: "🔐",
      email: "📧",
      student_management: "👨‍🎓",
      general: "⚙️",
    };
    return icons[category] || "⚙️";
  };

  return (
    <Card className="shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50 py-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(groupedPreference.category)}</span>
            <div>
              <CardTitle className="text-lg">
                {getCategoryTitle(groupedPreference.category)}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {groupedPreference.count} setting{groupedPreference.count !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          {preferences.map((preference, index) => (
            <div key={preference.public_id} className="border-b pb-3 last:border-b-0 last:pb-0">
              <PreferenceField
                preference={preference}
                value={preference.value}
                onChange={(value, hasError) => handleChange(index, value, hasError)}
                disabled={isSaving}
              />
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || hasValidationErrors}
              className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              title={hasValidationErrors ? "Please fix validation errors before saving" : ""}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
