import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusVariant = () => {
    switch (status.toLowerCase()) {
      case "active":
      case "ativo":
      case "paid":
      case "pago":
      case "in_stock":
      case "em estoque":
        return "bg-success text-success-foreground";
      case "pending":
      case "pendente":
      case "low_stock":
      case "baixo estoque":
        return "bg-warning text-warning-foreground";
      case "inactive":
      case "inativo":
      case "overdue":
      case "atrasado":
      case "out_of_stock":
      case "esgotado":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "pending":
        return "Pendente";
      case "paid":
        return "Pago";
      case "overdue":
        return "Atrasado";
      case "in_stock":
        return "Em Estoque";
      case "low_stock":
        return "Baixo Estoque";
      case "out_of_stock":
        return "Esgotado";
      default:
        return status;
    }
  };

  return (
    <Badge className={cn(getStatusVariant(), className)}>
      {getStatusLabel()}
    </Badge>
  );
};
