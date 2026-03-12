import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Icons } from "@/components/icons";
import { Settings } from "lucide-react";

const Profile: React.FC = () => {
  const { user } = useUser();

  return (
    <main className="flex flex-col flex-1 gap-2 p-2 md:gap-2 md:p-3 h-[calc(100vh-50px)] overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
          <Button asChild variant="outline" size="sm" className="gap-2 border-[#5F259F] text-[#5F259F] hover:bg-[#5F259F]/10">
            <Link to="/profile/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800">Account</CardTitle>
            <CardDescription>Your profile and identity information.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
              <AvatarFallback className="bg-[#5F259F]/20 text-[#5F259F]">
                {(user?.username ?? "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div>
                <p className="text-sm font-medium text-slate-500">Username</p>
                <p className="text-slate-800">{user?.username ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">CRN Type</p>
                <p className="text-slate-800">{user?.crn_type ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">CRN ID</p>
                <p className="text-slate-800 font-mono text-sm">{user?.crn_id ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Icons.person className="h-5 w-5" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/profile/settings">
                  <Settings className="h-4 w-4" />
                  API &amp; Settings
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/change-password">Change password</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Profile;
