import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useTenantTheme } from "@/hooks/useTenantTheme";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: userRole } = useUserRole();
  useTenantTheme(); // Apply tenant theme

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{profile?.full_name}</span>
                    {userRole?.isAdmin && (
                      <Badge variant="default" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
