-- Seed inicial do GymHub
-- IMPORTANTE: Após executar esta migration, você precisará criar manualmente o usuário no Supabase Auth
-- Email: admin@gymhub.com
-- Senha: Admin123!

-- Criar tenant padrão
INSERT INTO public.tenants (id, name, logo_url, primary_color)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Academia Xtreme Fit', null, '#3b82f6')
ON CONFLICT (id) DO NOTHING;

-- Criar trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil para o novo usuário
  -- Por padrão, associa ao primeiro tenant encontrado
  INSERT INTO public.profiles (id, tenant_id, full_name, email)
  VALUES (
    NEW.id,
    (SELECT id FROM public.tenants LIMIT 1),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Criar trigger que executa quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar planos de exemplo
INSERT INTO public.plans (tenant_id, name, description, price, duration_months)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Mensal', 'Plano mensal básico', 150.00, 1),
  ('00000000-0000-0000-0000-000000000001', 'Trimestral', 'Plano trimestral com desconto', 400.00, 3),
  ('00000000-0000-0000-0000-000000000001', 'Semestral', 'Plano semestral com desconto', 750.00, 6),
  ('00000000-0000-0000-0000-000000000001', 'Anual', 'Plano anual com maior desconto', 1400.00, 12)
ON CONFLICT DO NOTHING;

-- Criar produtos de exemplo
INSERT INTO public.products (tenant_id, name, description, price, stock_quantity, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Camiseta Academia', 'Camiseta dry-fit preta', 49.90, 25, 'in_stock'),
  ('00000000-0000-0000-0000-000000000001', 'Shaker Proteína', 'Coqueteleira 600ml', 29.90, 5, 'low_stock'),
  ('00000000-0000-0000-0000-000000000001', 'Toalha Esportiva', 'Toalha microfibra', 39.90, 0, 'out_of_stock'),
  ('00000000-0000-0000-0000-000000000001', 'Garrafa de Água', 'Garrafa 1L', 35.00, 15, 'in_stock'),
  ('00000000-0000-0000-0000-000000000001', 'Luvas de Treino', 'Luvas fitness', 79.90, 8, 'in_stock')
ON CONFLICT DO NOTHING;

-- Criar políticas adicionais para permitir inserção de perfis
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir que usuários autenticados vejam tenants
CREATE POLICY "Authenticated users can view tenants"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (true);