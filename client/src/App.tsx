import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
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
      <Route path="/dashboard" component={OverviewPage} />
      <Route path="/allocations" component={AllocationsPage} />
      <Route path="/allocations/:id" component={AllocationsPage} />
      <Route path="/organization" component={OrganizationPage} />
      <Route path="/preferences" component={PreferencesPage} />
      <Route path="/teachers" component={TeachersPage} />
      <Route path="/teachers/:id" component={TeachersPage} />
      <Route path="/organization-pending" component={OrganizationPendingPage} />
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
