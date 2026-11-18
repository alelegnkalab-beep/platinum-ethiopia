REVOKE ALL ON public.payo_bids FROM anon, authenticated;
GRANT SELECT (id, product_id, status, verified_at, created_at) ON public.payo_bids TO anon, authenticated;
GRANT ALL ON public.payo_bids TO service_role;