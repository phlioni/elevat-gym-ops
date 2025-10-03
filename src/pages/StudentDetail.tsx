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

const mockStudent = {
  name: "Carlos Silva",
  email: "carlos@email.com",
  phone: "(11) 98765-4321",
  cpf: "123.456.789-00",
  birthDate: "15/03/1990",
  address: "Rua Exemplo, 123 - São Paulo, SP",
  plan: "Mensal",
  startDate: "01/01/2024",
  status: "active",
};

const mockPayments = [
  {
    id: "1",
    description: "Mensalidade Janeiro",
    dueDate: "05/01/2025",
    amount: "R$ 150,00",
    status: "paid",
    paymentDate: "03/01/2025",
  },
  {
    id: "2",
    description: "Mensalidade Fevereiro",
    dueDate: "05/02/2025",
    amount: "R$ 150,00",
    status: "paid",
    paymentDate: "02/02/2025",
  },
  {
    id: "3",
    description: "Mensalidade Março",
    dueDate: "05/03/2025",
    amount: "R$ 150,00",
    status: "pending",
    paymentDate: null,
  },
];

export default function StudentDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{mockStudent.name}</h1>
          <StatusBadge status={mockStudent.status} />
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
                <p className="font-medium">{mockStudent.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{mockStudent.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{mockStudent.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{mockStudent.birthDate}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{mockStudent.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plano Contratado</p>
                <p className="font-medium">{mockStudent.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">{mockStudent.startDate}</p>
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
                  {mockPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>{payment.paymentDate || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
