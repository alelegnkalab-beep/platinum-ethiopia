CREATE TABLE public.payo_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  depositor_name text NOT NULL,
  depositor_phone text NOT NULL,
  amount_etb numeric(12,2) NOT NULL CHECK (amount_etb > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','expired')),
  payo_order_id text UNIQUE,
  payment_url text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.payo_deposits FROM anon, authenticated;
GRANT SELECT (id, status, verified_at, created_at) ON public.payo_deposits TO anon, authenticated;
GRANT ALL ON public.payo_deposits TO service_role;
ALTER TABLE public.payo_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can check a deposit status" ON public.payo_deposits FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX payo_deposits_phone_status_idx ON public.payo_deposits (depositor_phone, status);
CREATE TRIGGER update_payo_deposits_updated_at BEFORE UPDATE ON public.payo_deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();