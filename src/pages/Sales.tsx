import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function Sales() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { user } = useAuth();

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity")
        .eq("status", "in_stock")
        .gt("stock_quantity", 0)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async () => {
      if (items.length === 0) {
        throw new Error("Adicione pelo menos um produto à venda");
      }
      if (!paymentMethod) {
        throw new Error("Selecione um método de pagamento");
      }

      const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            tenant_id: profile?.tenant_id,
            student_id: selectedStudent || null,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = items.map((item) => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Atualizar estoque
      for (const item of items) {
        const product = products?.find((p) => p.id === item.product_id);
        if (product) {
          await supabase
            .from("products")
            .update({ stock_quantity: product.stock_quantity - item.quantity })
            .eq("id", item.product_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Venda Concluída!",
        description: "Venda registrada com sucesso.",
      });
      // Reset form
      setSelectedStudent("");
      setSelectedProduct("");
      setQuantity(1);
      setPaymentMethod("");
      setItems([]);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    const product = products?.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (quantity > product.stock_quantity) {
      toast({
        title: "Erro",
        description: "Quantidade maior que o estoque disponível",
        variant: "destructive",
      });
      return;
    }

    const existingItem = items.find((item) => item.product_id === selectedProduct);
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === selectedProduct
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total_price: (item.quantity + quantity) * item.unit_price,
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: Number(product.price),
          total_price: quantity * Number(product.price),
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.product_id !== productId));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registro de Venda</h1>
          <p className="text-muted-foreground">Controle rápido de saída de produtos</p>
        </div>
        <Button
          onClick={() => createSaleMutation.mutate()}
          disabled={items.length === 0 || !paymentMethod}
          size="lg"
          className="gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Finalizar Venda
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar produto..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {Number(product.price).toFixed(2)} (Estoque:{" "}
                      {product.stock_quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Aluno (Opcional)</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Venda avulsa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Venda avulsa</SelectItem>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Método de Pagamento *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar método..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens da Venda</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum item adicionado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell className="font-medium">
                      {item.product_name}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {item.total_price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
