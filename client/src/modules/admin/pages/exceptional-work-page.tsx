/**
 * Exceptional Work Policy Page
 * 
 * Administrative interface for managing calendar exceptions.
 * Allows creating exceptions for holidays or working days for specific classes.
 * 
 * @route /exceptional-work
 */

import { useLocation, useParams } from "wouter";
import { PageWrapper } from "@/common/components";
import { DashboardLayout } from "@/common/layouts";
import { CalendarExceptionForm, CalendarExceptionManagement } from "@/features/attendance";

export default function ExceptionalWorkPage() {
  const [location] = useLocation();
  const params = useParams();
  
  // Determine the view mode
  const isCreating = location.endsWith("/exceptional-work/new");
  const isEditing = params.id && location.includes("/edit");
  const isViewing = params.id && !isEditing && !isCreating;
  
  return (
    <DashboardLayout>
      <PageWrapper>
        {isCreating && <CalendarExceptionForm mode="create" />}
        {isEditing && params.id && <CalendarExceptionForm publicId={params.id} mode="edit" />}
        {isViewing && params.id && <CalendarExceptionForm publicId={params.id} mode="view" />}
        {!isCreating && !isEditing && !isViewing && <CalendarExceptionManagement />}
      </PageWrapper>
    </DashboardLayout>
  );
}
