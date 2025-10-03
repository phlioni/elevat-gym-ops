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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  tenant_id: string;
  tenants: {
    name: string;
  };
  user_roles: Array<{
    role: string;
  }>;
}

interface Tenant {
  id: string;
  name: string;
}

export default function AdminUsers() {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    tenant_id: "",
    role: "staff" as "admin" | "staff",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, tenants(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user roles separately
      const profilesWithRoles = await Promise.all(
        data.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            ...profile,
            user_roles: rolesData || [],
          };
        })
      );

      return profilesWithRoles as Profile[];
    },
  });

  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data as Tenant[];
    },
  });

  const updateUserTenantMutation = useMutation({
    mutationFn: async ({ userId, tenantId }: { userId: string; tenantId: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ tenant_id: tenantId })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast({
        title: "Sucesso",
        description: "Grupo do usuário atualizado com sucesso!",
      });
      setOpen(false);
      setEditingUser(null);
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

    if (editingUser) {
      updateUserTenantMutation.mutate({
        userId: editingUser.id,
        tenantId: formData.tenant_id,
      });
    }
  };

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: "",
      tenant_id: user.tenant_id,
      role: user.user_roles?.[0]?.role as "admin" | "staff" || "staff",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      full_name: "",
      password: "",
      tenant_id: "",
      role: "staff",
    });
  };

  if (loadingProfiles) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários e seus grupos
          </p>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.full_name}</TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.tenants?.name}</TableCell>
                <TableCell>
                  <span className="capitalize">
                    {profile.user_roles?.[0]?.role || "staff"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(profile)}
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
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere o grupo do usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={formData.full_name} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.email} disabled />
              </div>
              <div>
                <Label htmlFor="tenant">Grupo *</Label>
                <Select
                  value={formData.tenant_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tenant_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
