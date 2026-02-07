/**
 * Profile Settings Page
 * Comprehensive profile management with tabs for different sections
 */

import { User, Lock, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/common/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressUpdateForm } from "../components/address-update-form";
import { EmailUpdateForm } from "../components/email-update-form";
import { PasswordChangeForm } from "../components/password-change-form";
import { PhoneUpdateForm } from "../components/phone-update-form";
import { ProfileInformationForm } from "../components/profile-information-form";

export function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-base text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="password" className="gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Password</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Phone</span>
                </TabsTrigger>
                <TabsTrigger value="address" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Address</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="mb-4 space-y-2">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <p className="text-sm text-gray-600">
                    Update your personal details and information
                  </p>
                </div>
                <ProfileInformationForm />
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <div className="mb-4 space-y-2">
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <p className="text-sm text-gray-600">
                    Update your password to keep your account secure
                  </p>
                </div>
                <PasswordChangeForm />
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="mb-4 space-y-2">
                  <h2 className="text-xl font-semibold">Update Email Address</h2>
                  <p className="text-sm text-gray-600">
                    Change your email address with OTP verification
                  </p>
                </div>
                <EmailUpdateForm />
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="mb-4 space-y-2">
                  <h2 className="text-xl font-semibold">Update Phone Number</h2>
                  <p className="text-sm text-gray-600">
                    Change your phone number with OTP verification
                  </p>
                </div>
                <PhoneUpdateForm />
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="mb-4 space-y-2">
                  <h2 className="text-xl font-semibold">Address Information</h2>
                  <p className="text-sm text-gray-600">Update your residential address details</p>
                </div>
                <AddressUpdateForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
