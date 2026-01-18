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
 * - /auth - Authentication (login/signup)
 * - /dashboard - Role-based dashboard home
 * - /teachers - Teacher management
 * - /allocations - Leave allocation policies
 * - /organization - Holiday calendar
 * - /preferences - Organization settings
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "@/features/auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/core/contexts";
import AuthPage from "@/pages/auth-page";
import {
  AllocationsPage,
  OrganizationPage,
  OverviewPage,
  PreferencesPage,
  TeachersPage,
  ClassesPage,
  StudentsPage
} from "@/modules/admin/pages";
import NotFound from "@/pages/not-found";
import OrganizationPendingPage from "@/pages/organization-pending";
import RegistrationSuccess from "@/pages/registration-success";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/auth" />} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/registration-success" component={RegistrationSuccess} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <OverviewPage />
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
      <Route path="/students">
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/students/:id">
        <ProtectedRoute>
          <StudentsPage />
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
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
