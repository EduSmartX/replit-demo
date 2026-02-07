/**
 * Main Application Component
 *
 * Root component that sets up the application architecture:
 * - Query client for data fetching and caching
 * - User authentication and authorization context
 * - Global UI providers (toasts, tooltips)
 * - Application routing
 *
 * Route Structure:
 * - / - Home/Landing page
 * - /auth - Authentication (login/signup)
 * - /dashboard - Role-based dashboard home
 * - /teachers - Teacher management
 * - /allocations - Leave allocation policies
 * - /organization - Holiday calendar
 * - /preferences - Organization settings
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/features/auth";
import { ProfileSettingsPage } from "@/features/profile/pages/profile-settings-page";
import {
  AllocationsPage,
  ClassesPage,
  ExceptionalWorkPage,
  LeaveRequestFormPage,
  LeaveRequestReviewsPage,
  LeaveRequestsPage,
  ManageLeaveBalancesPage,
  OrganizationPage,
  OverviewPage,
  PreferencesPage,
  StudentsPage,
  SubjectsPage,
  TeachersPage,
} from "@/modules/admin/pages";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import OrganizationPendingPage from "@/pages/organization-pending";
import RegistrationSuccess from "@/pages/registration-success";
import { queryClient } from "./lib/queryClient";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/registration-success" component={RegistrationSuccess} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <OverviewPage />
        </ProtectedRoute>
      </Route>
      <Route path="/settings/profile">
        <ProtectedRoute>
          <ProfileSettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/allocations">
        <ProtectedRoute>
          <AllocationsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/allocations/:id">
        <ProtectedRoute>
          <AllocationsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/organization">
        <ProtectedRoute>
          <OrganizationPage />
        </ProtectedRoute>
      </Route>
      <Route path="/preferences">
        <ProtectedRoute>
          <PreferencesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/exceptional-work">
        <ProtectedRoute>
          <ExceptionalWorkPage />
        </ProtectedRoute>
      </Route>
      <Route path="/exceptional-work/new">
        <ProtectedRoute>
          <ExceptionalWorkPage />
        </ProtectedRoute>
      </Route>
      <Route path="/exceptional-work/:id">
        <ProtectedRoute>
          <ExceptionalWorkPage />
        </ProtectedRoute>
      </Route>
      <Route path="/exceptional-work/:id/edit">
        <ProtectedRoute>
          <ExceptionalWorkPage />
        </ProtectedRoute>
      </Route>
      <Route path="/teachers">
        <ProtectedRoute>
          <TeachersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/teachers/:id">
        <ProtectedRoute>
          <TeachersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/classes">
        <ProtectedRoute>
          <ClassesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/classes/:id">
        <ProtectedRoute>
          <ClassesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/subjects">
        <ProtectedRoute>
          <SubjectsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/subjects/:id">
        <ProtectedRoute>
          <SubjectsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/students">
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/classes/:classId/students/:id">
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/students/:id">
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/leave-request-reviews">
        <ProtectedRoute>
          <LeaveRequestReviewsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/manage-leave-balances">
        <ProtectedRoute>
          <ManageLeaveBalancesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/leave-requests">
        <ProtectedRoute>
          <LeaveRequestsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/leave-requests/new">
        <ProtectedRoute>
          <LeaveRequestFormPage />
        </ProtectedRoute>
      </Route>
      <Route path="/leave-requests/:id">
        <ProtectedRoute>
          <LeaveRequestFormPage />
        </ProtectedRoute>
      </Route>
      <Route path="/leave-requests/:id/edit">
        <ProtectedRoute>
          <LeaveRequestFormPage />
        </ProtectedRoute>
      </Route>
      <Route path="/organization-pending">
        <ProtectedRoute>
          <OrganizationPendingPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
