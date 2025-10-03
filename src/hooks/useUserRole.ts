import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const roles = data?.map((r) => r.role) || [];
      
      return {
        roles,
        isAdmin: roles.includes("admin"),
        isStaff: roles.includes("staff"),
      };
    },
    enabled: !!user,
  });
};
