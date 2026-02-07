/**
 * Leave Request Form Page
 *
 * Page for creating, viewing, and editing leave requests
 *
 * @route /leave-requests/new - Create new leave request
 * @route /leave-requests/:id - View leave request
 * @route /leave-requests/:id/edit - Edit leave request
 */

import { useLocation, useParams } from "wouter";
import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { LeaveRequestForm } from "@/features/leave/components/common/leave-request-form";

export default function LeaveRequestFormPage() {
  const [location] = useLocation();
  const params = useParams();

  // Determine the view mode
  const isCreating = location.endsWith("/leave-requests/new");
  const isEditing = params.id && location.includes("/edit");
  const isViewing = params.id && !isEditing && !isCreating;

  return (
    <DashboardLayout>
      <PageWrapper>
        {isCreating && <LeaveRequestForm mode="create" />}
        {isEditing && params.id && <LeaveRequestForm publicId={params.id} mode="edit" />}
        {isViewing && params.id && <LeaveRequestForm publicId={params.id} mode="view" />}
      </PageWrapper>
    </DashboardLayout>
  );
}
