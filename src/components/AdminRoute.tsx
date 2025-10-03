import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { data: userRole, isLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !userRole?.isAdmin) {
      navigate("/dashboard");
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando permissões...</div>
      </div>
    );
  }

  if (!userRole?.isAdmin) {
    return null;
  }

  return <>{children}</>;
};
