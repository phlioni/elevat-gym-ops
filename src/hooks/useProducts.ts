import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export const useProducts = () => {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("tenant_id", profile?.tenant_id)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  const createProduct = useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...product, tenant_id: profile?.tenant_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: any) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar produto");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir produto");
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    createProduct: createProduct.mutate,
    updateProduct: updateProduct.mutate,
    deleteProduct: deleteProduct.mutate,
  };
};
