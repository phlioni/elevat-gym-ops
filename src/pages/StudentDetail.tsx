import { useParams } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus } from "lucide-react";
import { useStudent, useStudentPayments } from "@/hooks/useStudents";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id || "");
  const { data: payments } = useStudentPayments(id || "");

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!student) {
    return <div className="text-center py-8">Aluno não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{student.full_name}</h1>
          <StatusBadge status={student.status} />
        </div>
        <Button>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="payments">Histórico de Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{student.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{student.cpf || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">
                  {student.birth_date
                    ? new Date(student.birth_date).toLocaleDateString("pt-BR")
                    : "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{student.address || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plano Contratado</p>
                <p className="font-medium">{student.plans?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">
                  {student.start_date
                    ? new Date(student.start_date).toLocaleDateString("pt-BR")
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Pagamento
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {payments && payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Valor (R$)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data do Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>
                          {new Date(payment.due_date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>R$ {Number(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell>
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum pagamento registrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
