import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/user-context";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import NotFound from "@/pages/not-found";
import OrganizationPendingPage from "@/pages/organization-pending";
import RegistrationSuccess from "@/pages/registration-success";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/auth" />} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/registration-success" component={RegistrationSuccess} />
      <Route path="/dashboard" component={DashboardPage} />
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
