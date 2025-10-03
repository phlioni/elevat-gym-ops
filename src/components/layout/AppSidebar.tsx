import { Home, Users, Package, ShoppingCart, Settings, Menu, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";

const menuItems = [
  { title: "Painel de Controle", url: "/dashboard", icon: Home, requireAdmin: false },
  { title: "Alunos", url: "/students", icon: Users, requireAdmin: false },
  { title: "Estoque", url: "/inventory", icon: Package, requireAdmin: false },
  { title: "Vendas", url: "/sales", icon: ShoppingCart, requireAdmin: false },
  { title: "Configurações", url: "/settings", icon: Settings, requireAdmin: true },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { data: userRole } = useUserRole();
  const { data: profile } = useProfile();

  const filteredMenuItems = menuItems.filter(item => 
    !item.requireAdmin || userRole?.isAdmin
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo/Brand Area */}
        <div className="p-4 border-b border-sidebar-border">
          {open ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">GH</span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-sidebar-foreground">GymHub</span>
                <span className="text-xs text-sidebar-foreground/70">
                  {profile?.tenants?.name || "Academia"}
                </span>
              </div>
              {userRole?.isAdmin && (
                <div title="Admin">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-lg">GH</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
