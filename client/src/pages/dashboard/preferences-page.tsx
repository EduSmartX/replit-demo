/**
 * Organization Preferences Page
 */

import { OrganizationPreferences } from "@/components/preferences/organization-preferences";
import { DashboardLayout } from "@/layouts/dashboard-layout";

export default function PreferencesPage() {
  return (
    <DashboardLayout>
      <OrganizationPreferences />
    </DashboardLayout>
  );
}
