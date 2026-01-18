import { Mail, Phone, Building2, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/core/contexts";

export default function OrganizationPendingPage() {
  const [, setLocation] = useLocation();
  const { logout, organization } = useUser();

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-amber-500 to-orange-500 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Organization Pending Approval</CardTitle>
          <CardDescription className="text-amber-100">
            Your organization is not yet approved
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          {organization && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-900">{organization.name}</span>
              </div>
              <p className="text-sm text-amber-700">
                Your organization registration is currently under review. Please contact Educard
                Administration for assistance.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Educard Administration</h3>

            <div className="space-y-3">
              <a
                href="mailto:support@educard.com"
                className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3 transition-colors hover:bg-blue-100"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Email Support</p>
                  <p className="text-sm text-blue-700">support@educard.com</p>
                </div>
              </a>

              <a
                href="tel:+1800123456"
                className="flex items-center space-x-3 rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100"
              >
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Phone Support</p>
                  <p className="text-sm text-green-700">+1 (800) 123-456</p>
                </div>
              </a>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
