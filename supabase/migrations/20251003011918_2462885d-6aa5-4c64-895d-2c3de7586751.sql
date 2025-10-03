-- Função auxiliar para adicionar role de admin a um usuário
CREATE OR REPLACE FUNCTION public.add_admin_role(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
  
  -- Inserir role de admin (ignorar se já existir)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Função auxiliar para adicionar role de staff a um usuário
CREATE OR REPLACE FUNCTION public.add_staff_role(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, 'staff')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Políticas RLS aprimoradas para Admins

-- Admins podem ver todos os perfis do seu tenant
CREATE POLICY "Admins can view all profiles in tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') AND
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Admins podem criar novos perfis
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Políticas para user_roles
CREATE POLICY "Admins can view all roles in tenant"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    user_id = auth.uid()
  );

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Criar alguns alunos de exemplo para o tenant padrão
INSERT INTO public.students (tenant_id, full_name, email, phone, cpf, birth_date, address, plan_id, status)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Carlos Silva',
    'carlos.silva@email.com',
    '(11) 98765-4321',
    '123.456.789-00',
    '1990-03-15',
    'Rua das Flores, 123 - São Paulo, SP',
    (SELECT id FROM public.plans WHERE name = 'Mensal' LIMIT 1),
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Maria Santos',
    'maria.santos@email.com',
    '(11) 91234-5678',
    '987.654.321-00',
    '1985-07-22',
    'Av. Paulista, 456 - São Paulo, SP',
    (SELECT id FROM public.plans WHERE name = 'Trimestral' LIMIT 1),
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'João Oliveira',
    'joao.oliveira@email.com',
    '(11) 99876-5432',
    '456.789.123-00',
    '1992-11-08',
    'Rua Augusta, 789 - São Paulo, SP',
    (SELECT id FROM public.plans WHERE name = 'Anual' LIMIT 1),
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Ana Costa',
    'ana.costa@email.com',
    '(11) 97654-3210',
    '321.654.987-00',
    '1995-12-18',
    'Rua dos Pinheiros, 321 - São Paulo, SP',
    (SELECT id FROM public.plans WHERE name = 'Semestral' LIMIT 1),
    'pending'
  )
ON CONFLICT DO NOTHING;

-- Criar alguns pagamentos de exemplo
INSERT INTO public.payments (tenant_id, student_id, description, amount, due_date, payment_date, status)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  s.id,
  'Mensalidade Janeiro 2025',
  p.price,
  '2025-01-05',
  '2025-01-03',
  'paid'
FROM public.students s
JOIN public.plans p ON s.plan_id = p.id
WHERE s.email IN ('carlos.silva@email.com', 'maria.santos@email.com', 'joao.oliveira@email.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.payments (tenant_id, student_id, description, amount, due_date, payment_date, status)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  s.id,
  'Mensalidade Fevereiro 2025',
  p.price,
  '2025-02-05',
  '2025-02-02',
  'paid'
FROM public.students s
JOIN public.plans p ON s.plan_id = p.id
WHERE s.email IN ('carlos.silva@email.com', 'maria.santos@email.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.payments (tenant_id, student_id, description, amount, due_date, status)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  s.id,
  'Mensalidade Março 2025',
  p.price,
  '2025-03-05',
  'pending'
FROM public.students s
JOIN public.plans p ON s.plan_id = p.id
WHERE s.email = 'ana.costa@email.com'
ON CONFLICT DO NOTHING;

-- Comentário importante sobre criação do usuário admin
COMMENT ON FUNCTION public.add_admin_role IS 
'Função para adicionar role de admin a um usuário. 
IMPORTANTE: Primeiro crie o usuário no Supabase Auth com email admin@gymhub.com, 
depois execute: SELECT public.add_admin_role(''admin@gymhub.com'');';