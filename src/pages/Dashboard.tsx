import { MetricCard } from "@/components/MetricCard";
import { Users, DollarSign, AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStats, useRecentPayments, useBirthdaysThisMonth } from "@/hooks/useDashboard";
import { useProfile } from "@/hooks/useProfile";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: stats } = useDashboardStats();
  const { data: recentPayments } = useRecentPayments();
  const { data: birthdays } = useBirthdaysThisMonth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, {profile?.full_name}</h1>
        <p className="text-muted-foreground">{profile?.tenants?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Alunos Ativos"
          value={stats?.activeStudents || 0}
          icon={Users}
          iconColor="text-success"
        />
        <MetricCard
          title="Receita do Mês"
          value={`R$ ${(stats?.monthlyRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-primary"
        />
        <MetricCard
          title="Pagamentos Pendentes"
          value={stats?.pendingPayments || 0}
          icon={AlertTriangle}
          iconColor="text-warning"
        />
        <MetricCard
          title="Produtos em Baixo Estoque"
          value={stats?.lowStockProducts || 0}
          icon={Package}
          iconColor="text-destructive"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aniversariantes do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {birthdays && birthdays.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {birthdays.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.full_name}</TableCell>
                      <TableCell>
                        {new Date(item.birth_date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum aniversariante este mês
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments && recentPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.students?.full_name}</TableCell>
                      <TableCell>R$ {Number(item.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum pagamento registrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
