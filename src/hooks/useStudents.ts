import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export const useStudents = () => {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ["students", profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, plans(*)")
        .eq("tenant_id", profile?.tenant_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  const createStudent = useMutation({
    mutationFn: async (student: any) => {
      const { data, error } = await supabase
        .from("students")
        .insert([{ ...student, tenant_id: profile?.tenant_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar aluno");
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...student }: any) => {
      const { data, error } = await supabase
        .from("students")
        .update(student)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar aluno");
    },
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    createStudent: createStudent.mutate,
    updateStudent: updateStudent.mutate,
  };
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, plans(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useStudentPayments = (studentId: string) => {
  return useQuery({
    queryKey: ["payments", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", studentId)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
};
