import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  primary_color: string;
  logo_url: string | null;
}

export default function AdminTenants() {
  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    primary_color: "#3b82f6",
    logo_url: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Tenant[];
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenant: Omit<Tenant, "id">) => {
      const { error } = await supabase.from("tenants").insert([tenant]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, ...tenant }: Tenant) => {
      const { error } = await supabase
        .from("tenants")
        .update(tenant)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({
        title: "Sucesso",
        description: "Grupo atualizado com sucesso!",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTenant) {
      updateTenantMutation.mutate({
        id: editingTenant.id,
        name: formData.name,
        primary_color: formData.primary_color,
        logo_url: formData.logo_url || null,
      });
    } else {
      createTenantMutation.mutate({
        name: formData.name,
        primary_color: formData.primary_color,
        logo_url: formData.logo_url || null,
      });
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      primary_color: tenant.primary_color,
      logo_url: tenant.logo_url || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTenant(null);
    setFormData({
      name: "",
      primary_color: "#3b82f6",
      logo_url: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando grupos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Grupos</h1>
          <p className="text-muted-foreground mt-1">
            Configure grupos e suas personalizações visuais
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cor Principal</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants?.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: tenant.primary_color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tenant.primary_color}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {tenant.logo_url ? (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.name}
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem logo</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tenant)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? "Editar Grupo" : "Novo Grupo"}
            </DialogTitle>
            <DialogDescription>
              Configure o nome, cor e logo do grupo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Grupo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Ex: Academia Premium"
                />
              </div>
              <div>
                <Label htmlFor="color">Cor Principal *</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                    className="w-20 h-10"
                    required
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="logo">URL da Logo</Label>
                <Input
                  id="logo"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTenant ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
