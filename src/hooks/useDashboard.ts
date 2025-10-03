import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export const useDashboardStats = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["dashboard-stats", profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return null;

      // Count active students
      const { count: activeStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id)
        .eq("status", "active");

      // Sum of paid payments this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("tenant_id", profile.tenant_id)
        .eq("status", "paid")
        .gte("payment_date", startOfMonth.toISOString());

      const monthlyRevenue = monthlyPayments?.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      ) || 0;

      // Count pending payments
      const { count: pendingPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id)
        .eq("status", "pending");

      // Count low stock products
      const { count: lowStockProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id)
        .in("status", ["low_stock", "out_of_stock"]);

      return {
        activeStudents: activeStudents || 0,
        monthlyRevenue,
        pendingPayments: pendingPayments || 0,
        lowStockProducts: lowStockProducts || 0,
      };
    },
    enabled: !!profile?.tenant_id,
  });
};

export const useRecentPayments = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["recent-payments", profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, students(full_name)")
        .eq("tenant_id", profile?.tenant_id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });
};

export const useBirthdaysThisMonth = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["birthdays", profile?.tenant_id],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      
      const { data, error } = await supabase
        .from("students")
        .select("full_name, birth_date")
        .eq("tenant_id", profile?.tenant_id)
        .not("birth_date", "is", null);

      if (error) throw error;

      // Filter by current month on client side
      return data?.filter((student) => {
        if (!student.birth_date) return false;
        const birthMonth = new Date(student.birth_date).getMonth() + 1;
        return birthMonth === currentMonth;
      }) || [];
    },
    enabled: !!profile?.tenant_id,
  });
};
