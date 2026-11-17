CREATE TABLE public.payo_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  bidder_name text NOT NULL,
  bidder_phone text NOT NULL,
  amount_etb numeric(12,2) NOT NULL CHECK (amount_etb > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','expired')),
  payo_order_id text UNIQUE,
  payment_url text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payo_bids_product_status_idx ON public.payo_bids (product_id, status, amount_etb DESC);
CREATE INDEX payo_bids_phone_created_idx ON public.payo_bids (bidder_phone, created_at DESC);

GRANT SELECT (id, product_id, bidder_name, amount_etb, status, verified_at, created_at) ON public.payo_bids TO anon, authenticated;
GRANT ALL ON public.payo_bids TO service_role;

ALTER TABLE public.payo_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bid summaries"
ON public.payo_bids FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_payo_bids_updated_at
BEFORE UPDATE ON public.payo_bids
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();