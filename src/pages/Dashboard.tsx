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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jul", students: 12 },
  { month: "Ago", students: 19 },
  { month: "Set", students: 15 },
  { month: "Out", students: 22 },
  { month: "Nov", students: 28 },
  { month: "Dez", students: 31 },
];

const birthdays = [
  { name: "Carlos Silva", date: "15/12" },
  { name: "Maria Santos", date: "18/12" },
  { name: "João Oliveira", date: "22/12" },
];

const recentPayments = [
  { student: "Carlos Silva", amount: "R$ 150,00", date: "01/12/2025" },
  { student: "Maria Santos", amount: "R$ 150,00", date: "01/12/2025" },
  { student: "João Oliveira", amount: "R$ 200,00", date: "02/12/2025" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, Admin</h1>
        <p className="text-muted-foreground">Academia Exemplo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Alunos Ativos"
          value="127"
          icon={Users}
          iconColor="text-success"
        />
        <MetricCard
          title="Receita do Mês"
          value="R$ 18.450"
          icon={DollarSign}
          iconColor="text-primary"
        />
        <MetricCard
          title="Pagamentos Pendentes"
          value="8"
          icon={AlertTriangle}
          iconColor="text-warning"
        />
        <MetricCard
          title="Produtos em Baixo Estoque"
          value="3"
          icon={Package}
          iconColor="text-destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novos Alunos (Últimos 6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip />
              <Bar dataKey="students" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aniversariantes do Mês</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{item.student}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
