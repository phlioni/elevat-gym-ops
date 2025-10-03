-- Permitir admins gerenciar tenants
DROP POLICY IF EXISTS "Admins can update their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;

CREATE POLICY "Admins can manage all tenants"
ON public.tenants
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own tenant"
ON public.tenants
FOR SELECT
USING (id = get_user_tenant_id(auth.uid()));

-- Permitir admins gerenciar profiles de outros usuários
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in tenant" ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Função para atualizar tenant_id de um usuário
CREATE OR REPLACE FUNCTION public.update_user_tenant(user_email text, new_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT au.id INTO user_uuid 
  FROM auth.users au
  WHERE au.email = user_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
  
  UPDATE public.profiles
  SET tenant_id = new_tenant_id
  WHERE id = user_uuid;
END;
$$;