/**
 * Organization Preferences Page
 * 
 * Administrative interface for configuring organization-wide settings.
 * Manages preferences across categories like attendance, leave policies, and system settings.
 * 
 * @route /preferences
 */

import { OrganizationPreferences } from "@/features/preferences";
import { DashboardLayout } from "@/common/layouts";

export default function PreferencesPage() {
  return (
    <DashboardLayout>
      <OrganizationPreferences />
    </DashboardLayout>
  );
}
