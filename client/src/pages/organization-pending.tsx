import { Mail, Phone, Building2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useUser } from "@/context/user-context";

export default function OrganizationPendingPage() {
  const [, setLocation] = useLocation();
  const { logout, organization } = useUser();

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Organization Pending Approval</CardTitle>
          <CardDescription className="text-amber-100">
            Your organization is not yet approved
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {organization && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-900">{organization.name}</span>
              </div>
              <p className="text-sm text-amber-700">
                Your organization registration is currently under review. 
                Please contact Educard Administration for assistance.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Educard Administration</h3>
            
            <div className="space-y-3">
              <a 
                href="mailto:support@educard.com" 
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Email Support</p>
                  <p className="text-sm text-blue-700">support@educard.com</p>
                </div>
              </a>
              
              <a 
                href="tel:+1800123456" 
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Phone Support</p>
                  <p className="text-sm text-green-700">+1 (800) 123-456</p>
                </div>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t">
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
