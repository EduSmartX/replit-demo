/**
 * Organization Preferences Page
 * 
 * Administrative interface for configuring organization-wide settings.
 * Manages preferences across categories like attendance, leave policies, and system settings.
 * 
 * @route /preferences
 */

import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { OrganizationPreferences } from "@/features/preferences";

export default function PreferencesPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <OrganizationPreferences />
      </PageWrapper>
    </DashboardLayout>
  );
}
