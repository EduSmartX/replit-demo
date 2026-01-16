import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/user-context";
import AuthPage from "@/pages/auth-page";
// Dashboard Pages
import AllocationsPage from "@/pages/dashboard/allocations-page";
import OrganizationPage from "@/pages/dashboard/organization-page";
import OverviewPage from "@/pages/dashboard/overview-page";
import PreferencesPage from "@/pages/dashboard/preferences-page";
import TeachersPage from "@/pages/dashboard/teachers-page";
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
