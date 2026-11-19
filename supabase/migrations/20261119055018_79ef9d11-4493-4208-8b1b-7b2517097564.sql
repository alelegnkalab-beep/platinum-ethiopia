DROP POLICY IF EXISTS "Anyone can view bid summaries" ON public.payo_bids;
DROP POLICY IF EXISTS "Anyone can check a deposit status" ON public.payo_deposits;
REVOKE ALL ON public.payo_bids FROM anon, authenticated;
REVOKE ALL ON public.payo_deposits FROM anon, authenticated;
GRANT ALL ON public.payo_bids TO service_role;
GRANT ALL ON public.payo_deposits TO service_role;